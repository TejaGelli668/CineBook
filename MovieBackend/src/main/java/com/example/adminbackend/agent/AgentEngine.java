package com.example.adminbackend.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Runs an assistant (an {@link AgentProfile}) on Gemini: it calls tools until it
 * can answer, remembers the conversation, and keeps actions that change
 * something as proposals until the person confirms them.
 */
@Service
public class AgentEngine {

    private static final Logger log = LoggerFactory.getLogger(AgentEngine.class);

    private static final int MAX_STEPS = 6;               // model calls per question
    private static final int MAX_HISTORY = 28;            // content entries kept per conversation
    private static final long SESSION_IDLE_MS = 45 * 60 * 1000L;
    private static final int RATE_LIMIT = 15;             // questions...
    private static final long RATE_WINDOW_MS = 5 * 60 * 1000L; // ...per 5 minutes

    /** What the controller streams back to the browser. */
    public interface Events {
        void status(String text);

        void reply(String text, List<JsonNode> cards, List<String> suggestions);

        void error(String text);
    }

    public static class ConfirmException extends RuntimeException {
        public final int status;

        public ConfirmException(int status, String message) {
            super(message);
            this.status = status;
        }
    }

    private final Map<String, AgentSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, Deque<Long>> recent = new ConcurrentHashMap<>();
    private final ObjectMapper json = new ObjectMapper();
    private final GeminiClient gemini;

    public AgentEngine(GeminiClient gemini) {
        this.gemini = gemini;
    }

