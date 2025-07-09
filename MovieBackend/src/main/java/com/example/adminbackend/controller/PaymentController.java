package com.example.adminbackend.controller;

import com.example.adminbackend.dto.ApiResponse;
import com.example.adminbackend.dto.PaymentIntentRequest;
import com.example.adminbackend.dto.PaymentIntentResponse;
import com.example.adminbackend.service.StripeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Autowired
    private StripeService stripeService;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<ApiResponse<PaymentIntentResponse>> createPaymentIntent(@RequestBody PaymentIntentRequest request) {
        try {
            PaymentIntentResponse response = stripeService.createPaymentIntent(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Payment intent created successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Failed to create payment intent: " + e.getMessage(), null));
        }
    }

    @PostMapping("/confirm-payment")
    public ResponseEntity<ApiResponse<String>> confirmPayment(@RequestBody String paymentIntentId) {
        try {
            String result = stripeService.confirmPayment(paymentIntentId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Payment confirmed successfully", result));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Failed to confirm payment: " + e.getMessage(), null));
        }
    }
}