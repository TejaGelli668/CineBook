//// src/main/java/com/example/adminbackend/controller/MovieController.java
//package com.example.adminbackend.controller;
//
//import com.example.adminbackend.entity.Movie;
//import com.example.adminbackend.entity.Show;
//import com.example.adminbackend.service.MovieService;
//import com.example.adminbackend.service.ShowService;
//import com.example.adminbackend.dto.ApiResponse;
//import jakarta.validation.Valid;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.List;
//import java.util.Map;
//import org.springframework.web.multipart.MultipartFile;
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.nio.file.StandardCopyOption;
//import java.util.UUID;
//import java.io.IOException;
//
//import org.springframework.security.access.prepost.PreAuthorize;
//
//@RestController
//@RequestMapping({ "/movies", "/api/movies" })
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
//public class MovieController {
//
//    @Autowired
//    private MovieService service;
//
//    @Autowired
//    private ShowService showService;
//
//    @GetMapping
//    public ResponseEntity<ApiResponse<List<Movie>>> getAll() {
//        List<Movie> movies = service.findAll();
//        return ResponseEntity.ok(new ApiResponse<>(true, "Movies retrieved", movies));
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<ApiResponse<Movie>> getOne(@PathVariable Long id) {
//        Movie m = service.findById(id)
//                .orElseThrow(() -> new RuntimeException("Movie not found with id " + id));
//        return ResponseEntity.ok(new ApiResponse<>(true, "Movie retrieved", m));
//    }
//
//    @GetMapping("/{id}/shows")
//    public ResponseEntity<ApiResponse<List<Show>>> getMovieShows(@PathVariable Long id) {
//        // First verify the movie exists
//        Movie movie = service.findById(id)
//                .orElseThrow(() -> new RuntimeException("Movie not found with id " + id));
//
//        // Get all shows for this movie
//        List<Show> shows = showService.findByMovieId(id);
//
//        return ResponseEntity.ok(new ApiResponse<>(true, "Shows retrieved for movie", shows));
//    }
//
//    @PostMapping
//    public ResponseEntity<ApiResponse<Movie>> create(@Valid @RequestBody Movie movie) {
//        Movie saved = service.save(movie);
//        return ResponseEntity.ok(new ApiResponse<>(true, "Movie created", saved));
//    }
//
//    @PutMapping("/{id}")
//    public ResponseEntity<ApiResponse<Movie>> update(
//            @PathVariable Long id,
//            @Valid @RequestBody Movie movie
//    ) {
//        Movie existing = service.findById(id)
//                .orElseThrow(() -> new RuntimeException("Movie not found with id " + id));
//
//        // full replace – all fields must be provided
//        existing.setTitle(movie.getTitle());
//        existing.setGenre(movie.getGenre());
//        existing.setDuration(movie.getDuration());
//        existing.setRating(movie.getRating());
//        existing.setLanguage(movie.getLanguage());
//        existing.setReleaseDate(movie.getReleaseDate());
//        existing.setPrice(movie.getPrice());
//        existing.setDescription(movie.getDescription());
//        existing.setDirector(movie.getDirector());
//        existing.setCast(movie.getCast());
//        existing.setTrailer(movie.getTrailer());
//        existing.setPosterUrl(movie.getPosterUrl());
//        existing.setFormat(movie.getFormat());
//        existing.setCertificate(movie.getCertificate());
//        existing.setStatus(movie.getStatus());
//
//        Movie updated = service.save(existing);
//        return ResponseEntity.ok(new ApiResponse<>(true, "Movie updated", updated));
//    }
//
//    @PatchMapping("/{id}")
//    public ResponseEntity<ApiResponse<Movie>> patch(
//            @PathVariable Long id,
//            @RequestBody Map<String, Object> updates
//    ) {
//        Movie movie = service.findById(id)
//                .orElseThrow(() -> new RuntimeException("Movie not found with id " + id));
//
//        updates.forEach((prop, value) -> {
//            switch (prop) {
//                case "title":
//                    movie.setTitle((String) value); break;
//                case "genre":
//                    movie.setGenre((String) value); break;
//                case "duration":
//                    movie.setDuration((String) value); break;
//                case "rating":
//                    movie.setRating(((Number) value).doubleValue()); break;
//                case "language":
//                    movie.setLanguage((String) value); break;
//                case "releaseDate":
//                    movie.setReleaseDate(LocalDate.parse((String) value)); break;
//                case "price":
//                    movie.setPrice(BigDecimal.valueOf(((Number) value).doubleValue())); break;
//                case "description":
//                    movie.setDescription((String) value); break;
//                case "director":
//                    movie.setDirector((String) value); break;
//                case "cast":
//                    @SuppressWarnings("unchecked")
//                    List<String> cast = (List<String>) value;
//                    movie.setCast(cast); break;
//                case "trailer":
//                    movie.setTrailer((String) value); break;
//                case "posterUrl":
//                    movie.setPosterUrl((String) value); break;
//                case "format":
//                    @SuppressWarnings("unchecked")
//                    List<String> fmt = (List<String>) value;
//                    movie.setFormat(fmt); break;
//                case "certificate":
//                    movie.setCertificate((String) value); break;
//                case "status":
//                    movie.setStatus((String) value); break;
//                default:
//                    // ignore unknown props
//            }
//        });
//
//        Movie updated = service.save(movie);
//        return ResponseEntity.ok(new ApiResponse<>(true, "Movie patched", updated));
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
//        service.deleteById(id);
//        return ResponseEntity.ok(new ApiResponse<>(true, "Movie deleted", null));
//    }
//
//    @PostMapping("/upload-poster")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
//    public ResponseEntity<ApiResponse<Map<String, String>>> uploadMoviePoster(
//            @RequestParam("file") MultipartFile file) {
//        try {
//            if (file.isEmpty()) {
//                return ResponseEntity.badRequest()
//                        .body(new ApiResponse<>(false, "No file provided", null));
//            }
//
//            // Check file type
//            String contentType = file.getContentType();
//            if (contentType == null || !contentType.startsWith("image/")) {
//                return ResponseEntity.badRequest()
//                        .body(new ApiResponse<>(false, "Only image files are allowed", null));
//            }
//
//            // Check file size (5MB limit)
//            if (file.getSize() > 5 * 1024 * 1024) {
//                return ResponseEntity.badRequest()
//                        .body(new ApiResponse<>(false, "File size must be less than 5MB", null));
//            }
//
//            // Create upload directory if it doesn't exist
//            String uploadDir = "uploads/movie-posters";
//            Path uploadPath = Paths.get(uploadDir);
//            if (!Files.exists(uploadPath)) {
//                Files.createDirectories(uploadPath);
//            }
//
//            // Generate unique filename
//            String originalFilename = file.getOriginalFilename();
//            String fileExtension = "";
//            if (originalFilename != null && originalFilename.contains(".")) {
//                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
//            }
//            String filename = UUID.randomUUID().toString() + fileExtension;
//
//            // Save file
//            Path filePath = uploadPath.resolve(filename);
//            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
//
//            // Return the URL path
//            String posterUrl = "/uploads/movie-posters/" + filename;
//            Map<String, String> response = Map.of("posterUrl", posterUrl);
//
//            return ResponseEntity.ok(new ApiResponse<>(true, "Poster uploaded successfully", response));
//
//        } catch (IOException e) {
//            return ResponseEntity.internalServerError()
//                    .body(new ApiResponse<>(false, "Failed to upload file: " + e.getMessage(), null));
//        }
//    }
//}
// src/main/java/com/example/adminbackend/controller/MovieController.java
package com.example.adminbackend.controller;

import com.example.adminbackend.entity.Movie;
import com.example.adminbackend.entity.Show;
import com.example.adminbackend.service.MovieService;
import com.example.adminbackend.service.ShowService;
import com.example.adminbackend.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.io.IOException;
import java.io.File;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping({ "/movies", "/api/movies" })
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MovieController {

    @Autowired
    private MovieService service;

    @Autowired
    private ShowService showService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Movie>>> getAll() {
        List<Movie> movies = service.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Movies retrieved", movies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Movie>> getOne(@PathVariable Long id) {
        Movie m = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with id " + id));
        return ResponseEntity.ok(new ApiResponse<>(true, "Movie retrieved", m));
    }

    @GetMapping("/{id}/shows")
    public ResponseEntity<ApiResponse<List<Show>>> getMovieShows(@PathVariable Long id) {
        // First verify the movie exists
        Movie movie = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with id " + id));

        // Get all shows for this movie
        List<Show> shows = showService.findByMovieId(id);

        return ResponseEntity.ok(new ApiResponse<>(true, "Shows retrieved for movie", shows));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Movie>> create(@Valid @RequestBody Movie movie) {
        Movie saved = service.save(movie);
        return ResponseEntity.ok(new ApiResponse<>(true, "Movie created", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Movie>> update(
            @PathVariable Long id,
            @Valid @RequestBody Movie movie
    ) {
        Movie existing = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with id " + id));

        // full replace – all fields must be provided
        existing.setTitle(movie.getTitle());
        existing.setGenre(movie.getGenre());
        existing.setDuration(movie.getDuration());
        existing.setRating(movie.getRating());
        existing.setLanguage(movie.getLanguage());
        existing.setReleaseDate(movie.getReleaseDate());
        existing.setPrice(movie.getPrice());
        existing.setDescription(movie.getDescription());
        existing.setDirector(movie.getDirector());
        existing.setCast(movie.getCast());
        existing.setTrailer(movie.getTrailer());
        existing.setPosterUrl(movie.getPosterUrl());
        existing.setFormat(movie.getFormat());
        existing.setCertificate(movie.getCertificate());
        existing.setStatus(movie.getStatus());

        Movie updated = service.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(true, "Movie updated", updated));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Movie>> patch(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates
    ) {
        Movie movie = service.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with id " + id));

        updates.forEach((prop, value) -> {
            switch (prop) {
                case "title":
                    movie.setTitle((String) value); break;
                case "genre":
                    movie.setGenre((String) value); break;
                case "duration":
                    movie.setDuration((String) value); break;
                case "rating":
                    movie.setRating(((Number) value).doubleValue()); break;
                case "language":
                    movie.setLanguage((String) value); break;
                case "releaseDate":
                    movie.setReleaseDate(LocalDate.parse((String) value)); break;
                case "price":
                    movie.setPrice(BigDecimal.valueOf(((Number) value).doubleValue())); break;
                case "description":
                    movie.setDescription((String) value); break;
                case "director":
                    movie.setDirector((String) value); break;
                case "cast":
                    @SuppressWarnings("unchecked")
                    List<String> cast = (List<String>) value;
                    movie.setCast(cast); break;
                case "trailer":
                    movie.setTrailer((String) value); break;
                case "posterUrl":
                    movie.setPosterUrl((String) value); break;
                case "format":
                    @SuppressWarnings("unchecked")
                    List<String> fmt = (List<String>) value;
                    movie.setFormat(fmt); break;
                case "certificate":
                    movie.setCertificate((String) value); break;
                case "status":
                    movie.setStatus((String) value); break;
                default:
                    // ignore unknown props
            }
        });

        Movie updated = service.save(movie);
        return ResponseEntity.ok(new ApiResponse<>(true, "Movie patched", updated));
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Movie deleted", null));
    }

    @PostMapping("/upload-poster")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadMoviePoster(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "No file provided", null));
            }

            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Only image files are allowed", null));
            }

            // Check file size (5MB limit)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "File size must be less than 5MB", null));
            }

            // Create upload directory if it doesn't exist
            String uploadDir = "uploads/movie-posters";
            Path uploadPath = Paths.get(uploadDir);

            // Ensure the directory exists
            File directory = uploadPath.toFile();
            if (!directory.exists()) {
                boolean created = directory.mkdirs();
                if (!created) {
                    return ResponseEntity.internalServerError()
                            .body(new ApiResponse<>(false, "Failed to create upload directory", null));
                }
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                fileExtension = ".jpg"; // default extension
            }
            String filename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return the URL path
            String posterUrl = "/uploads/movie-posters/" + filename;
            Map<String, String> response = Map.of("posterUrl", posterUrl);

            return ResponseEntity.ok(new ApiResponse<>(true, "Poster uploaded successfully", response));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, "Failed to upload file: " + e.getMessage(), null));
        }
    }

    // Add endpoint to update movie poster specifically
    @PostMapping("/{id}/upload-poster")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Movie>> updateMoviePoster(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            // First upload the poster
            ResponseEntity<ApiResponse<Map<String, String>>> uploadResponse = uploadMoviePoster(file);

            if (!uploadResponse.getStatusCode().is2xxSuccessful() ||
                    uploadResponse.getBody() == null ||
                    !uploadResponse.getBody().isSuccess()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Failed to upload poster", null));
            }

            String posterUrl = uploadResponse.getBody().getData().get("posterUrl");

            // Ensure the URL starts with /uploads/
            if (!posterUrl.startsWith("/uploads/")) {
                posterUrl = "/uploads/" + posterUrl;
            }

            // Update the movie with new poster URL
            Movie movie = service.findById(id)
                    .orElseThrow(() -> new RuntimeException("Movie not found with id " + id));

            movie.setPosterUrl(posterUrl);
            Movie updatedMovie = service.save(movie);

            return ResponseEntity.ok(new ApiResponse<>(true, "Movie poster updated successfully", updatedMovie));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, "Failed to update movie poster: " + e.getMessage(), null));
        }
    }

}