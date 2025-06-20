package com.example.adminbackend.controller;

import com.example.adminbackend.entity.User;
import com.example.adminbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TestController {

    private static final Logger logger = LoggerFactory.getLogger(TestController.class);

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsersTest() {
        try {
            logger.info("=== Testing direct user repository access ===");

            List<User> users = userRepository.findAll();
            logger.info("Found {} users in database", users.size());

            for (User user : users) {
                logger.info("User: ID={}, Email={}, FirstName={}, LastName={}, DateOfBirth={}, Phone={}",
                        user.getId(), user.getEmail(), user.getFirstName(),
                        user.getLastName(), user.getDateOfBirth(), user.getPhoneNumber());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", users.size());
            response.put("users", users);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Test failed: {}", e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<Map<String, Object>> getUserByEmailTest(@PathVariable String email) {
        try {
            logger.info("=== Testing user lookup by email: {} ===", email);

            var userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                logger.warn("No user found with email: {}", email);
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            logger.info("Found user: {}", user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Test failed: {}", e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/db-connection")
    public ResponseEntity<Map<String, Object>> testDatabaseConnection() {
        try {
            logger.info("=== Testing database connection ===");

            long userCount = userRepository.count();
            logger.info("Total users in database: {}", userCount);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Database connection successful");
            response.put("userCount", userCount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Database connection test failed: {}", e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}