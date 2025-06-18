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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    /**
     * Authenticate admin and generate JWT token
     */
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get admin details
            Admin admin = (Admin) authentication.getPrincipal();

            // Generate JWT token
            String jwt = jwtUtils.generateToken(admin);

            // Update last login time
            admin.setLastLogin(LocalDateTime.now());
            adminRepository.updateLastLogin(admin.getId(), admin.getLastLogin());

            // Create response
            AdminResponse adminResponse = new AdminResponse(
                    admin.getId(),
                    admin.getUsername(),
                    admin.getEmail(),
                    admin.getFirstName(),
                    admin.getLastName(),
                    admin.getRole().name(),
                    admin.getIsActive(),
                    admin.getCreatedAt(),
                    admin.getLastLogin()
            );

            logger.info("Admin logged in successfully: {}", admin.getUsername());

            return new LoginResponse(jwt, "Bearer", adminResponse, "Login successful");

        } catch (BadCredentialsException e) {
            logger.warn("Login failed for username: {} - Bad credentials", loginRequest.getUsername());
            throw new BadCredentialsException("Invalid username or password");
        } catch (Exception e) {
            logger.error("Login failed for username: {} - Error: {}", loginRequest.getUsername(), e.getMessage());
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    /**
     * Logout admin (invalidate token on client side)
     */
    public String logout() {
        try {
            SecurityContextHolder.clearContext();
            logger.info("Admin logged out successfully");
            return "Logout successful";
        } catch (Exception e) {
            logger.error("Logout failed: {}", e.getMessage());
            throw new RuntimeException("Logout failed: " + e.getMessage());
        }
    }

    /**
     * Get current authenticated admin
     */
    public AdminResponse getCurrentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated admin found");
        }

        Admin admin = (Admin) authentication.getPrincipal();

        return new AdminResponse(
                admin.getId(),
                admin.getUsername(),
                admin.getEmail(),
                admin.getFirstName(),
                admin.getLastName(),
                admin.getRole().name(),
                admin.getIsActive(),
                admin.getCreatedAt(),
                admin.getLastLogin()
        );
    }

    /**
     * Check if username exists
     */
    public boolean existsByUsername(String username) {
        return adminRepository.existsByUsername(username);
    }

    /**
     * Check if email exists
     */
    public boolean existsByEmail(String email) {
        return adminRepository.existsByEmail(email);
    }
}