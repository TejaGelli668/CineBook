package com.example.adminbackend.service;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * One booking attempt per payment at a time. The customer's browser and the
 * Stripe webhook can both try to turn the same payment into a booking; running
 * them one after the other means the second simply finds the first's booking.
 */
@Component
public class BookingLocks {

    private final ConcurrentHashMap<String, Object> locks = new ConcurrentHashMap<>();

    public <T> T withPaymentLock(String paymentIntentId, Supplier<T> work) {
        if (paymentIntentId == null) return work.get();
        Object lock = locks.computeIfAbsent(paymentIntentId, k -> new Object());
        try {
            synchronized (lock) {
                return work.get();
            }
        } finally {
            locks.remove(paymentIntentId, lock);
        }
    }
}
