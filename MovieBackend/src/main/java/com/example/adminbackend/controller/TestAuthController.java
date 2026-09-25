package com.example.adminbackend.controller;

import com.example.adminbackend.dto.ApiResponse;
import com.example.adminbackend.dto.LoginRequest;
import com.example.adminbackend.entity.Admin;
import com.example.adminbackend.repository.AdminRepository;
import com.example.adminbackend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TestAuthController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Test login without Spring Security interference
     */
    @PostMapping("/direct-login")
    public ApiResponse<?> directLogin(@RequestBody LoginRequest loginRequest) {
        try {
            // Find admin by username
            Optional<Admin> adminOpt = adminRepository.findByUsername(loginRequest.getUsername());

            if (adminOpt.isEmpty()) {
                return new ApiResponse<>(false, "Admin not found with username: " + loginRequest.getUsername(), null);
            }

            Admin admin = adminOpt.get();

            // Check if password matches
            boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), admin.getPassword());

            if (!passwordMatches) {
                return new ApiResponse<>(false, "Invalid password", null);
            }

            // Generate JWT token
            String token = jwtUtils.generateToken(admin);

            // Create response data
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("type", "Bearer");
            responseData.put("admin", Map.of(
                    "id", admin.getId(),
                    "username", admin.getUsername(),
                    "email", admin.getEmail(),
                    "firstName", admin.getFirstName(),
                    "lastName", admin.getLastName(),
                    "role", admin.getRole().name()
            ));

            return new ApiResponse<>(true, "Login successful", responseData);

        } catch (Exception e) {
            return new ApiResponse<>(false, "Login failed: " + e.getMessage(), null);
        }
    }

    /**
     * Test admin lookup
     */
    @GetMapping("/find-admin/{username}")
    public ApiResponse<?> findAdmin(@PathVariable String username) {
        try {
            Optional<Admin> adminOpt = adminRepository.findByUsername(username);

            if (adminOpt.isEmpty()) {
                return new ApiResponse<>(false, "Admin not found", null);
            }

            Admin admin = adminOpt.get();

            Map<String, Object> adminData = new HashMap<>();
            adminData.put("id", admin.getId());
            adminData.put("username", admin.getUsername());
            adminData.put("email", admin.getEmail());
            adminData.put("firstName", admin.getFirstName());
            adminData.put("lastName", admin.getLastName());
            adminData.put("role", admin.getRole().name());
            adminData.put("isActive", admin.getIsActive());
            // Don't include password for security

            return new ApiResponse<>(true, "Admin found", adminData);

        } catch (Exception e) {
            return new ApiResponse<>(false, "Error: " + e.getMessage(), null);
        }
    }

    /**
     * Test password verification
     */
    @PostMapping("/verify-password")
    public ApiResponse<?> verifyPassword(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String plainPassword = request.get("password");

            Optional<Admin> adminOpt = adminRepository.findByUsername(username);

            if (adminOpt.isEmpty()) {
                return new ApiResponse<>(false, "Admin not found", null);
            }

            Admin admin = adminOpt.get();
            boolean matches = passwordEncoder.matches(plainPassword, admin.getPassword());

            Map<String, Object> result = new HashMap<>();
            result.put("passwordMatches", matches);
            result.put("storedPasswordLength", admin.getPassword().length());
            result.put("inputPasswordLength", plainPassword.length());

            return new ApiResponse<>(true, "Password verification completed", result);

        } catch (Exception e) {
            return new ApiResponse<>(false, "Error: " + e.getMessage(), null);
        }
    }
}