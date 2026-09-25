package com.example.adminbackend.controller;

import com.example.adminbackend.dto.ApiResponse;
import com.example.adminbackend.entity.Admin;
import com.example.adminbackend.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/setup")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminSetupController {

    private static final Logger logger = LoggerFactory.getLogger(AdminSetupController.class);

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Health check for setup controller
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<?>> setupHealth() {
        logger.info("Setup controller health check called");

        Map<String, Object> health = new HashMap<>();
        health.put("controller", "AdminSetupController");
        health.put("status", "active");
        health.put("timestamp", LocalDateTime.now());

        return ResponseEntity.ok(new ApiResponse<>(true, "Setup controller is healthy", health));
    }

    /**
     * Create default admin - DEVELOPMENT ONLY!
     * Remove this endpoint in production
     */
    @PostMapping("/create-admin")
    public ResponseEntity<ApiResponse<?>> createDefaultAdmin() {
        try {
            logger.info("Create admin endpoint called");

            // Check if admin already exists
            boolean adminExists = adminRepository.existsByUsername("admin@cinebook.com");
            logger.info("Admin exists check: {}", adminExists);

            if (adminExists) {
                logger.warn("Admin already exists, skipping creation");
                return ResponseEntity.ok(new ApiResponse<>(false, "Admin already exists", null));
            }

            logger.info("Creating new admin user");
            Admin admin = new Admin();
            admin.setUsername("admin@cinebook.com");
            admin.setEmail("admin@cinebook.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setRole(Admin.Role.SUPER_ADMIN);
            admin.setIsActive(true);
            // Don't set createdAt - it's automatically set by @PrePersist

            Admin savedAdmin = adminRepository.save(admin);
            logger.info("Admin created successfully with ID: {}", savedAdmin.getId());

            Map<String, Object> result = new HashMap<>();
            result.put("adminId", savedAdmin.getId());
            result.put("username", savedAdmin.getUsername());
            result.put("email", savedAdmin.getEmail());
            result.put("role", savedAdmin.getRole());

            return ResponseEntity.ok(new ApiResponse<>(true,
                    "Default admin created successfully. Username: admin@cinebook.com, Password: admin123",
                    result));

        } catch (Exception e) {
            logger.error("Failed to create admin: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Failed to create admin: " + e.getMessage(), null));
        }
    }

    /**
     * Check if any admin exists
     */
    @GetMapping("/admin-exists")
    public ResponseEntity<ApiResponse<?>> checkAdminExists() {
        try {
            logger.info("Admin exists check called");

            long count = adminRepository.count();
            boolean exists = count > 0;

            logger.info("Total admin count: {}", count);

            Map<String, Object> result = new HashMap<>();
            result.put("adminCount", count);
            result.put("adminExists", exists);

            if (exists) {
                // Get first admin for verification
                var firstAdmin = adminRepository.findAll().stream().findFirst();
                if (firstAdmin.isPresent()) {
                    result.put("firstAdminUsername", firstAdmin.get().getUsername());
                    result.put("firstAdminRole", firstAdmin.get().getRole());
                }
            }

            return ResponseEntity.ok(new ApiResponse<>(true, "Admin check completed", result));

        } catch (Exception e) {
            logger.error("Failed to check admin: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Failed to check admin: " + e.getMessage(), null));
        }
    }

    /**
     * Generate BCrypt password (for development use)
     */
    @PostMapping("/generate-password")
    public ResponseEntity<ApiResponse<?>> generatePassword(@RequestParam String plainPassword) {
        try {
            logger.info("Password generation requested");

            String encodedPassword = passwordEncoder.encode(plainPassword);

            Map<String, String> result = new HashMap<>();
            result.put("plainPassword", plainPassword);
            result.put("encodedPassword", encodedPassword);

            return ResponseEntity.ok(new ApiResponse<>(true, "Password encoded", result));
        } catch (Exception e) {
            logger.error("Failed to encode password: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Failed to encode password: " + e.getMessage(), null));
        }
    }

    /**
     * List all admins (for debugging)
     */
    @GetMapping("/list-admins")
    public ResponseEntity<ApiResponse<?>> listAllAdmins() {
        try {
            logger.info("List all admins called");

            var admins = adminRepository.findAll();

            Map<String, Object> result = new HashMap<>();
            result.put("totalCount", admins.size());
            result.put("admins", admins.stream().map(admin -> {
                Map<String, Object> adminInfo = new HashMap<>();
                adminInfo.put("id", admin.getId());
                adminInfo.put("username", admin.getUsername());
                adminInfo.put("email", admin.getEmail());
                adminInfo.put("role", admin.getRole());
                adminInfo.put("isActive", admin.getIsActive());
                adminInfo.put("createdAt", admin.getCreatedAt());
                return adminInfo;
            }).toList());

            return ResponseEntity.ok(new ApiResponse<>(true, "Admins listed successfully", result));

        } catch (Exception e) {
            logger.error("Failed to list admins: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Failed to list admins: " + e.getMessage(), null));
        }
    }

    /**
     * Reset admin password (for development)
     */
    @PostMapping("/reset-admin-password")
    public ResponseEntity<ApiResponse<?>> resetAdminPassword(@RequestParam String username, @RequestParam String newPassword) {
        try {
            logger.info("Password reset requested for username: {}", username);

            var adminOpt = adminRepository.findByUsername(username);
            if (adminOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Admin not found with username: " + username, null));
            }

            Admin admin = adminOpt.get();
            admin.setPassword(passwordEncoder.encode(newPassword));
            adminRepository.save(admin);

            logger.info("Password reset successfully for username: {}", username);

            Map<String, Object> result = new HashMap<>();
            result.put("username", username);
            result.put("message", "Password reset successfully");

            return ResponseEntity.ok(new ApiResponse<>(true, "Password reset successfully", result));

        } catch (Exception e) {
            logger.error("Failed to reset password: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Failed to reset password: " + e.getMessage(), null));
        }
    }
    /**
     * Verify password for debugging
     */
    @PostMapping("/verify-password")
    public ResponseEntity<ApiResponse<?>> verifyPassword(@RequestBody Map<String, String> verifyData) {
        try {
            String username = verifyData.get("username");
            String password = verifyData.get("password");

            logger.info("Password verification requested for username: {}", username);

            if (username == null || password == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Username and password are required", null));
            }

            var adminOpt = adminRepository.findByUsername(username);
            if (adminOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Admin not found with username: " + username, null));
            }

            Admin admin = adminOpt.get();
            boolean passwordMatches = passwordEncoder.matches(password, admin.getPassword());

            Map<String, Object> result = new HashMap<>();
            result.put("username", username);
            result.put("email", admin.getEmail());
            result.put("passwordMatches", passwordMatches);
            result.put("storedPasswordHash", admin.getPassword());
            result.put("role", admin.getRole());
            result.put("isActive", admin.getIsActive());

            return ResponseEntity.ok(new ApiResponse<>(true, "Password verification completed", result));

        } catch (Exception e) {
            logger.error("Failed to verify password: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Failed to verify password: " + e.getMessage(), null));
        }
    }

    /**
     * Reset admin password by username (for development)
     */
    @PostMapping("/reset-password-by-username")
    public ResponseEntity<ApiResponse<?>> resetPasswordByUsername(@RequestBody Map<String, String> resetData) {
        try {
            String username = resetData.get("username");
            String newPassword = resetData.get("newPassword");

            logger.info("Password reset requested for username: {}", username);

            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Username is required", null));
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "New password is required", null));
            }

            var adminOpt = adminRepository.findByUsername(username);
            if (adminOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Admin not found with username: " + username, null));
            }

            Admin admin = adminOpt.get();
            String encodedPassword = passwordEncoder.encode(newPassword);
            admin.setPassword(encodedPassword);
            adminRepository.save(admin);

            logger.info("Password reset successfully for username: {}", username);

            Map<String, Object> result = new HashMap<>();
            result.put("username", username);
            result.put("email", admin.getEmail());
            result.put("newPasswordHash", encodedPassword);
            result.put("message", "Password reset successfully");

            return ResponseEntity.ok(new ApiResponse<>(true, "Password reset successfully", result));

        } catch (Exception e) {
            logger.error("Failed to reset password: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Failed to reset password: " + e.getMessage(), null));
        }
    }
}