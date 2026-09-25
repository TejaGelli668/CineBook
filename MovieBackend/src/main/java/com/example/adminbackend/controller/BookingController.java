package com.example.adminbackend.controller;

import com.example.adminbackend.dto.ApiResponse;
import com.example.adminbackend.dto.BookingRequest;
import com.example.adminbackend.dto.BookingResponse;
import com.example.adminbackend.entity.Booking;
import com.example.adminbackend.entity.BookingStatus;
import com.example.adminbackend.entity.User;
import com.example.adminbackend.service.BookingService;
import com.example.adminbackend.service.UserService;
import com.example.adminbackend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private com.example.adminbackend.service.StripeService stripeService;

    @Autowired
    private com.example.adminbackend.service.CancellationService cancellationService;

    @Autowired
    private com.example.adminbackend.service.BookingLocks bookingLocks;

    @Autowired
    private com.example.adminbackend.service.SeatService seatService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @RequestBody BookingRequest request,
            HttpServletRequest httpRequest) {
        // Every booking goes through the same checks: a verified Stripe payment
        // for exactly these seats and snacks (see SeatService.bookSeats).
        try {
            BookingResponse booking = bookingLocks.withPaymentLock(request.getPaymentIntentId(),
                    () -> seatService.bookSeats(request));
            return ResponseEntity.ok(new ApiResponse<>(true, "Booking created successfully", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingDetails(@PathVariable Long id) {
        try {
            BookingResponse booking = bookingService.getBookingWithFoodItems(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Booking details retrieved successfully", booking));
        } catch (Exception e) {
            return ResponseEntity.status(404)
                    .body(new ApiResponse<>(false, "Booking not found: " + e.getMessage(), null));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserBookings(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return ResponseEntity.status(401).body("No token provided");
            }

            if (!jwtUtils.validateToken(token)) {
                return ResponseEntity.status(401).body("Invalid or expired token");
            }

            String email = jwtUtils.extractUsername(token);
            User user = findUserByEmailOrUsername(email);

            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            List<Booking> userBookings = bookingService.getBookingsByUserId(user.getId());
            return ResponseEntity.ok(userBookings);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching user bookings: " + e.getMessage());
        }
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBookingById(@PathVariable Long bookingId, HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return ResponseEntity.status(401).body("No token provided");
            }

            if (!jwtUtils.validateToken(token)) {
                return ResponseEntity.status(401).body("Invalid or expired token");
            }

            String email = jwtUtils.extractUsername(token);
            User user = findUserByEmailOrUsername(email);

            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            Optional<Booking> booking = bookingService.getBookingById(bookingId);

            if (booking.isPresent()) {
                if (booking.get().getUser() != null && booking.get().getUser().getId().equals(user.getId())) {
                    return ResponseEntity.ok(booking.get());
                } else {
                    return ResponseEntity.status(403).body("Access denied to this booking");
                }
            } else {
                return ResponseEntity.status(404).body("Booking not found");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching booking: " + e.getMessage());
        }
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId, HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return ResponseEntity.status(401).body("No token provided");
            }

            if (!jwtUtils.validateToken(token)) {
                return ResponseEntity.status(401).body("Invalid or expired token");
            }

            String email = jwtUtils.extractUsername(token);
            User user = findUserByEmailOrUsername(email);

            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            try {
                com.example.adminbackend.service.CancellationService.Outcome o = cancellationService.cancel(bookingId, user);
                java.util.Map<String, Object> body = new java.util.LinkedHashMap<>();
                body.put("success", true);
                body.put("bookingId", o.bookingId());
                body.put("refundPercent", o.percent());
                body.put("refundAmount", o.refunded());
                body.put("message", o.message());
                return ResponseEntity.ok(body);
            } catch (com.example.adminbackend.service.CancellationService.CancelException e) {
                if (e.status == 400 || e.status == 502) {
                    return ResponseEntity.status(e.status).body(java.util.Map.of("success", false, "message", e.getMessage()));
                }
                return ResponseEntity.status(e.status).body(e.getMessage());
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error cancelling booking: " + e.getMessage());
        }
    }

    private User getCurrentUserFromRequest(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token == null || !jwtUtils.validateToken(token)) {
            throw new RuntimeException("Invalid or missing authentication token");
        }

        String email = jwtUtils.extractUsername(token);
        User user = findUserByEmailOrUsername(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return user;
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private User findUserByEmailOrUsername(String identifier) {
        try {
            return userService.findByUsername(identifier);
        } catch (Exception e) {
            return null;
        }
    }
}