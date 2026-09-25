package com.example.adminbackend.service;

import com.example.adminbackend.dto.PaymentIntentRequest;
import com.example.adminbackend.dto.PaymentIntentResponse;
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

    public PaymentIntentResponse createPaymentIntent(PaymentIntentRequest request) throws StripeException {
        try {
            logger.info("Creating payment intent for amount: {} {}", request.getAmount(), request.getCurrency());

            Map<String, String> metadata = new HashMap<>();
            if (request.getBookingData() != null) {
                if (request.getBookingData().getMovieTitle() != null) {
                    metadata.put("movie_title", request.getBookingData().getMovieTitle());
                }
                if (request.getBookingData().getTheaterName() != null) {
                    metadata.put("theater_name", request.getBookingData().getTheaterName());
                }
                if (request.getBookingData().getShowTime() != null) {
                    metadata.put("show_time", request.getBookingData().getShowTime());
                }
                if (request.getBookingData().getSeats() != null) {
                    metadata.put("seats", request.getBookingData().getSeats());
                }
                if (request.getBookingData().getShowDate() != null) {
                    metadata.put("show_date", request.getBookingData().getShowDate());
                }
                if (request.getBookingData().getShowId() != null) {
                    metadata.put("show_id", request.getBookingData().getShowId().toString());
                }
                if (request.getBookingData().getSeatNumbers() != null && !request.getBookingData().getSeatNumbers().isEmpty()) {
                    metadata.put("seat_numbers", String.join(",", request.getBookingData().getSeatNumbers()));
                }
            }
            metadata.put("source", "movie_booking_app");
            metadata.put("created_at", java.time.Instant.now().toString());

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(request.getAmount())
                    .setCurrency(request.getCurrency())
                    .putAllMetadata(metadata)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            logger.info("Payment intent created successfully with ID: {}", intent.getId());

            PaymentIntentResponse response = new PaymentIntentResponse();
            response.setClientSecret(intent.getClientSecret());
            response.setPaymentIntentId(intent.getId());
            response.setAmount(intent.getAmount());
            response.setCurrency(intent.getCurrency());
            response.setStatus(intent.getStatus());

            return response;

        } catch (StripeException e) {
            logger.error("Stripe error creating payment intent: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error creating payment intent: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create payment intent", e);
        }
    }

    public String confirmPayment(String paymentIntentId) throws StripeException {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            logger.info("Payment intent {} status: {}", paymentIntentId, intent.getStatus());
            return intent.getStatus();
        } catch (StripeException e) {
            logger.error("Error confirming payment: {}", e.getMessage(), e);
            throw e;
        }
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