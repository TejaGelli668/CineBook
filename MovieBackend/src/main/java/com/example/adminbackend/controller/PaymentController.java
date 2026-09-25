package com.example.adminbackend.controller;

import com.example.adminbackend.dto.ApiResponse;
import com.example.adminbackend.dto.BookingRequest;
import com.example.adminbackend.entity.SeatStatus;
import com.example.adminbackend.entity.ShowSeat;
import com.example.adminbackend.entity.User;
import com.example.adminbackend.service.CurrentUserService;
import com.example.adminbackend.service.PricingService;
import com.example.adminbackend.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private StripeService stripeService;

    @Autowired
    private PricingService pricingService;

    @Autowired
    private CurrentUserService currentUserService;

    @Value("${stripe.publishable.key:}")
    private String publishableKey;

    /** Publishable key for Stripe.js in the browser (safe to expose; the secret key never leaves the server). */
    @GetMapping("/config")
    public ResponseEntity<ApiResponse<Map<String, Object>>> config() {
        boolean ready = publishableKey != null && publishableKey.startsWith("pk_");
        return ResponseEntity.ok(new ApiResponse<>(true, ready ? "Stripe ready" : "Stripe publishable key missing",
                Map.of("publishableKey", ready ? publishableKey : "", "configured", ready)));
    }

    /**
     * Starts payment for an order. The browser sends only WHAT is being bought
     * (show, seats, snacks); the price is worked out here from the database, and
     * the seats must currently be held by the signed-in customer.
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPaymentIntent(@RequestBody BookingRequest order) {
        try {
            User user = currentUserService.require();
            PricingService.Quote quote = pricingService.quote(order.getShowId(), order.getSeatNumbers(), order.getFoodItems());

            List<String> notHeld = quote.showSeats.stream()
                    .filter(s -> !heldBy(s, user))
                    .map(s -> s.getSeat().getSeatNumber())
                    .collect(Collectors.toList());
            if (!notHeld.isEmpty()) {
                return ResponseEntity.status(409).body(new ApiResponse<>(false,
                        "Your hold on seat(s) " + String.join(", ", notHeld) + " has ended. Go back and pick your seats again.", null));
            }

            PaymentIntent intent = stripeService.createBookingIntent(quote, user.getId(),
                    PricingService.seatsKey(order.getSeatNumbers()), PricingService.foodKey(order.getFoodItems()));

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("clientSecret", intent.getClientSecret());
            data.put("paymentIntentId", intent.getId());
            data.put("amount", quote.total);
            data.put("ticketTotal", quote.ticketTotal);
            data.put("foodTotal", quote.foodTotal);
            data.put("convenienceFee", quote.fee);
            data.put("currency", "inr");
            return ResponseEntity.ok(new ApiResponse<>(true, "Payment ready", data));
        } catch (PricingService.PricingException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (StripeException e) {
            logger.error("Stripe error creating payment: {}", e.getMessage());
            return ResponseEntity.status(502).body(new ApiResponse<>(false,
                    "The payment service didn't respond: " + e.getMessage(), null));
        }
    }

    private static boolean heldBy(ShowSeat seat, User user) {
        return seat.getStatus() == SeatStatus.LOCKED
                && seat.getLockedByUser() != null
                && seat.getLockedByUser().getId().equals(user.getId())
                && (seat.getExpiresAt() == null || seat.getExpiresAt().isAfter(LocalDateTime.now()));
    }
}
