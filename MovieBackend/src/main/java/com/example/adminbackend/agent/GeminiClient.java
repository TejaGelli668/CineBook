package com.example.adminbackend.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Thin client for Gemini's generateContent endpoint with function calling.
 *
 * Gemini's Flash models are sometimes overloaded (503) and the free tier
 * allows only a few requests per minute per model (429). A turn is retried
 * once, then handed to the next model; rate-limited models sit out for the
 * delay Google asks for. Within one question the same model is preferred
 * ("sticky"), because its tool-call signatures are tied to that model.
 */
@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper json = new ObjectMapper();
    /** Models that rejected our thinking setting; we then send none. */
    private final Map<String, Boolean> noThinkingConfig = new ConcurrentHashMap<>();
    /** Models that hit their per-minute quota, and when they may be tried again. */
    private final Map<String, Long> coolUntil = new ConcurrentHashMap<>();
    private static final Pattern RETRY_DELAY = Pattern.compile("\"retryDelay\"\\s*:\\s*\"([0-9.]+)s\"");

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-3.5-flash-lite}")
    private String model;

    @Value("${gemini.fallback-models:gemini-3.8-flash,gemini-flash-latest,gemini-3.1-flash-lite}")
    private String fallbackModels;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta/models/}")
    private String baseUrl;

    public boolean configured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /** Thrown for failures worth telling the customer about in plain words. */
    public static class GeminiException extends RuntimeException {
        public final int status;

        GeminiException(int status, String message) {
            super(message);
            this.status = status;
        }
    }

    /** The model's turn ({role, parts}) and which model produced it. */
    public record Reply(JsonNode content, String model) {}

    /**
     * One model turn. Pass the model that answered earlier steps of this
     * question as {@code sticky} (null on the first step).
     */
    public Reply generate(String systemInstruction, ArrayNode contents, ArrayNode functionDeclarations, String sticky) {
        // Try the question's model first, then the rest; models on a rate-limit cooldown go last
        List<String> candidates = new ArrayList<>();
        if (sticky != null) candidates.add(sticky);
        if (!candidates.contains(model)) candidates.add(model);
        Arrays.stream(fallbackModels.split(",")).map(String::trim)
                .filter(m -> !m.isEmpty() && !candidates.contains(m)).forEach(candidates::add);
        long now = System.currentTimeMillis();
        List<String> order = new ArrayList<>(candidates.stream().filter(m -> coolUntil.getOrDefault(m, 0L) <= now).toList());
        candidates.stream().filter(m -> !order.contains(m)).forEach(order::add);

        GeminiException last = null;
        for (String m : order) {
            for (int attempt = 0; attempt < 2; attempt++) {
                try {
                    return new Reply(call(m, systemInstruction, contents, functionDeclarations), m);
                } catch (GeminiException e) {
                    last = e;
                    if (e.status == 400 && !noThinkingConfig.containsKey(m)) {
                        noThinkingConfig.put(m, true); // retry this model without the thinking setting
                        attempt--;
                        continue;
                    }
                    if (e.status == 429) {
                        coolUntil.put(m, System.currentTimeMillis() + retryDelayMs(e.getMessage()));
                        log.info("Gemini {} rate-limited; trying another model", m);
                        break; // no point retrying the same model now
                    }
                    boolean busy = e.status == 503 || e.status == 500 || e.status == 504;
                    if (!busy) throw e;
                    log.info("Gemini {} busy ({}), attempt {}", m, e.status, attempt + 1);
                    if (attempt == 0) sleep(300);
                }
            }
        }
        throw last != null ? last : new GeminiException(503, "No model available");
    }

    /** Google says how long to wait ("retryDelay": "17s"); default to 30 s. */
    private long retryDelayMs(String body) {
        Matcher m = RETRY_DELAY.matcher(body == null ? "" : body);
        return m.find() ? (long) (Double.parseDouble(m.group(1)) * 1000) + 500 : 30_000;
    }

    private JsonNode call(String m, String systemInstruction, ArrayNode contents, ArrayNode functionDeclarations) {
        ObjectNode body = json.createObjectNode();
        body.putObject("systemInstruction").putArray("parts").addObject().put("text", systemInstruction);
        body.set("contents", contents);
        if (functionDeclarations != null && !functionDeclarations.isEmpty()) {
            body.putArray("tools").addObject().set("functionDeclarations", functionDeclarations);
        }
        ObjectNode config = body.putObject("generationConfig");
        config.put("maxOutputTokens", 1024);
        if (!noThinkingConfig.containsKey(m)) {
            config.putObject("thinkingConfig").put("thinkingLevel", "low"); // answer fast; the tools do the work
        }

        try {
            HttpRequest req = HttpRequest.newBuilder(URI.create(baseUrl + m + ":generateContent"))
                    .timeout(Duration.ofSeconds(40))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)))
                    .build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() != 200) {
                throw new GeminiException(res.statusCode(), m + ": " + res.body());
            }
            JsonNode content = json.readTree(res.body()).path("candidates").path(0).path("content");
            if (content.isMissingNode() || !content.has("parts")) {
                throw new GeminiException(503, m + ": empty answer " + res.body());
            }
            return content;
        } catch (GeminiException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new GeminiException(504, "Interrupted");
        } catch (Exception e) {
            throw new GeminiException(504, m + ": " + e.getMessage());
        }
    }

    private static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
