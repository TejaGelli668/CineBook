package com.example.adminbackend.agent;

import com.fasterxml.jackson.databind.node.ArrayNode;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** One conversation: what was said, the order being built, and actions awaiting confirmation. */
public class AgentSession {

    /** Seats held for the customer and snacks chosen, ready for checkout. */
    public static class Order {
        public Long showId;
        public List<String> seats = new ArrayList<>();
        public LocalDateTime holdExpires;
        public final Map<Long, Integer> food = new LinkedHashMap<>();

        public boolean hasActiveHold() {
            return showId != null && !seats.isEmpty() && holdExpires != null && holdExpires.isAfter(LocalDateTime.now());
        }

        public void clearSeats() {
            seats = new ArrayList<>();
            holdExpires = null;
        }
    }

    final ArrayNode history;
    final Map<String, Proposal> proposals = new LinkedHashMap<>();
    public final Order order = new Order();
    /** TMDB results the manager has seen, so an import card can show the film. */
    public final Map<Long, com.fasterxml.jackson.databind.JsonNode> tmdbSeen = new java.util.concurrent.ConcurrentHashMap<>();
    volatile long lastUsed = System.currentTimeMillis();

    AgentSession(ArrayNode history) {
        this.history = history;
    }

    public synchronized String propose(String kind, com.fasterxml.jackson.databind.JsonNode params) {
        proposals.values().removeIf(Proposal::expired);
        while (proposals.size() >= 10) proposals.remove(proposals.keySet().iterator().next());
        String id = Long.toString(System.nanoTime(), 36) + Integer.toString((int) (Math.random() * 1e6), 36);
        proposals.put(id, new Proposal(id, kind, params, System.currentTimeMillis()));
        return id;
    }
}
