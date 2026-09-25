package com.example.adminbackend.controller;

import com.example.adminbackend.dto.BookingRequest;
import com.example.adminbackend.dto.BookingResponse;
import com.example.adminbackend.entity.User;
import com.example.adminbackend.repository.UserRepository;
import com.example.adminbackend.service.BookingLocks;
import com.example.adminbackend.service.SeatService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Stripe tells us here when a payment succeeds, so a booking is made even if the
 * customer's browser closed or lost signal right after paying. It goes through
 * the same checks as the browser (SeatService.bookSeatsFor) and is safe to receive
 * more than once: a payment already booked just returns that booking.
 *
 * Set STRIPE_WEBHOOK_SECRET (from the Stripe dashboard or `stripe listen`).
 */
@RestController
@RequestMapping("/api/payments")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final SeatService seatService;
    private final BookingLocks bookingLocks;
    private final UserRepository users;
    private final ObjectMapper json = new ObjectMapper();

    @Value("${stripe.webhook.secret:}")
    private String webhookSecret;

    public StripeWebhookController(SeatService seatService, BookingLocks bookingLocks, UserRepository users) {
        this.seatService = seatService;
        this.bookingLocks = bookingLocks;
        this.users = users;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestBody String payload,
                                          @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.warn("Stripe webhook received but STRIPE_WEBHOOK_SECRET isn't set; ignoring it");
            return ResponseEntity.status(503).body("Webhook not configured");
        }
        try {
            Webhook.constructEvent(payload, signature, webhookSecret); // checks it really came from Stripe
        } catch (SignatureVerificationException | RuntimeException e) {
            log.warn("Rejected Stripe webhook with a bad signature");
            return ResponseEntity.status(400).body("Bad signature");
        }

        JsonNode event;
        try {
            event = json.readTree(payload);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Unreadable event");
        }
        if (!"payment_intent.succeeded".equals(event.path("type").asText())) {
            return ResponseEntity.ok("Ignored");
        }
        JsonNode intent = event.path("data").path("object");
        String paymentIntentId = intent.path("id").asText(null);
        JsonNode md = intent.path("metadata");
        if (!"cinebook".equals(md.path("source").asText()) || paymentIntentId == null) {
            return ResponseEntity.ok("Not a CineBook ticket payment");
        }

        Optional<User> user = parseLong(md.path("user_id").asText()).flatMap(users::findById);
        Optional<Long> showId = parseLong(md.path("show_id").asText());
        if (user.isEmpty() || showId.isEmpty()) {
            log.error("Payment {} has no usable customer or show in its metadata: {}", paymentIntentId, md);
            return ResponseEntity.ok("Missing order details");
        }

        BookingRequest request = new BookingRequest();
        request.setPaymentIntentId(paymentIntentId);
        request.setPaymentMethod("stripe");
        request.setShowId(showId.get());
        request.setSeatNumbers(Arrays.stream(md.path("seats").asText("").split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList());
        request.setFoodItems(parseFood(md.path("food").asText("")));

        try {
            BookingResponse booking = bookingLocks.withPaymentLock(paymentIntentId,
                    () -> seatService.bookSeatsFor(user.get(), request));
            log.info("Webhook: payment {} is booking {}", paymentIntentId, booking.getBookingId());
            return ResponseEntity.ok("Booked " + booking.getBookingId());
        } catch (DataIntegrityViolationException e) {
            // another server finished the same payment at the same moment
            return ResponseEntity.ok("Already booked");
        } catch (DataAccessException e) {
            // database unavailable: a 500 makes Stripe retry later
            log.error("Webhook: couldn't book payment {} yet: {}", paymentIntentId, e.getMessage());
            return ResponseEntity.status(500).body("Try again");
        } catch (RuntimeException e) {
            // an order problem (e.g. seats taken, already refunded): retrying won't help
            log.warn("Webhook: payment {} not booked: {}", paymentIntentId, e.getMessage());
            return ResponseEntity.ok("Not booked: " + e.getMessage());
        }
    }

    /** "1x2,5x1" (food item id x quantity), as written by PricingService.foodKey. */
    private static List<BookingRequest.FoodItemRequest> parseFood(String key) {
        List<BookingRequest.FoodItemRequest> items = new ArrayList<>();
        for (String part : key.split(",")) {
            String[] idQty = part.trim().split("x");
            if (idQty.length != 2) continue;
            Optional<Long> id = parseLong(idQty[0]);
            Optional<Long> qty = parseLong(idQty[1]);
            if (id.isEmpty() || qty.isEmpty()) continue;
            BookingRequest.FoodItemRequest f = new BookingRequest.FoodItemRequest();
            f.setFoodItemId(id.get());
            f.setQuantity(qty.get().intValue());
            items.add(f);
        }
        return items;
    }

    private static Optional<Long> parseLong(String s) {
        try {
            return Optional.of(Long.parseLong(s.trim()));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