    /** False when this person has asked too much, too fast. */
    public boolean allow(String who) {
        long now = System.currentTimeMillis();
        Deque<Long> times = recent.computeIfAbsent(who, k -> new ArrayDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && now - times.peekFirst() > RATE_WINDOW_MS) times.pollFirst();
            if (times.size() >= RATE_LIMIT) return false;
            times.addLast(now);
            return true;
        }
    }

    /**
     * The conversation for this key. A guest who signs in mid-chat keeps their
     * conversation: {@code guestKey} is adopted into the signed-in key.
     */
    public AgentSession session(String key, String guestKey) {
        prune();
        AgentSession s = sessions.get(key);
        if (s == null && guestKey != null && !guestKey.equals(key)) {
            s = sessions.remove(guestKey);
            if (s != null) sessions.put(key, s);
        }
        if (s == null) s = sessions.computeIfAbsent(key, k -> new AgentSession(json.createArrayNode()));
        s.lastUsed = System.currentTimeMillis();
        return s;
    }

    public void ask(AgentProfile profile, AgentContext ctx, String message, Events events) {
        if (!gemini.configured()) {
            log.warn("Assistant is off: set GEMINI_API_KEY in .env");
            events.error("The CineBook assistant isn't switched on yet. You can still browse films and book from the page.");
            return;
        }
        AgentSession session = ctx.session();
        synchronized (session) {
            ArrayNode history = session.history;
            int rollback = history.size();
            ObjectNode userTurn = history.addObject();
            userTurn.put("role", "user");
            userTurn.putArray("parts").addObject().put("text", message);

            Map<String, JsonNode> cards = new LinkedHashMap<>(); // last card of each type wins
            List<String> usedTools = new ArrayList<>();
            try {
                String model = null; // keep one model for every step of this question
                for (int step = 0; step < MAX_STEPS; step++) {
                    boolean lastStep = step == MAX_STEPS - 1;
                    GeminiClient.Reply turn = gemini.generate(profile.systemPrompt(ctx), history,
                            lastStep ? json.createArrayNode() : profile.declarations(), model);
                    model = turn.model();
                    JsonNode content = turn.content();
                    history.add(content);

                    List<JsonNode> calls = new ArrayList<>();
                    StringBuilder text = new StringBuilder();
                    for (JsonNode part : content.path("parts")) {
                        if (part.has("functionCall")) calls.add(part.get("functionCall"));
                        else if (part.has("text") && !part.path("thought").asBoolean(false)) text.append(part.get("text").asText());
                    }

                    if (calls.isEmpty()) {
                        String reply = text.toString().trim();
                        if (reply.isEmpty()) reply = "Here's what I found.";
                        trim(history);
                        events.reply(reply, new ArrayList<>(cards.values()), profile.suggestions(usedTools, ctx));
                        return;
                    }

                    ObjectNode responses = json.createObjectNode();
                    responses.put("role", "user");
                    ArrayNode parts = responses.putArray("parts");
                    for (JsonNode call : calls) {
                        String name = call.path("name").asText();
                        events.status(profile.progressLabel(name));
                        usedTools.add(name);
                        ToolResult result;
                        try {
                            result = profile.run(name, call.path("args"), ctx);
                        } catch (Exception e) {
                            log.warn("Tool {} failed: {}", name, e.getMessage());
                            ObjectNode err = json.createObjectNode();
                            err.put("error", e.getMessage() == null ? "Lookup failed, try again later" : e.getMessage());
                            result = new ToolResult(err, null);
                        }
                        if (result.card() != null) cards.put(result.card().path("type").asText(), result.card());
                        ObjectNode fr = parts.addObject().putObject("functionResponse");
                        if (call.hasNonNull("id")) fr.put("id", call.get("id").asText());
                        fr.put("name", name);
                        fr.putObject("response").set("result", result.forModel());
                    }
                    history.add(responses);
                }
                events.reply("I couldn't finish that one. Could you ask it another way?", new ArrayList<>(cards.values()), List.of());
                trim(history);
            } catch (GeminiClient.GeminiException e) {
                // leave the conversation as it was before this question
                while (history.size() > rollback) history.remove(history.size() - 1);
                String detail = e.getMessage() == null ? "" : e.getMessage();
                log.warn("Gemini error {}: {}", e.status, detail.substring(0, Math.min(300, detail.length())));
                events.error(e.status == 429
                        ? "Lots of people are asking right now. Try again in a minute."
                        : e.status == 400 || e.status == 403
                        ? "The assistant's key isn't working. Check GEMINI_API_KEY."
                        : "The assistant didn't answer in time. Try again.");
            }
        }
    }

    /** Runs a proposal the person confirmed, and tells the model how it went. */
    public AgentProfile.Outcome confirm(AgentProfile profile, AgentContext ctx, String proposalId) {
        AgentSession session = ctx.session();
        Proposal proposal;
        synchronized (session) {
            proposal = session.proposals.remove(proposalId);
        }
        if (proposal == null || proposal.expired()) {
            throw new ConfirmException(410, "That offer has expired. Ask again and I'll check what's available now.");
        }
        AgentProfile.Outcome outcome = profile.execute(proposal, ctx);
        if (outcome.note() != null) {
            synchronized (session) {
                ObjectNode note = session.history.addObject();
                note.put("role", "user");
                note.putArray("parts").addObject().put("text", "[Update from CineBook, not typed by the customer] " + outcome.note());
                ObjectNode ack = session.history.addObject();
                ack.put("role", "model");
                ack.putArray("parts").addObject().put("text", "Noted.");
                trim(session.history);
            }
        }
        return outcome;
    }

    /** Keep the conversation short, starting at a person's own message. */
    private void trim(ArrayNode history) {
        while (history.size() > MAX_HISTORY) {
            history.remove(0);
            while (history.size() > 0 && !isUserText(history.get(0))) history.remove(0);
        }
    }

    private static boolean isUserText(JsonNode content) {
        return "user".equals(content.path("role").asText())
                && content.path("parts").path(0).has("text");
    }

    private void prune() {
        long now = System.currentTimeMillis();
        sessions.entrySet().removeIf(e -> now - e.getValue().lastUsed > SESSION_IDLE_MS);
        recent.entrySet().removeIf(e -> {
            synchronized (e.getValue()) {
                return e.getValue().isEmpty() || now - e.getValue().peekLast() > RATE_WINDOW_MS;
            }
        });
    }
}
