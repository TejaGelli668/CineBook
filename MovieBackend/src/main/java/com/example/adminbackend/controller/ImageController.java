package com.example.adminbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ImageController {

    // Valid upload categories
    private final Set<String> VALID_CATEGORIES = Set.of(
            "profile-pictures",
            "food-images",
            "theater-images",
            "promotional-images"
    );

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.adminbackend.service.StorageService storage;

    // Upload an image into a category; returns where it's stored (Supabase URL or /uploads/ path)
    @PostMapping("/upload/{category}")
    public ResponseEntity<?> uploadImage(
            @PathVariable String category,
            @RequestParam("image") MultipartFile file) {
        if (!VALID_CATEGORIES.contains(category)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid upload category"));
        }
        try {
            String imageUrl = storage.store(category, file);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imageUrl", imageUrl);
            response.put("filename", imageUrl.substring(imageUrl.lastIndexOf('/') + 1));
            response.put("category", category);
            return ResponseEntity.ok(response);
        } catch (com.example.adminbackend.service.StorageService.UploadException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Convenience endpoint for food images (maintains your current frontend expectation)
    @PostMapping("/upload/image")
    public ResponseEntity<?> uploadFoodImage(@RequestParam("image") MultipartFile file) {
        return uploadImage("food-images", file);
    }

    // Convenience endpoint for profile pictures
    @PostMapping("/upload/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("image") MultipartFile file) {
        return uploadImage("profile-pictures", file);
    }


    // Optional: Get upload categories
    @GetMapping("/upload/categories")
    public ResponseEntity<?> getUploadCategories() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "categories", VALID_CATEGORIES
        ));
    }
}