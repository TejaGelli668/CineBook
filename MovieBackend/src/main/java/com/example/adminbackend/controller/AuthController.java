package com.example.adminbackend.controller;

import com.example.adminbackend.dto.LoginRequest;
import com.example.adminbackend.dto.LoginResponse;
import com.example.adminbackend.dto.AdminResponse;
import com.example.adminbackend.dto.ApiResponse;
import com.example.adminbackend.service.AuthService;
import com.example.adminbackend.security.JwtUtils;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Admin login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Login attempt for username: {}", loginRequest.getUsername());

            LoginResponse loginResponse = authService.login(loginRequest);

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Login successful",
                    loginResponse
            ));

        } catch (Exception e) {
            logger.error("Login failed for username: {} - Error: {}", loginRequest.getUsername(), e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Admin logout endpoint
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        try {
            String message = authService.logout();

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    message,
                    null
            ));

        } catch (Exception e) {
            logger.error("Logout failed: {}", e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Get current authenticated admin details
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentAdmin() {
        try {
            AdminResponse adminResponse = authService.getCurrentAdmin();

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Admin details retrieved successfully",
                    adminResponse
            ));

        } catch (Exception e) {
            logger.error("Failed to get current admin: {}", e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Validate JWT token
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        try {
            AdminResponse adminResponse = authService.getCurrentAdmin();

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Token is valid",
                    adminResponse
            ));

        } catch (Exception e) {
            logger.error("Token validation failed: {}", e.getMessage());

            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(
                            false,
                            "Invalid token",
                            null
                    ));
        }
    }

    /**
     * Debug JWT token (temporary endpoint for debugging)
     */
    @PostMapping("/debug-token")
    public ResponseEntity<?> debugToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            logger.info("Debug token endpoint called");
            logger.info("Authorization header: {}", authHeader != null ? "Bearer ***" : "Not present");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(
                                false,
                                "No valid Authorization header found",
                                null
                        ));
            }

            String token = authHeader.substring(7);
            logger.info("Token length: {}", token.length());
            logger.info("Token starts with: {}", token.substring(0, Math.min(20, token.length())));

            // Test JWT validation using the autowired JwtUtils
            boolean isValid = false;
            String username = null;
            String error = null;

            try {
                isValid = jwtUtils.validateToken(token);
                if (isValid) {
                    username = jwtUtils.extractUsername(token);
                }
                logger.info("JWT validation result: valid={}, username={}", isValid, username);
            } catch (Exception e) {
                error = e.getMessage();
                logger.error("JWT validation error: {}", e.getMessage(), e);
            }

            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("tokenLength", token.length());
            debugInfo.put("tokenPrefix", token.substring(0, Math.min(30, token.length())));
            debugInfo.put("isValid", isValid);
            debugInfo.put("username", username);
            debugInfo.put("error", error);
            debugInfo.put("message", "Token validation completed");

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Debug info",
                    debugInfo
            ));

        } catch (Exception e) {
            logger.error("Debug token failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            "Debug failed: " + e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Auth service is healthy",
                null
        ));
    }
}