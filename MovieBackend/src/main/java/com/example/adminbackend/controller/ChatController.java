package com.example.adminbackend.controller;

import com.example.adminbackend.agent.AgentContext;
import com.example.adminbackend.agent.AgentEngine;
import com.example.adminbackend.agent.AgentProfile;
import com.example.adminbackend.agent.AgentSession;
import com.example.adminbackend.agent.ConciergeTools;
import com.example.adminbackend.entity.User;
import com.example.adminbackend.service.CurrentUserService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

/**
 * The customer chat window talks to the concierge here. Questions stream back
 * as server-sent events ("status" while tools run, then "reply" or "error").
 * Actions the concierge proposes run only through /confirm, as the signed-in customer.
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private static final int MAX_MESSAGE = 600;
    private static final Pattern SESSION_ID = Pattern.compile("[A-Za-z0-9-]{8,64}");

    private final AgentEngine engine;
    private final ConciergeTools concierge;
    private final CurrentUserService currentUser;
    private final ExecutorService workers = Executors.newFixedThreadPool(6);

    public ChatController(AgentEngine engine, ConciergeTools concierge, CurrentUserService currentUser) {
        this.engine = engine;
        this.concierge = concierge;
        this.currentUser = currentUser;
    }

    public record ChatRequest(String message, String sessionId, String page, Long movieId, String movieTitle) {}

    public record ConfirmRequest(String sessionId, String proposalId) {}

    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> chat(@RequestBody ChatRequest body, HttpServletRequest request) {
        SseEmitter emitter = new SseEmitter(120_000L);
        String message = body.message() == null ? "" : body.message().trim();

        if (message.isEmpty() || body.sessionId() == null || !SESSION_ID.matcher(body.sessionId()).matches()) {
            send(emitter, "error", Map.of("text", "Type a question to get started."));
            emitter.complete();
            return ResponseEntity.badRequest().body(emitter);
        }
        if (message.length() > MAX_MESSAGE) message = message.substring(0, MAX_MESSAGE);

        // Who is asking comes from the sign-in token, resolved on this thread
        Long userId = signedInCustomer();
        String who = userId != null ? "user:" + userId : "ip:" + request.getRemoteAddr();
        if (!engine.allow(who)) {
            send(emitter, "error", Map.of("text", "That's a lot of questions at once. Give it a few minutes and ask again."));
            emitter.complete();
            return ResponseEntity.status(429).body(emitter);
        }

        AgentSession session = engine.session(key(body.sessionId(), userId), key(body.sessionId(), null));
        AgentContext ctx = new AgentContext(userId, body.page(), body.movieTitle(), session);
        String question = message;

        // The worker runs as this customer, so seat tools act on their behalf
        workers.submit(DelegatingSecurityContextRunnable.create(() -> {
            try {
                engine.ask(concierge, ctx, question, new AgentEngine.Events() {
                    @Override
                    public void status(String text) {
                        send(emitter, "status", Map.of("text", text));
                    }

                    @Override
                    public void reply(String text, List<JsonNode> cards, List<String> suggestions) {
                        send(emitter, "reply", Map.of("text", text, "cards", cards, "suggestions", suggestions));
                    }

                    @Override
                    public void error(String text) {
                        send(emitter, "error", Map.of("text", text));
                    }
                });
            } catch (Exception e) {
                log.error("Concierge failed", e);
                send(emitter, "error", Map.of("text", "Something went wrong on our side. Try again."));
            } finally {
                emitter.complete();
            }
        }, null));
        return ResponseEntity.ok().header("Cache-Control", "no-cache").header("X-Accel-Buffering", "no").body(emitter);
    }

    /** The customer tapped Confirm (e.g. "Hold these seats") on a card. Requires sign-in. */
    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirm(@RequestBody ConfirmRequest body) {
        Long userId = signedInCustomer();
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("text", "Sign in to continue."));
        }
        if (body.sessionId() == null || !SESSION_ID.matcher(body.sessionId()).matches() || body.proposalId() == null) {
            return ResponseEntity.badRequest().body(Map.of("text", "That button has expired. Ask again."));
        }
        AgentSession session = engine.session(key(body.sessionId(), userId), key(body.sessionId(), null));
        try {
            AgentProfile.Outcome o = engine.confirm(concierge, new AgentContext(userId, null, null, session), body.proposalId());
            Map<String, Object> res = new HashMap<>();
            res.put("text", o.text());
            res.put("card", o.card());
            return ResponseEntity.ok(res);
        } catch (AgentEngine.ConfirmException e) {
            return ResponseEntity.status(e.status).body(Map.of("text", e.getMessage()));
        }
    }

    private static String key(String sessionId, Long userId) {
        return "customer:" + sessionId + ":" + (userId == null ? "guest" : userId);
    }

    private Long signedInCustomer() {
        try {
            User user = currentUser.require();
            return user.getId();
        } catch (Exception e) {
            return null; // guest, or a staff account
        }
    }

    static void send(SseEmitter emitter, String event, Object data) {
        try {
            emitter.send(SseEmitter.event().name(event).data(data, MediaType.APPLICATION_JSON));
        } catch (IOException | IllegalStateException e) {
            // the chat was closed; nothing to do
        }
    }
}
