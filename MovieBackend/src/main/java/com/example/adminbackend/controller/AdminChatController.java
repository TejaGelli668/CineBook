package com.example.adminbackend.controller;

import com.example.adminbackend.agent.AgentContext;
import com.example.adminbackend.agent.AgentEngine;
import com.example.adminbackend.agent.AgentProfile;
import com.example.adminbackend.agent.AgentSession;
import com.example.adminbackend.agent.ManagerTools;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

/** The manager's assistant on the admin desk. Admin-only (see /api/admin/** in SecurityConfig). */
@RestController
@RequestMapping("/api/admin/chat")
public class AdminChatController {

    private static final Logger log = LoggerFactory.getLogger(AdminChatController.class);
    private static final Pattern SESSION_ID = Pattern.compile("[A-Za-z0-9-]{8,64}");

    private final AgentEngine engine;
    private final ManagerTools manager;
    private final ExecutorService workers = Executors.newFixedThreadPool(2);

    public AdminChatController(AgentEngine engine, ManagerTools manager) {
        this.engine = engine;
        this.manager = manager;
    }

    public record ChatRequest(String message, String sessionId) {}

    public record ConfirmRequest(String sessionId, String proposalId) {}

    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> chat(@RequestBody ChatRequest body) {
        SseEmitter emitter = new SseEmitter(120_000L);
        String message = body.message() == null ? "" : body.message().trim();
        if (message.isEmpty() || body.sessionId() == null || !SESSION_ID.matcher(body.sessionId()).matches()) {
            ChatController.send(emitter, "error", Map.of("text", "Type a question to get started."));
            emitter.complete();
            return ResponseEntity.badRequest().body(emitter);
        }
        if (message.length() > 800) message = message.substring(0, 800);
        String admin = adminName();
        if (!engine.allow("admin:" + admin)) {
            ChatController.send(emitter, "error", Map.of("text", "That's a lot of questions at once. Give it a few minutes."));
            emitter.complete();
            return ResponseEntity.status(429).body(emitter);
        }
        AgentSession session = engine.session(key(body.sessionId(), admin), null);
        AgentContext ctx = new AgentContext(null, "admin", null, session);
        String question = message;
        workers.submit(() -> {
            try {
                engine.ask(manager, ctx, question, new AgentEngine.Events() {
                    @Override
                    public void status(String text) {
                        ChatController.send(emitter, "status", Map.of("text", text));
                    }

                    @Override
                    public void reply(String text, List<JsonNode> cards, List<String> suggestions) {
                        ChatController.send(emitter, "reply", Map.of("text", text, "cards", cards, "suggestions", suggestions));
                    }

                    @Override
                    public void error(String text) {
                        ChatController.send(emitter, "error", Map.of("text", text));
                    }
                });
            } catch (Exception e) {
                log.error("Manager assistant failed", e);
                ChatController.send(emitter, "error", Map.of("text", "Something went wrong. Try again."));
            } finally {
                emitter.complete();
            }
        });
        return ResponseEntity.ok().header("Cache-Control", "no-cache").header("X-Accel-Buffering", "no").body(emitter);
    }

    /** The manager tapped Confirm on a proposal card (import a film, create shows). */
    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirm(@RequestBody ConfirmRequest body) {
        if (body.sessionId() == null || !SESSION_ID.matcher(body.sessionId()).matches() || body.proposalId() == null) {
            return ResponseEntity.badRequest().body(Map.of("text", "That button has expired. Ask again."));
        }
        AgentSession session = engine.session(key(body.sessionId(), adminName()), null);
        try {
            AgentProfile.Outcome o = engine.confirm(manager, new AgentContext(null, "admin", null, session), body.proposalId());
            Map<String, Object> res = new HashMap<>();
            res.put("text", o.text());
            res.put("card", o.card());
            res.put("changed", true);
            return ResponseEntity.ok(res);
        } catch (AgentEngine.ConfirmException e) {
            return ResponseEntity.status(e.status).body(Map.of("text", e.getMessage()));
        } catch (RuntimeException e) {
            log.error("Manager action failed", e);
            return ResponseEntity.status(500).body(Map.of("text", "That didn't work: " + e.getMessage()));
        }
    }

    private static String key(String sessionId, String admin) {
        return "admin:" + admin + ":" + sessionId;
    }

    private static String adminName() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null ? "admin" : auth.getName();
    }
}
