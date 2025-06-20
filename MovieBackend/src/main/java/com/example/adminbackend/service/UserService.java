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
            logger.info("Starting user registration for email: {}", request.getEmail());

            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                logger.warn("User already exists with email: {}", request.getEmail());
                throw new RuntimeException("User already exists with email: " + request.getEmail());
            }

            // Create new user
            User user = new User();
            user.setEmail(request.getEmail());

            // Encode password and log for debugging
            String encodedPassword = passwordEncoder.encode(request.getPassword());
            logger.info("Password encoded successfully for user: {}", request.getEmail());
            user.setPassword(encodedPassword);

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
    @Transactional
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

            // Verify password manually first for debugging
            boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), dbUser.getPassword());
            logger.info("Password verification result: {}", passwordMatches);

            if (!passwordMatches) {
                logger.error("Password does not match for user: {}", loginRequest.getEmail());
                throw new BadCredentialsException("Invalid email or password");
            }

            // Generate JWT token using the string overloaded method
            String jwt = jwtUtils.generateToken(dbUser.getEmail());
            logger.info("JWT token generated successfully");

            // Update last login time
            dbUser.setLastLogin(LocalDateTime.now());
            userRepository.save(dbUser);
            logger.info("Last login time updated");

            // Create response
            UserResponse userResponse = convertToUserResponse(dbUser);

            logger.info("User logged in successfully: {}", dbUser.getEmail());

            // Return a Map that matches the expected structure
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("type", "Bearer");
            response.put("user", userResponse);
            response.put("message", "Login successful");

            logger.info("=== Login process completed successfully ===");
            return response;

        } catch (BadCredentialsException e) {
            logger.warn("Login failed for email: {} - Bad credentials: {}", loginRequest.getEmail(), e.getMessage());
            throw new BadCredentialsException("Invalid email or password");
        } catch (Exception e) {
            logger.error("Login failed for email: {} - Unexpected error: {}", loginRequest.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    /**
     * Manual login method for testing
     */
    @Transactional
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

            // Generate JWT token using the string overloaded method
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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        // For JWT-based authentication, get user by email from token
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + email);
        }

        return convertToUserResponse(userOpt.get());
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
     * Update user profile - ORIGINAL METHOD (keep for backward compatibility)
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
            String birthday = String.format("%04d-%02d-%02d",
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
     * Update user profile - Works with ProfileUpdateRequest
     */
    @Transactional
    public UserResponse updateUserProfile(Long id, ProfileUpdateRequest request) {
        try {
            logger.info("Updating user profile for ID: {} with data: {}", id, request);

            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found with id: " + id);
            }

            User user = userOpt.get();

            // Update basic fields
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPhoneNumber(request.getPhoneNumber());

            // Handle birthday conversion from Birthday object to string
            if (request.getBirthday() != null) {
                UserRegistrationRequest.Birthday birthday = request.getBirthday();

                if (birthday.getYear() > 0 && birthday.getMonth() > 0 && birthday.getDay() > 0) {
                    String dateOfBirth = String.format("%04d-%02d-%02d",
                            birthday.getYear(),
                            birthday.getMonth(),
                            birthday.getDay()
                    );
                    logger.info("Setting date of birth to: {}", dateOfBirth);
                    user.setDateOfBirth(dateOfBirth);
                    logger.info("Date of birth set successfully as string: {}", dateOfBirth);
                } else {
                    logger.warn("Invalid birthday data: year={}, month={}, day={}",
                            birthday.getYear(), birthday.getMonth(), birthday.getDay());
                }
            }

            User updatedUser = userRepository.save(user);

            logger.info("User profile updated successfully. Date of birth: {}", updatedUser.getDateOfBirth());

            return convertToUserResponse(updatedUser);

        } catch (Exception e) {
            logger.error("Failed to update user profile: {}", e.getMessage());
            throw new RuntimeException("Profile update failed: " + e.getMessage());
        }
    }

    /**
     * Change user password
     */
    @Transactional
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
            logger.error("Password change failed: {}", e.getMessage());
            throw new RuntimeException("Password change failed: " + e.getMessage());
        }
    }

    /**
     * Upload profile picture
     */
    @Transactional
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