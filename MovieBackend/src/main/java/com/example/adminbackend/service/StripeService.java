package com.example.adminbackend.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripeService {

    private static final Logger logger = LoggerFactory.getLogger(StripeService.class);

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
        logger.info("Stripe initialized successfully");
    }

    public PaymentIntent getPaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }

    /**
     * Creates the payment for a booking. The amount comes from the server's quote, and the
     * order (who, which show, which seats, which snacks) is written into the payment's
     * metadata so the booking step can prove the payment covers exactly this order.
     */
    public PaymentIntent createBookingIntent(PricingService.Quote quote, Long userId,
                                             String seatsKey, String foodKey) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(quote.totalPaise())
                .setCurrency("inr")
                .putMetadata("source", "cinebook")
                .putMetadata("user_id", String.valueOf(userId))
                .putMetadata("show_id", String.valueOf(quote.showId))
                .putMetadata("seats", seatsKey)
                .putMetadata("food", foodKey)
                .putMetadata("total_inr", String.valueOf(quote.total))
                .setDescription("CineBook tickets, show " + quote.showId + ", seats " + seatsKey)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build())
                .build();
        PaymentIntent intent = PaymentIntent.create(params);
        logger.info("Booking payment {} created for user {} show {} seats {} total INR {}",
                intent.getId(), userId, quote.showId, seatsKey, quote.total);
        return intent;
    }

    /**
     * Confirms with Stripe that a payment succeeded and matches this exact order.
     * Throws with a customer-safe message if anything doesn't line up.
     */
    public PaymentIntent verifyBookingPayment(String paymentIntentId, Long userId, Long showId,
                                              String seatsKey, String foodKey, long expectedPaise) {
        if (paymentIntentId == null || !paymentIntentId.startsWith("pi_")) {
            throw new PaymentVerificationException("Payment reference is missing");
        }
        PaymentIntent intent;
        try {
            intent = PaymentIntent.retrieve(paymentIntentId);
        } catch (StripeException e) {
            logger.warn("Could not retrieve payment {}: {}", paymentIntentId, e.getMessage());
            throw new PaymentVerificationException("We couldn't find that payment with Stripe");
        }
        Map<String, String> md = intent.getMetadata();
        if (!"succeeded".equals(intent.getStatus())) {
            throw new PaymentVerificationException("The payment hasn't gone through (status: " + intent.getStatus() + ")");
        }
        if (!"inr".equalsIgnoreCase(intent.getCurrency())) {
            throw new PaymentVerificationException("Unexpected payment currency");
        }
        if (!String.valueOf(userId).equals(md.get("user_id"))
                || !String.valueOf(showId).equals(md.get("show_id"))
                || !seatsKey.equals(md.get("seats"))
                || !foodKey.equals(md.getOrDefault("food", ""))) {
            logger.warn("Payment {} does not match booking request (user {}, show {}, seats {}, food {}), metadata {}",
                    paymentIntentId, userId, showId, seatsKey, foodKey, md);
            throw new PaymentVerificationException("This payment was made for a different order");
        }
        Long received = intent.getAmountReceived();
        if (received == null || received < expectedPaise) {
            throw new PaymentVerificationException("The amount paid doesn't cover this order");
        }
        return intent;
    }

    /** Refunds all (amountPaise == null) or part of a payment. Returns the refunded amount in paise. */
    public long refund(String paymentIntentId, Long amountPaise, String reason) throws StripeException {
        com.stripe.param.RefundCreateParams.Builder b = com.stripe.param.RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId)
                .putMetadata("reason", reason);
        if (amountPaise != null) b.setAmount(amountPaise);
        com.stripe.model.Refund refund = com.stripe.model.Refund.create(b.build());
        logger.info("Refunded {} paise on {} ({})", refund.getAmount(), paymentIntentId, reason);
        return refund.getAmount();
    }

    public static class PaymentVerificationException extends RuntimeException {
        public PaymentVerificationException(String message) {
            super(message);
        }
    }
}