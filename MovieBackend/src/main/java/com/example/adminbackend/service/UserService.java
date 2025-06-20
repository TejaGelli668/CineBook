package com.example.adminbackend.service;

import com.example.adminbackend.dto.*;
import com.example.adminbackend.entity.User;
import com.example.adminbackend.repository.UserRepository;
import com.example.adminbackend.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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

    /**
     * Register a new user
     */
    public UserResponse registerUser(UserRegistrationRequest request) {
        try {
            logger.info("Starting user registration for email: {}", request.getEmail());

            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                logger.warn("User already exists with email: {}", request.getEmail());
                throw new RuntimeException("User already exists with email: " + request.getEmail());
            }

            // Create new user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setPhoneNumber(request.getPhoneNumber());

            // Parse birthday and convert to string
            if (request.getBirthday() != null) {
                String birthday = String.format("%04d-%02d-%02d",
                        request.getBirthday().getYear(),
                        request.getBirthday().getMonth(),
                        request.getBirthday().getDay()
                );
                user.setDateOfBirth(birthday);
                logger.info("Birthday set to: {}", birthday);
            }

            user.setRole(User.Role.USER);
            user.setIsActive(true);

            User savedUser = userRepository.save(user);
            logger.info("User registered successfully with ID: {} and email: {}", savedUser.getId(), savedUser.getEmail());

            return convertToUserResponse(savedUser);

        } catch (Exception e) {
            logger.error("User registration failed for email: {} - Error: {}", request.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    /**
     * Authenticate user and generate JWT token
     */
    public Map<String, Object> loginUser(UserLoginRequest loginRequest) {
        try {
            logger.info("=== Starting login process for email: {} ===", loginRequest.getEmail());

            // First, check if user exists in database
            Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
            if (userOpt.isEmpty()) {
                logger.error("User not found in database with email: {}", loginRequest.getEmail());
                throw new BadCredentialsException("Invalid email or password");
            }

            User dbUser = userOpt.get();
            logger.info("User found in database: ID={}, Email={}, Active={}, Role={}",
                    dbUser.getId(), dbUser.getEmail(), dbUser.getIsActive(), dbUser.getRole());

            // Check if user is active
            if (!dbUser.getIsActive()) {
                logger.error("User account is deactivated: {}", loginRequest.getEmail());
                throw new BadCredentialsException("Account is deactivated");
            }

            // Verify password
            boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), dbUser.getPassword());
            logger.info("Password verification result: {}", passwordMatches);

            if (!passwordMatches) {
                logger.error("Password does not match for user: {}", loginRequest.getEmail());
                throw new BadCredentialsException("Invalid email or password");
            }

            // Generate JWT token
            String jwt = jwtUtils.generateToken(dbUser.getEmail());
            logger.info("JWT token generated successfully");

            // Update last login time
            dbUser.setLastLogin(LocalDateTime.now());
            userRepository.save(dbUser);
            logger.info("Last login time updated");

            // Create response
            UserResponse userResponse = convertToUserResponse(dbUser);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("type", "Bearer");
            response.put("user", userResponse);
            response.put("message", "Login successful");

            logger.info("=== Login process completed successfully ===");
            return response;

        } catch (BadCredentialsException e) {
            logger.warn("Login failed for email: {} - Bad credentials: {}", loginRequest.getEmail(), e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Login failed for email: {} - Unexpected error: {}", loginRequest.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    /**
     * Manual login method for testing - ADDED MISSING METHOD
     */
    public Map<String, Object> manualLoginUser(UserLoginRequest loginRequest) {
        try {
            logger.info("=== Manual login attempt for email: {} ===", loginRequest.getEmail());

            // Find user by email
            Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
            if (userOpt.isEmpty()) {
                logger.error("User not found: {}", loginRequest.getEmail());
                throw new RuntimeException("Invalid email or password");
            }

            User user = userOpt.get();
            logger.info("User found: {}", user.getEmail());

            // Check if user is active
            if (!user.getIsActive()) {
                logger.error("User account is deactivated: {}", loginRequest.getEmail());
                throw new RuntimeException("Account is deactivated");
            }

            // Verify password
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                logger.error("Password verification failed for user: {}", loginRequest.getEmail());
                throw new RuntimeException("Invalid email or password");
            }

            logger.info("Password verified successfully");

            // Generate JWT token
            String jwt = jwtUtils.generateToken(user.getEmail());
            logger.info("JWT token generated");

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Create response
            UserResponse userResponse = convertToUserResponse(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("type", "Bearer");
            response.put("user", userResponse);
            response.put("message", "Manual login successful");

            logger.info("=== Manual login completed successfully ===");
            return response;

        } catch (Exception e) {
            logger.error("Manual login failed for email: {} - Error: {}", loginRequest.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Manual login failed: " + e.getMessage());
        }
    }

    /**
     * Get current authenticated user
     */
    public UserResponse getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                logger.error("No authenticated user found");
                throw new RuntimeException("No authenticated user found");
            }

            String email = authentication.getName();
            logger.info("Getting current user profile for email: {}", email);

            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                logger.error("User not found: {}", email);
                throw new RuntimeException("User not found: " + email);
            }

            User user = userOpt.get();
            logger.info("Found user: ID={}, Email={}, FirstName={}, LastName={}, DateOfBirth={}",
                    user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getDateOfBirth());

            return convertToUserResponse(user);
        } catch (Exception e) {
            logger.error("Error getting current user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get current user: " + e.getMessage());
        }
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
     * Update user profile - SIMPLIFIED VERSION
     */
    public UserResponse updateUserProfile(Long id, ProfileUpdateRequest request) {
        try {
            logger.info("Updating user profile for ID: {} with data: {}", id, request);

            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found with id: " + id);
            }

            User user = userOpt.get();
            logger.info("Found user for update: {}", user.getEmail());

            // Update basic fields
            if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
                user.setFirstName(request.getFirstName().trim());
            }
            if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
                user.setLastName(request.getLastName().trim());
            }
            if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                user.setEmail(request.getEmail().trim());
            }
            if (request.getPhoneNumber() != null) {
                user.setPhoneNumber(request.getPhoneNumber().trim());
            }

            // Handle date of birth - SIMPLIFIED
            if (request.getDateOfBirth() != null && !request.getDateOfBirth().trim().isEmpty()) {
                try {
                    String dateOfBirth = request.getDateOfBirth().trim();

                    // Validate the date format
                    LocalDate.parse(dateOfBirth, DateTimeFormatter.ofPattern("yyyy-MM-dd"));

                    // Store the date as-is
                    user.setDateOfBirth(dateOfBirth);
                    logger.info("Date of birth set to: {}", dateOfBirth);

                } catch (DateTimeParseException e) {
                    logger.error("Invalid date format: {}", request.getDateOfBirth());
                    throw new RuntimeException("Invalid date format. Please use YYYY-MM-DD format.");
                }
            }

            // Save the user
            User updatedUser = userRepository.save(user);
            logger.info("User profile updated successfully. Date of birth: {}", updatedUser.getDateOfBirth());

            return convertToUserResponse(updatedUser);

        } catch (Exception e) {
            logger.error("Failed to update user profile: {}", e.getMessage(), e);
            throw new RuntimeException("Profile update failed: " + e.getMessage());
        }
    }

    /**
     * Change user password
     */
    public void changePassword(ChangePasswordRequest request) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found");
            }

            User currentUser = userOpt.get();

            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }

            // Update password
            String newHashedPassword = passwordEncoder.encode(request.getNewPassword());
            currentUser.setPassword(newHashedPassword);
            userRepository.save(currentUser);

            logger.info("Password changed successfully for user: {}", currentUser.getEmail());

        } catch (Exception e) {
            logger.error("Password change failed: {}", e.getMessage(), e);
            throw new RuntimeException("Password change failed: " + e.getMessage());
        }
    }

    /**
     * Upload profile picture
     */
    public String uploadProfilePicture(MultipartFile file) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found");
            }

            User currentUser = userOpt.get();

            // Create upload directory if it doesn't exist
            String uploadDir = "uploads/profile-pictures";
            Path uploadPath = Paths.get(uploadDir);

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

            currentUser.setProfilePicture(profilePictureUrl);
            userRepository.save(currentUser);

            logger.info("Profile picture uploaded successfully for user: {}", currentUser.getEmail());

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
     * Deactivate user account - ADDED MISSING METHOD
     */
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
     * Get user statistics for admin dashboard - ADDED MISSING METHOD
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
        UserResponse response = new UserResponse(
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

        logger.debug("Converted user to response: {}", response);
        return response;
    }

    /**
     * Inner class for user statistics - ADDED MISSING CLASS
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