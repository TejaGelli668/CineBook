//package com.example.adminbackend.controller;
//
//import com.example.adminbackend.dto.*;
//import com.example.adminbackend.service.UserService;
//import jakarta.validation.Valid;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/user")
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
//public class UserController {
//
//    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
//
//    @Autowired
//    private UserService userService;
//
//    /**
//     * User Registration
//     */
//    @PostMapping("/register")
//    public ResponseEntity<ApiResponse<UserResponse>> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
//        try {
//            logger.info("User registration attempt for email: {}", request.getEmail());
//            UserResponse userResponse = userService.registerUser(request);
//
//            ApiResponse<UserResponse> response = new ApiResponse<>(true, "User registered successfully", userResponse);
//            logger.info("User registration successful for email: {}", request.getEmail());
//            return ResponseEntity.status(HttpStatus.CREATED).body(response);
//
//        } catch (Exception e) {
//            logger.error("User registration failed: {}", e.getMessage());
//            ApiResponse<UserResponse> response = new ApiResponse<>(false, e.getMessage(), null);
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//    }
//
//    /**
//     * User Login
//     */
//    @PostMapping("/login")
//    public ResponseEntity<ApiResponse<Map<String, Object>>> loginUser(@Valid @RequestBody UserLoginRequest loginRequest) {
//        try {
//            logger.info("User login attempt for email: {}", loginRequest.getEmail());
//            Map<String, Object> loginResponse = userService.loginUser(loginRequest);
//
//            ApiResponse<Map<String, Object>> response = new ApiResponse<>(true, "Login successful", loginResponse);
//            logger.info("User login successful for email: {}", loginRequest.getEmail());
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            logger.error("User login failed: {}", e.getMessage());
//            ApiResponse<Map<String, Object>> response = new ApiResponse<>(false, e.getMessage(), null);
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//        }
//    }
//
//    /**
//     * Manual Login (for testing)
//     */
//    @PostMapping("/manual-login")
//    public ResponseEntity<ApiResponse<Map<String, Object>>> manualLoginUser(@Valid @RequestBody UserLoginRequest loginRequest) {
//        try {
//            logger.info("Manual login attempt for email: {}", loginRequest.getEmail());
//            Map<String, Object> loginResponse = userService.manualLoginUser(loginRequest);
//
//            ApiResponse<Map<String, Object>> response = new ApiResponse<>(true, "Manual login successful", loginResponse);
//            logger.info("Manual login successful for email: {}", loginRequest.getEmail());
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            logger.error("Manual login failed: {}", e.getMessage());
//            ApiResponse<Map<String, Object>> response = new ApiResponse<>(false, e.getMessage(), null);
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//        }
//    }
//
//    /**
//     * Get Current User Profile - WITH DEBUGGING
//     */
//    @GetMapping("/profile")
//    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUserProfile() {
//        try {
//            logger.info("=== Getting current user profile ===");
//
//            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//            logger.info("Authentication object: {}", auth != null ? auth.getName() : "null");
//            logger.info("Authentication details: {}", auth != null ? auth.getDetails() : "null");
//            logger.info("Authentication authorities: {}", auth != null ? auth.getAuthorities() : "null");
//
//            UserResponse userResponse = userService.getCurrentUser();
//            logger.info("User profile retrieved successfully: {}", userResponse);
//
//            ApiResponse<UserResponse> response = new ApiResponse<>(true, "Profile retrieved successfully", userResponse);
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            logger.error("Failed to get user profile: {}", e.getMessage(), e);
//            ApiResponse<UserResponse> response = new ApiResponse<>(false, e.getMessage(), null);
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//    }
//
//    /**
//     * Update User Profile - WITH DEBUGGING
//     */
//    @PutMapping("/profile")
//    public ResponseEntity<ApiResponse<UserResponse>> updateUserProfile(@Valid @RequestBody ProfileUpdateRequest request) {
//        try {
//            logger.info("=== Profile update request received ===");
//            logger.info("Request data: {}", request);
//
//            // Get current user ID from authentication
//            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//            String email = authentication.getName();
//            logger.info("Authenticated user email: {}", email);
//
//            // Get user by email to find ID
//            UserResponse currentUser = userService.getCurrentUser();
//            Long userId = currentUser.getId();
//
//            logger.info("Updating profile for user ID: {}", userId);
//
//            UserResponse updatedUser = userService.updateUserProfile(userId, request);
//
//            ApiResponse<UserResponse> response = new ApiResponse<>(true, "Profile updated successfully", updatedUser);
//            logger.info("User profile updated successfully for ID: {}", userId);
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            logger.error("Profile update failed: {}", e.getMessage(), e);
//            ApiResponse<UserResponse> response = new ApiResponse<>(false, e.getMessage(), null);
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//    }
//
//    /**
//     * Change Password
//     */
//    @PostMapping("/change-password")
//    public ResponseEntity<ApiResponse<Object>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
//        try {
//            logger.info("Password change request received");
//            userService.changePassword(request);
//
//            ApiResponse<Object> response = new ApiResponse<>(true, "Password changed successfully", null);
//            logger.info("Password changed successfully");
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            logger.error("Password change failed: {}", e.getMessage());
//            ApiResponse<Object> response = new ApiResponse<>(false, e.getMessage(), null);
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//    }
//
//    /**
//     * Upload Profile Picture
//     */
//    @PostMapping("/profile-picture")
//    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
//        try {
//            logger.info("Profile picture upload request received");
//
//            if (file.isEmpty()) {
//                throw new RuntimeException("Please select a file to upload");
//            }
//
//            // Check file size (limit to 5MB)
//            if (file.getSize() > 5 * 1024 * 1024) {
//                throw new RuntimeException("File size exceeds maximum limit of 5MB");
//            }
//
//            // Check file type
//            String contentType = file.getContentType();
//            if (contentType == null || !contentType.startsWith("image/")) {
//                throw new RuntimeException("Only image files are allowed");
//            }
//
//            String profilePictureUrl = userService.uploadProfilePicture(file);
//
//            Map<String, String> responseData = new HashMap<>();
//            responseData.put("profilePictureUrl", profilePictureUrl);
//
//            ApiResponse<Map<String, String>> response = new ApiResponse<>(true, "Profile picture uploaded successfully", responseData);
//            logger.info("Profile picture uploaded successfully");
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            logger.error("Profile picture upload failed: {}", e.getMessage());
//            ApiResponse<Map<String, String>> response = new ApiResponse<>(false, e.getMessage(), null);
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//    }
//
//    /**
//     * Get All Users (Admin only)
//     */
//    @GetMapping("/all")
//    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
//        try {
//            logger.info("Getting all users");
//            List<UserResponse> users = userService.getAllUsers();
//
//            ApiResponse<List<UserResponse>> response = new ApiResponse<>(true, "Users retrieved successfully", users);
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            logger.error("Failed to get all users: {}", e.getMessage());
//            ApiResponse<List<UserResponse>> response = new ApiResponse<>(false, e.getMessage(), null);
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//    }
//
//    /**
//     * Get User by ID
//     */
//    @GetMapping("/{id}")
//    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
//        try {
//            logger.info("Getting user by ID: {}", id);
//            UserResponse user = userService.getUserById(id);
//
//            ApiResponse<UserResponse> response = new ApiResponse<>(true, "User retrieved successfully", user);
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            logger.error("Failed to get user by ID {}: {}", id, e.getMessage());
//            ApiResponse<UserResponse> response = new ApiResponse<>(false, e.getMessage(), null);
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
//        }
//    }
//
//    /**
//     * Deactivate User (Admin only)
//     */
//    @PutMapping("/{id}/deactivate")
//    public ResponseEntity<ApiResponse<Object>> deactivateUser(@PathVariable Long id) {
//        try {
//            logger.info("Deactivating user with ID: {}", id);
//            userService.deactivateUser(id);
//
//            ApiResponse<Object> response = new ApiResponse<>(true, "User deactivated successfully", null);
//            logger.info("User deactivated successfully: {}", id);
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            logger.error("Failed to deactivate user {}: {}", id, e.getMessage());
//            ApiResponse<Object> response = new ApiResponse<>(false, e.getMessage(), null);
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//    }
//
//    /**
//     * Get User Statistics (Admin only)
//     */
//    @GetMapping("/stats")
//    public ResponseEntity<ApiResponse<UserService.UserStats>> getUserStats() {
//        try {
//            logger.info("Getting user statistics");
//            UserService.UserStats stats = userService.getUserStats();
//
//            ApiResponse<UserService.UserStats> response = new ApiResponse<>(true, "User statistics retrieved successfully", stats);
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            logger.error("Failed to get user statistics: {}", e.getMessage());
//            ApiResponse<UserService.UserStats> response = new ApiResponse<>(false, e.getMessage(), null);
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//    }
//
//    /**
//     * Validate User Token
//     */
//    @GetMapping("/validate")
//    public ResponseEntity<ApiResponse<Object>> validateToken() {
//        try {
//            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//
//            if (authentication == null || !authentication.isAuthenticated()) {
//                throw new RuntimeException("Invalid token");
//            }
//
//            ApiResponse<Object> response = new ApiResponse<>(true, "Token is valid", null);
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            logger.error("Token validation failed: {}", e.getMessage());
//            ApiResponse<Object> response = new ApiResponse<>(false, "Invalid token", null);
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//        }
//    }
//
//    /**
//     * User Logout
//     */
//    @PostMapping("/logout")
//    public ResponseEntity<ApiResponse<Object>> logout() {
//        try {
//            logger.info("User logout request received");
//
//            // Clear security context
//            SecurityContextHolder.clearContext();
//
//            ApiResponse<Object> response = new ApiResponse<>(true, "Logged out successfully", null);
//            logger.info("User logged out successfully");
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            logger.error("Logout failed: {}", e.getMessage());
//            ApiResponse<Object> response = new ApiResponse<>(false, e.getMessage(), null);
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//    }
//}
package com.example.adminbackend.controller;

