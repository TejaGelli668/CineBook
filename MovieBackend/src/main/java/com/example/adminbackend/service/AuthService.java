package com.example.adminbackend.service;

import com.example.adminbackend.dto.LoginRequest;
import com.example.adminbackend.dto.LoginResponse;
import com.example.adminbackend.dto.AdminResponse;
import com.example.adminbackend.entity.Admin;
import com.example.adminbackend.repository.AdminRepository;
import com.example.adminbackend.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest loginRequest) {
        try {
            logger.info("Processing admin login for username: {}", loginRequest.getUsername());

            // Step 1: Check if admin exists
            Optional<Admin> adminOpt = adminRepository.findByUsername(loginRequest.getUsername());
            if (adminOpt.isEmpty()) {
                logger.warn("Admin not found with username: {}", loginRequest.getUsername());
                throw new RuntimeException("Admin not found with username: " + loginRequest.getUsername());
            }

            Admin admin = adminOpt.get();
            logger.info("Admin found: {} (ID: {})", admin.getUsername(), admin.getId());

            // Step 2: Check if admin is active
            if (!admin.getIsActive()) {
                logger.warn("Admin account is disabled: {}", loginRequest.getUsername());
                throw new RuntimeException("Admin account is disabled");
            }

            // Step 3: Verify password manually (since we're dealing with admin-specific logic)
            if (!passwordEncoder.matches(loginRequest.getPassword(), admin.getPassword())) {
                logger.warn("Invalid password for admin: {}", loginRequest.getUsername());
                throw new RuntimeException("Invalid credentials");
            }

            logger.info("Password verification successful for admin: {}", loginRequest.getUsername());

            // Step 4: Generate JWT token
            // Create UserDetails for token generation
            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(admin.getUsername())
                    .password(admin.getPassword())
                    .authorities("ROLE_" + admin.getRole().toString())
                    .accountExpired(false)
                    .accountLocked(false)
                    .credentialsExpired(false)
                    .disabled(!admin.getIsActive())
                    .build();

            String token = jwtUtils.generateToken(userDetails);
            logger.info("JWT token generated for admin: {}", admin.getUsername());

            // Step 5: Update last login time
            admin.setLastLogin(LocalDateTime.now());
            adminRepository.save(admin);

            // Step 6: Create response
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setUsername(admin.getUsername());
            response.setEmail(admin.getEmail());
            response.setRole(admin.getRole().toString());

            logger.info("Admin login successful for: {}", loginRequest.getUsername());
            return response;

        } catch (Exception e) {
            logger.error("Admin login failed for username: {} - Error: {}", loginRequest.getUsername(), e.getMessage());
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    public String logout() {
        try {
            // Clear security context
            SecurityContextHolder.clearContext();
            logger.info("Admin logout successful");
            return "Logout successful";
        } catch (Exception e) {
            logger.error("Logout failed: {}", e.getMessage());
            throw new RuntimeException("Logout failed: " + e.getMessage());
        }
    }

    public AdminResponse getCurrentAdmin() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                throw new RuntimeException("No authenticated admin found");
            }

            String username = authentication.getName();
            logger.info("Getting current admin details for: {}", username);

            Optional<Admin> adminOpt = adminRepository.findByUsername(username);
            if (adminOpt.isEmpty()) {
                throw new RuntimeException("Admin not found: " + username);
            }

            Admin admin = adminOpt.get();

            AdminResponse response = new AdminResponse();
            response.setId(admin.getId());
            response.setUsername(admin.getUsername());
            response.setEmail(admin.getEmail());
            response.setFirstName(admin.getFirstName());
            response.setLastName(admin.getLastName());
            response.setRole(admin.getRole().toString());
            response.setIsActive(admin.getIsActive());
            response.setCreatedAt(admin.getCreatedAt());
            response.setLastLogin(admin.getLastLogin());

            return response;

        } catch (Exception e) {
            logger.error("Failed to get current admin: {}", e.getMessage());
            throw new RuntimeException("Failed to get current admin: " + e.getMessage());
        }
    }
}