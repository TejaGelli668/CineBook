//package com.example.adminbackend.controller;
//
//import org.springframework.core.io.Resource;
//import org.springframework.core.io.UrlResource;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.io.IOException;
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//
//@RestController
//@RequestMapping("/uploads")
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
//public class ImageController {
//
//    private final Path uploadLocation = Paths.get("uploads");
//
//    @GetMapping("/profile-pictures/{filename:.+}")
//    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
//        try {
//            Path file = uploadLocation.resolve("profile-pictures").resolve(filename);
//            Resource resource = new UrlResource(file.toUri());
//
//            if (resource.exists() && resource.isReadable()) {
//                String contentType = Files.probeContentType(file);
//                if (contentType == null) {
//                    contentType = "application/octet-stream";
//                }
//
//                return ResponseEntity.ok()
//                        .contentType(MediaType.parseMediaType(contentType))
//                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
//                        .body(resource);
//            } else {
//                return ResponseEntity.notFound().build();
//            }
//        } catch (IOException e) {
//            return ResponseEntity.internalServerError().build();
//        }
//    }
//}
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
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:3001"})
public class ImageController {

    private final Path uploadLocation = Paths.get("uploads");

    // Valid upload categories
    private final Set<String> VALID_CATEGORIES = Set.of(
            "profile-pictures",
            "food-images",
            "theater-images",
            "promotional-images"
    );

    // Generic upload endpoint that works with your existing structure
    @PostMapping("/upload/{category}")
    public ResponseEntity<?> uploadImage(
            @PathVariable String category,
            @RequestParam("image") MultipartFile file) {
        try {
            // Validate category
            if (!VALID_CATEGORIES.contains(category)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid upload category"));
            }

            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "No file selected"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !isValidImageType(contentType)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed"));
            }

            // Validate file size (5MB limit)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File size too large. Maximum 5MB allowed"));
            }

            // Create category directory if it doesn't exist
            Path categoryDir = uploadLocation.resolve(category);
            if (!Files.exists(categoryDir)) {
                Files.createDirectories(categoryDir);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path targetPath = categoryDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // Return the URL that matches your existing ImageController pattern
            String imageUrl = "http://localhost:8080/uploads/" + category + "/" + uniqueFilename;

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imageUrl", imageUrl);
            response.put("filename", uniqueFilename);
            response.put("category", category);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
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

    private boolean isValidImageType(String contentType) {
        return contentType.equals("image/jpeg") ||
                contentType.equals("image/jpg") ||
                contentType.equals("image/png") ||
                contentType.equals("image/gif") ||
                contentType.equals("image/webp");
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