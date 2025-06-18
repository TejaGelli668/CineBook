package com.example.adminbackend.controller;

import com.example.adminbackend.dto.ApiResponse;
import com.example.adminbackend.entity.Admin;
import com.example.adminbackend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/setup")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminSetupController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Create default admin - DEVELOPMENT ONLY!
     * Remove this endpoint in production
     */
    @PostMapping("/create-admin")
    public ApiResponse<?> createDefaultAdmin() {
        try {
            // Check if admin already exists
            if (adminRepository.existsByUsername("admin@cinebook.com")) {
                return new ApiResponse<>(false, "Admin already exists", null);
            }

            Admin admin = new Admin();
            admin.setUsername("admin@cinebook.com");
            admin.setEmail("admin@cinebook.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setRole(Admin.Role.SUPER_ADMIN);
            admin.setIsActive(true);
            // Don't set createdAt - it's automatically set by @PrePersist

            adminRepository.save(admin);

            return new ApiResponse<>(true, "Default admin created successfully. Username: admin@cinebook.com, Password: admin123", null);

        } catch (Exception e) {
            return new ApiResponse<>(false, "Failed to create admin: " + e.getMessage(), null);
        }
    }

    /**
     * Check if any admin exists
     */
    @GetMapping("/admin-exists")
    public ApiResponse<?> checkAdminExists() {
        try {
            long count = adminRepository.count();
            boolean exists = count > 0;

            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("adminCount", count);
            result.put("adminExists", exists);

            return new ApiResponse<>(true, "Admin check completed", result);

        } catch (Exception e) {
            return new ApiResponse<>(false, "Failed to check admin: " + e.getMessage(), null);
        }
    }

    /**
     * Generate BCrypt password (for development use)
     */
    @PostMapping("/generate-password")
    public ApiResponse<?> generatePassword(@RequestParam String plainPassword) {
        try {
            String encodedPassword = passwordEncoder.encode(plainPassword);

            java.util.Map<String, String> result = new java.util.HashMap<>();
            result.put("plainPassword", plainPassword);
            result.put("encodedPassword", encodedPassword);

            return new ApiResponse<>(true, "Password encoded", result);
        } catch (Exception e) {
            return new ApiResponse<>(false, "Failed to encode password: " + e.getMessage(), null);
        }
    }

}