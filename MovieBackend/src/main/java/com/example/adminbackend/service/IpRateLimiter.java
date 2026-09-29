package com.example.adminbackend.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limits how often one network address can try to sign in or sign up. The per-account
 * lockout (LoginAttemptService) stops guessing one password; this stops one address
 * trying many accounts, or creating accounts in bulk.
 */
@Component
public class IpRateLimiter {

    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    /** True if this address may do {@code action} again: at most {@code limit} times per {@code windowMs}. */
    public boolean allow(String action, HttpServletRequest request, int limit, long windowMs) {
        long now = System.currentTimeMillis();
        if (hits.size() > 50_000) hits.clear(); // don't let the table grow without bound
        Deque<Long> times = hits.computeIfAbsent(action + ":" + request.getRemoteAddr(), k -> new ArrayDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && now - times.peekFirst() > windowMs) times.pollFirst();
            if (times.size() >= limit) return false;
            times.addLast(now);
            return true;
        }
    }
}
