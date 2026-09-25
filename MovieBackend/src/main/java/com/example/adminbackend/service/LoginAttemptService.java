package com.example.adminbackend.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Slows down password guessing: after MAX_FAILURES wrong passwords for the same
 * account within WINDOW, that account's sign-in is blocked for WINDOW.
 */
@Service
public class LoginAttemptService {

    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private static class Attempts {
        int failures;
        Instant firstFailure = Instant.now();
        Instant blockedUntil;
    }

    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();

    private static String key(String scope, String login) {
        return scope + ":" + (login == null ? "" : login.trim().toLowerCase());
    }

    /** Minutes left on a block, or 0 when sign-in is allowed. */
    public long minutesBlocked(String scope, String login) {
        Attempts a = attempts.get(key(scope, login));
        if (a == null || a.blockedUntil == null) return 0;
        long secs = Duration.between(Instant.now(), a.blockedUntil).getSeconds();
        if (secs <= 0) {
            attempts.remove(key(scope, login));
            return 0;
        }
        return Math.max(1, (secs + 59) / 60);
    }

    public void failed(String scope, String login) {
        attempts.compute(key(scope, login), (k, a) -> {
            if (a == null || Duration.between(a.firstFailure, Instant.now()).compareTo(WINDOW) > 0) {
                a = new Attempts();
            }
            a.failures++;
            if (a.failures >= MAX_FAILURES) a.blockedUntil = Instant.now().plus(WINDOW);
            return a;
        });
    }

    public void succeeded(String scope, String login) {
        attempts.remove(key(scope, login));
    }
}
