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

    @Value("${stripe.secret.key:place stripe secret key}")
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
}