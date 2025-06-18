package com.example.adminbackend.service;

import com.example.adminbackend.dto.*;
import com.example.adminbackend.entity.User;
import com.example.adminbackend.repository.UserRepository;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    /**
     * Register a new user
     */
    @Transactional
    public UserResponse registerUser(UserRegistrationRequest request) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("User already exists with email: " + request.getEmail());
            }

            // Create new user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setPhoneNumber(request.getPhoneNumber());

            // Parse birthday
            if (request.getBirthday() != null) {
                LocalDate birthday = LocalDate.of(
                        request.getBirthday().getYear(),
                        request.getBirthday().getMonth(),
                        request.getBirthday().getDay()
                );
                user.setDateOfBirth(birthday);
            }

            user.setRole(User.Role.USER);
            user.setIsActive(true);

            User savedUser = userRepository.save(user);

            logger.info("User registered successfully: {}", savedUser.getEmail());

            return convertToUserResponse(savedUser);

        } catch (Exception e) {
            logger.error("User registration failed for email: {} - Error: {}", request.getEmail(), e.getMessage());
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    /**
     * Authenticate user and generate JWT token
     */
    @Transactional
    public Map<String, Object> loginUser(LoginRequest loginRequest) {
        try {
            // Use email for authentication (changed from getUsername() to getEmail())
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(), // ✅ Changed from getUsername() to getEmail()
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get user details
            User user = (User) authentication.getPrincipal();

            // Generate JWT token
            String jwt = jwtUtils.generateToken(user);

            // Update last login time
            user.setLastLogin(LocalDateTime.now());
            userRepository.updateLastLogin(user.getId(), user.getLastLogin());

            // Create response
            UserResponse userResponse = convertToUserResponse(user);

            logger.info("User logged in successfully: {}", user.getEmail());

            // Return a Map that matches the expected structure
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("type", "Bearer");
            response.put("user", userResponse);
            response.put("message", "Login successful");

            return response;

        } catch (BadCredentialsException e) {
            logger.warn("Login failed for email: {} - Bad credentials", loginRequest.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        } catch (Exception e) {
            logger.error("Login failed for email: {} - Error: {}", loginRequest.getEmail(), e.getMessage());
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    /**
     * Get current authenticated user
     */
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        User user = (User) authentication.getPrincipal();
        return convertToUserResponse(user);
    }

    /**
     * Get all users (for admin dashboard)
     */
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    public UserResponse getUserById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }
        return convertToUserResponse(userOpt.get());
    }

    /**
     * Update user profile
     */
    @Transactional
    public UserResponse updateUser(Long id, UserRegistrationRequest request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }

        User user = userOpt.get();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());

        if (request.getBirthday() != null) {
            LocalDate birthday = LocalDate.of(
                    request.getBirthday().getYear(),
                    request.getBirthday().getMonth(),
                    request.getBirthday().getDay()
            );
            user.setDateOfBirth(birthday);
        }

        User updatedUser = userRepository.save(user);
        return convertToUserResponse(updatedUser);
    }

    /**
     * Change user password
     */
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }

            // Update password
            String newHashedPassword = passwordEncoder.encode(request.getNewPassword());

            // Find user in database and update
            Optional<User> userOpt = userRepository.findById(currentUser.getId());
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found");
            }

            User user = userOpt.get();
            user.setPassword(newHashedPassword);
            userRepository.save(user);

            logger.info("Password changed successfully for user: {}", user.getEmail());

        } catch (Exception e) {
            logger.error("Password change failed: {}", e.getMessage());
            throw new RuntimeException("Password change failed: " + e.getMessage());
        }
    }

    /**
     * Upload profile picture
     */
    // In UserService.java, update the uploadProfilePicture method:

    @Transactional
    public String uploadProfilePicture(MultipartFile file) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            // Create upload directory if it doesn't exist
            // Change this to save in the project root directory, not inside src
            String uploadDir = "uploads/profile-pictures";
            Path uploadPath = Paths.get(uploadDir);

            // Create the full directory path if it doesn't exist
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update user profile picture URL
            String profilePictureUrl = "/uploads/profile-pictures/" + filename;

            Optional<User> userOpt = userRepository.findById(currentUser.getId());
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found");
            }

            User user = userOpt.get();
            user.setProfilePicture(profilePictureUrl);
            userRepository.save(user);

            logger.info("Profile picture uploaded successfully for user: {}", user.getEmail());

            return profilePictureUrl;

        } catch (IOException e) {
            logger.error("File upload failed: {}", e.getMessage());
            throw new RuntimeException("File upload failed: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Profile picture upload failed: {}", e.getMessage());
            throw new RuntimeException("Profile picture upload failed: " + e.getMessage());
        }
    }

    /**
     * Deactivate user account
     */
    @Transactional
    public void deactivateUser(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }

        User user = userOpt.get();
        user.setIsActive(false);
        userRepository.save(user);

        logger.info("User deactivated: {}", user.getEmail());
    }

    /**
     * Get user statistics for admin dashboard
     */
    public UserStats getUserStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActiveTrue();
        long todayRegistrations = userRepository.countUsersRegisteredToday();
        long monthlyRegistrations = userRepository.countUsersRegisteredThisMonth();

        return new UserStats(totalUsers, activeUsers, todayRegistrations, monthlyRegistrations);
    }

    /**
     * Convert User entity to UserResponse DTO
     */
    private UserResponse convertToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getDateOfBirth(),
                user.getPhoneNumber(),
                user.getProfilePicture(),
                user.getRole().name(),
                user.getIsActive(),
                user.getCreatedAt(),
                user.getLastLogin()
        );
    }

    /**
     * Inner class for user statistics
     */
    public static class UserStats {
        private final long totalUsers;
        private final long activeUsers;
        private final long todayRegistrations;
        private final long monthlyRegistrations;

        public UserStats(long totalUsers, long activeUsers, long todayRegistrations, long monthlyRegistrations) {
            this.totalUsers = totalUsers;
            this.activeUsers = activeUsers;
            this.todayRegistrations = todayRegistrations;
            this.monthlyRegistrations = monthlyRegistrations;
        }

        // Getters
        public long getTotalUsers() { return totalUsers; }
        public long getActiveUsers() { return activeUsers; }
        public long getTodayRegistrations() { return todayRegistrations; }
        public long getMonthlyRegistrations() { return monthlyRegistrations; }
    }
}