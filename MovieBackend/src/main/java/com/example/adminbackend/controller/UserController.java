package com.example.adminbackend.controller;

import com.example.adminbackend.dto.*;
import com.example.adminbackend.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    /**
     * User registration endpoint
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            logger.info("User registration attempt for email: {}", request.getEmail());

            UserResponse userResponse = userService.registerUser(request);

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "User registered successfully",
                    userResponse
            ));

        } catch (Exception e) {
            logger.error("User registration failed for email: {} - Error: {}", request.getEmail(), e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * User login endpoint - UPDATED to use UserLoginRequest
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody UserLoginRequest loginRequest) {
        try {
            logger.info("User login attempt for email: {}", loginRequest.getEmail());

            Map<String, Object> loginResponse = userService.loginUser(loginRequest);

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Login successful",
                    loginResponse
            ));

        } catch (Exception e) {
            logger.error("User login failed for email: {} - Error: {}", loginRequest.getEmail(), e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Get current authenticated user details
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getCurrentUser() {
        try {
            UserResponse userResponse = userService.getCurrentUser();

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "User details retrieved successfully",
                    userResponse
            ));

        } catch (Exception e) {
            logger.error("Failed to get current user: {}", e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Update user profile - UPDATED TO WORK WITH EXISTING ProfileUpdateRequest
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> requestBody) {
        try {
            // Get current user ID from security context
            UserResponse currentUser = userService.getCurrentUser();

            // Create ProfileUpdateRequest using existing structure
            ProfileUpdateRequest profileRequest = new ProfileUpdateRequest();
            profileRequest.setEmail((String) requestBody.get("email"));
            profileRequest.setFirstName((String) requestBody.get("firstName"));
            profileRequest.setLastName((String) requestBody.get("lastName"));
            profileRequest.setPhoneNumber((String) requestBody.get("phoneNumber"));

            // Handle birthday conversion to existing Birthday object
            Object birthdayObj = requestBody.get("birthday");
            if (birthdayObj != null && birthdayObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> birthdayMap = (Map<String, Object>) birthdayObj;
                UserRegistrationRequest.Birthday birthday = new UserRegistrationRequest.Birthday();

                if (birthdayMap.get("year") != null) {
                    birthday.setYear((Integer) birthdayMap.get("year"));
                }
                if (birthdayMap.get("month") != null) {
                    birthday.setMonth((Integer) birthdayMap.get("month"));
                }
                if (birthdayMap.get("day") != null) {
                    birthday.setDay((Integer) birthdayMap.get("day"));
                }

                profileRequest.setBirthday(birthday);
            }

            // Use the updateUserProfile method that works with ProfileUpdateRequest
            UserResponse updatedUser = userService.updateUserProfile(currentUser.getId(), profileRequest);

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Profile updated successfully",
                    updatedUser
            ));

        } catch (Exception e) {
            logger.error("Profile update failed: {}", e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Change user password
     */
    @PutMapping("/change-password")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            logger.info("Password change request for current user");

            userService.changePassword(request);

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Password changed successfully",
                    null
            ));

        } catch (Exception e) {
            logger.error("Password change failed: {}", e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Upload profile picture
     */
    @PostMapping("/upload-profile-picture")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            logger.info("Profile picture upload request");

            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(
                                false,
                                "No file provided",
                                null
                        ));
            }

            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(
                                false,
                                "Only image files are allowed",
                                null
                        ));
            }

            // Check file size (5MB limit)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(
                                false,
                                "File size must be less than 5MB",
                                null
                        ));
            }

            String profilePictureUrl = userService.uploadProfilePicture(file);

            Map<String, String> responseData = Map.of("profilePictureUrl", profilePictureUrl);

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Profile picture uploaded successfully",
                    responseData
            ));

        } catch (Exception e) {
            logger.error("Profile picture upload failed: {}", e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Get all users (Admin only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserResponse> users = userService.getAllUsers();

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Users retrieved successfully",
                    users
            ));

        } catch (Exception e) {
            logger.error("Failed to get all users: {}", e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Get user by ID (Admin only)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserResponse userResponse = userService.getUserById(id);

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "User details retrieved successfully",
                    userResponse
            ));

        } catch (Exception e) {
            logger.error("Failed to get user by ID {}: {}", id, e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Deactivate user (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        try {
            userService.deactivateUser(id);

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "User deactivated successfully",
                    null
            ));

        } catch (Exception e) {
            logger.error("Failed to deactivate user {}: {}", id, e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Delete/Deactivate current user account
     */
    @DeleteMapping("/account")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteAccount() {
        try {
            UserResponse currentUser = userService.getCurrentUser();
            userService.deactivateUser(currentUser.getId());

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Account deactivated successfully",
                    null
            ));

        } catch (Exception e) {
            logger.error("Account deletion failed: {}", e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Get user statistics (Admin only)
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getUserStats() {
        try {
            UserService.UserStats stats = userService.getUserStats();

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "User statistics retrieved successfully",
                    stats
            ));

        } catch (Exception e) {
            logger.error("Failed to get user statistics: {}", e.getMessage());

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }
}