import com.example.adminbackend.dto.*;
import com.example.adminbackend.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.adminbackend.entity.Booking;
import com.example.adminbackend.repository.BookingRepository;
import java.util.stream.Collectors;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;
    @Autowired
    private BookingRepository bookingRepository;

    /**
     * User Registration
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            logger.info("User registration attempt for email: {}", request.getEmail());
            UserResponse userResponse = userService.registerUser(request);

            ApiResponse<UserResponse> response = new ApiResponse<>(true, "User registered successfully", userResponse);
            logger.info("User registration successful for email: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            logger.error("User registration failed: {}", e.getMessage());
            ApiResponse<UserResponse> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * User Login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> loginUser(@Valid @RequestBody UserLoginRequest loginRequest) {
        try {
            logger.info("User login attempt for email: {}", loginRequest.getEmail());
            Map<String, Object> loginResponse = userService.loginUser(loginRequest);

            ApiResponse<Map<String, Object>> response = new ApiResponse<>(true, "Login successful", loginResponse);
            logger.info("User login successful for email: {}", loginRequest.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("User login failed: {}", e.getMessage());
            ApiResponse<Map<String, Object>> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * Manual Login (for testing)
     */
    @PostMapping("/manual-login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> manualLoginUser(@Valid @RequestBody UserLoginRequest loginRequest) {
        try {
            logger.info("Manual login attempt for email: {}", loginRequest.getEmail());
            Map<String, Object> loginResponse = userService.manualLoginUser(loginRequest);

            ApiResponse<Map<String, Object>> response = new ApiResponse<>(true, "Manual login successful", loginResponse);
            logger.info("Manual login successful for email: {}", loginRequest.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Manual login failed: {}", e.getMessage());
            ApiResponse<Map<String, Object>> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * Get Current User Profile - WITH DEBUGGING
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUserProfile() {
        try {
            logger.info("=== Getting current user profile ===");

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            logger.info("Authentication object: {}", auth != null ? auth.getName() : "null");
            logger.info("Authentication details: {}", auth != null ? auth.getDetails() : "null");
            logger.info("Authentication authorities: {}", auth != null ? auth.getAuthorities() : "null");

            UserResponse userResponse = userService.getCurrentUser();
            logger.info("User profile retrieved successfully: {}", userResponse);

            ApiResponse<UserResponse> response = new ApiResponse<>(true, "Profile retrieved successfully", userResponse);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to get user profile: {}", e.getMessage(), e);
            ApiResponse<UserResponse> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Update User Profile - WITH DEBUGGING
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        try {
            logger.info("=== Profile update request received ===");
            logger.info("Request data: {}", request);

            // Get current user ID from authentication
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            logger.info("Authenticated user email: {}", email);

            // Get user by email to find ID
            UserResponse currentUser = userService.getCurrentUser();
            Long userId = currentUser.getId();

            logger.info("Updating profile for user ID: {}", userId);

            UserResponse updatedUser = userService.updateUserProfile(userId, request);

            ApiResponse<UserResponse> response = new ApiResponse<>(true, "Profile updated successfully", updatedUser);
            logger.info("User profile updated successfully for ID: {}", userId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Profile update failed: {}", e.getMessage(), e);
            ApiResponse<UserResponse> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Change Password
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Object>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            logger.info("Password change request received");
            userService.changePassword(request);

            ApiResponse<Object> response = new ApiResponse<>(true, "Password changed successfully", null);
            logger.info("Password changed successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Password change failed: {}", e.getMessage());
            ApiResponse<Object> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Upload Profile Picture
     */
    @PostMapping("/profile-picture")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            logger.info("Profile picture upload request received");

            if (file.isEmpty()) {
                throw new RuntimeException("Please select a file to upload");
            }

            // Check file size (limit to 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                throw new RuntimeException("File size exceeds maximum limit of 5MB");
            }

            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("Only image files are allowed");
            }

            String profilePictureUrl = userService.uploadProfilePicture(file);

            Map<String, String> responseData = new HashMap<>();
            responseData.put("profilePictureUrl", profilePictureUrl);

            ApiResponse<Map<String, String>> response = new ApiResponse<>(true, "Profile picture uploaded successfully", responseData);
            logger.info("Profile picture uploaded successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Profile picture upload failed: {}", e.getMessage());
            ApiResponse<Map<String, String>> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get All Users (Admin only)
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        try {
            logger.info("Getting all users");
            List<UserResponse> users = userService.getAllUsers();

            ApiResponse<List<UserResponse>> response = new ApiResponse<>(true, "Users retrieved successfully", users);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to get all users: {}", e.getMessage());
            ApiResponse<List<UserResponse>> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get User by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        try {
            logger.info("Getting user by ID: {}", id);
            UserResponse user = userService.getUserById(id);

            ApiResponse<UserResponse> response = new ApiResponse<>(true, "User retrieved successfully", user);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to get user by ID {}: {}", id, e.getMessage());
            ApiResponse<UserResponse> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Deactivate User (Admin only)
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Object>> deactivateUser(@PathVariable Long id) {
        try {
            logger.info("Deactivating user with ID: {}", id);
            userService.deactivateUser(id);

            ApiResponse<Object> response = new ApiResponse<>(true, "User deactivated successfully", null);
            logger.info("User deactivated successfully: {}", id);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to deactivate user {}: {}", id, e.getMessage());
            ApiResponse<Object> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get User Statistics (Admin only)
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<UserService.UserStats>> getUserStats() {
        try {
            logger.info("Getting user statistics");
            UserService.UserStats stats = userService.getUserStats();

            ApiResponse<UserService.UserStats> response = new ApiResponse<>(true, "User statistics retrieved successfully", stats);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to get user statistics: {}", e.getMessage());
            ApiResponse<UserService.UserStats> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Validate User Token
     */
    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Object>> validateToken() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                throw new RuntimeException("Invalid token");
            }

            ApiResponse<Object> response = new ApiResponse<>(true, "Token is valid", null);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Token validation failed: {}", e.getMessage());
            ApiResponse<Object> response = new ApiResponse<>(false, "Invalid token", null);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * User Logout
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout() {
        try {
            logger.info("User logout request received");

            // Clear security context
            SecurityContextHolder.clearContext();

            ApiResponse<Object> response = new ApiResponse<>(true, "Logged out successfully", null);
            logger.info("User logged out successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Logout failed: {}", e.getMessage());
            ApiResponse<Object> response = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUserBookings() {
        try {
            logger.info("=== Getting user bookings ===");

            // Get current user from authentication
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            logger.info("Fetching bookings for user: {}", email);

            // Get user by email
            UserResponse currentUser = userService.getCurrentUser();
            Long userId = currentUser.getId();

            // Fetch user bookings - you might need to adjust this based on your Booking entity
            List<Booking> bookings = bookingRepository.findByUserIdOrderByBookingTimeDesc(userId);

            // Transform bookings to DTO format for frontend
            List<Map<String, Object>> bookingDTOs = bookings.stream().map(booking -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", booking.getId());
                dto.put("bookingId", booking.getBookingId());

                // Handle movie and theater info
                if (booking.getShow() != null) {
                    if (booking.getShow().getMovie() != null) {
                        dto.put("movieTitle", booking.getShow().getMovie().getTitle());
                    }
                    if (booking.getShow().getTheater() != null) {
                        dto.put("theaterName", booking.getShow().getTheater().getName());
                        dto.put("theaterLocation", booking.getShow().getTheater().getLocation());
                    }

                    // Format dates
                    dto.put("bookingDate", booking.getShow().getShowTime().toLocalDate().toString());
                    dto.put("showTime", booking.getShow().getShowTime().toLocalTime().toString());
                }

                dto.put("totalAmount", booking.getTotalAmount());
                dto.put("status", booking.getStatus().toString().toLowerCase());
                dto.put("createdAt", booking.getBookingTime().toString());

                // Add seat information if available
                if (booking.getSeats() != null && !booking.getSeats().isEmpty()) {
                    List<String> seatNumbers = booking.getSeats().stream()
                            .filter(showSeat -> showSeat.getSeat() != null)
                            .map(showSeat -> showSeat.getSeat().getSeatNumber())
                            .collect(Collectors.toList());
                    dto.put("seatNumbers", String.join(", ", seatNumbers));
                }

                return dto;
            }).collect(Collectors.toList());

            ApiResponse<List<Map<String, Object>>> response = new ApiResponse<>(
                    true,
                    "Bookings retrieved successfully",
                    bookingDTOs
            );

            logger.info("Retrieved {} bookings for user {}", bookingDTOs.size(), userId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to get user bookings: {}", e.getMessage(), e);
            ApiResponse<List<Map<String, Object>>> response = new ApiResponse<>(
                    false,
                    "Failed to retrieve bookings: " + e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}