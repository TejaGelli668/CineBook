package com.example.adminbackend.controller;

import com.example.adminbackend.dto.LoginRequest;
import com.example.adminbackend.dto.LoginResponse;
import com.example.adminbackend.dto.AdminResponse;
import com.example.adminbackend.dto.ApiResponse;
import com.example.adminbackend.service.AuthService;
import com.example.adminbackend.security.JwtUtils;
import com.example.adminbackend.repository.AdminRepository;
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

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.adminbackend.service.LoginAttemptService loginAttemptService;

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AdminRepository adminRepository;

    /**
     * Admin login endpoint - PUBLIC ACCESS
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        String login = loginRequest.getUsername();
        long blocked = loginAttemptService.minutesBlocked("admin", login);
        if (blocked > 0) {
            return ResponseEntity.status(429).body(new ApiResponse<>(false,
                    "Too many wrong passwords. Try again in " + blocked + " minute" + (blocked == 1 ? "" : "s") + ".", null));
        }
        try {
            if (!adminRepository.existsByUsername(login)) {
                throw new RuntimeException("unknown admin");
            }
            LoginResponse loginResponse = authService.login(loginRequest);
            loginAttemptService.succeeded("admin", login);
            logger.info("Admin signed in: {}", login);
            return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", loginResponse));
        } catch (Exception e) {
            loginAttemptService.failed("admin", login);
            logger.warn("Failed admin sign-in for {}", login);
            // Same answer whether the account exists or not
            return ResponseEntity.status(401).body(new ApiResponse<>(false,
                    "That username and password didn't match.", null));
        }
    }

    /**
     * Debug endpoint to check login without security
     */
    @PostMapping("/debug-login")
    public ResponseEntity<?> debugLogin(@RequestBody Map<String, String> credentials) {
        try {
            logger.info("=== DEBUG LOGIN ENDPOINT ===");
            String username = credentials.get("username");
            String password = credentials.get("password");

            logger.info("Received username: {}", username);

            // Check database
            long adminCount = adminRepository.count();
            boolean adminExists = adminRepository.existsByUsername(username);

            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("totalAdmins", adminCount);
            debugInfo.put("adminExists", adminExists);
            debugInfo.put("receivedUsername", username);
            debugInfo.put("passwordReceived", password != null && !password.isEmpty());

            if (adminExists) {
                var admin = adminRepository.findByUsername(username);
                debugInfo.put("adminFound", admin.isPresent());
                if (admin.isPresent()) {
                    debugInfo.put("adminEmail", admin.get().getEmail());
                    debugInfo.put("adminRole", admin.get().getRole());
                    debugInfo.put("adminActive", admin.get().getIsActive());
                }
            }

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Debug info collected",
                    debugInfo
            ));

        } catch (Exception e) {
            logger.error("Debug login failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            "Debug failed: " + e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Admin logout endpoint - REQUIRES AUTHENTICATION
     */
    @PostMapping("/logout")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
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
     * Get current authenticated admin details - REQUIRES AUTHENTICATION
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
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
     * Validate JWT token - REQUIRES AUTHENTICATION
     */
    @GetMapping("/validate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
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
     * Health check endpoint - PUBLIC ACCESS
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        try {
            long adminCount = adminRepository.count();

            Map<String, Object> health = new HashMap<>();
            health.put("status", "healthy");
            health.put("adminCount", adminCount);
            health.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Auth service is healthy",
                    health
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse<>(
                    false,
                    "Health check failed: " + e.getMessage(),
                    null
            ));
        }
    }
}