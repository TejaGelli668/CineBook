package com.example.adminbackend.agent;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * An action the assistant suggested but may not carry out by itself: it runs
 * only when the person taps Confirm on its card (see AgentEngine.confirm).
 */
public record Proposal(String id, String kind, JsonNode params, long createdAt) {
    static final long TTL_MS = 15 * 60 * 1000L;

    boolean expired() {
        return System.currentTimeMillis() - createdAt > TTL_MS;
    }
}
