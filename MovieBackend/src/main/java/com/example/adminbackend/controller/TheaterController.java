package com.example.adminbackend.controller;

import com.example.adminbackend.dto.ApiResponse;
import com.example.adminbackend.entity.Theater;
import com.example.adminbackend.service.TheaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/theaters")
@CrossOrigin(origins = "http://localhost:3000")
public class TheaterController {

    @Autowired
    private TheaterService theaterService;

    /**
     * Get all theaters
     * GET /api/theaters
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Theater>>> getAllTheaters() {
        try {
            List<Theater> theaters = theaterService.getAllTheaters();
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Theaters retrieved successfully", theaters)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to retrieve theaters: " + e.getMessage(), null));
        }
    }

    /**
     * Get theater by ID
     * GET /api/theaters/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Theater>> getTheaterById(@PathVariable Long id) {
        try {
            Theater theater = theaterService.getTheaterById(id);
            if (theater != null) {
                return ResponseEntity.ok(
                        new ApiResponse<>(true, "Theater retrieved successfully", theater)
                );
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Theater not found", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to retrieve theater: " + e.getMessage(), null));
        }
    }

    /**
     * Create a new theater (Admin only)
     * POST /api/theaters
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Theater>> createTheater(
            @Valid @RequestBody Theater theater,
            BindingResult bindingResult) {

        // Handle validation errors
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Validation failed: " + errors.toString(), null));
        }

        try {
            // Additional custom validation
            if (theater.getNumberOfScreens() != null && theater.getNumberOfScreens() <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(false, "Number of screens must be greater than 0", null));
            }

            if (theater.getTotalSeats() != null && theater.getTotalSeats() <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(false, "Total seats must be greater than 0", null));
            }

            // Check if theater already exists
            if (theaterService.existsByNameAndCity(theater.getName(), theater.getCity())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(false, "Theater with this name already exists in this city", null));
            }

            Theater createdTheater = theaterService.createTheater(theater);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "Theater created successfully", createdTheater));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Validation failed: " + e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to create theater: " + e.getMessage(), null));
        }
    }

    /**
     * Update an existing theater (Admin only)
     * PUT /api/theaters/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Theater>> updateTheater(
            @PathVariable Long id,
            @Valid @RequestBody Theater theater,
            BindingResult bindingResult) {

        // Handle validation errors
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Validation failed: " + errors.toString(), null));
        }

        try {
            Theater updatedTheater = theaterService.updateTheater(id, theater);
            if (updatedTheater != null) {
                return ResponseEntity.ok(
                        new ApiResponse<>(true, "Theater updated successfully", updatedTheater)
                );
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Theater not found", null));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Validation failed: " + e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to update theater: " + e.getMessage(), null));
        }
    }

    /**
     * Delete a theater (Admin only)
     * DELETE /api/theaters/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteTheater(@PathVariable Long id) {
        try {
            boolean deleted = theaterService.deleteTheater(id);
            if (deleted) {
                return ResponseEntity.ok(
                        new ApiResponse<>(true, "Theater deleted successfully", "Theater with ID " + id + " has been deleted")
                );
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Theater not found", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to delete theater: " + e.getMessage(), null));
        }
    }

    /**
     * Get theaters by city
     * GET /api/theaters/city/{city}
     */
    @GetMapping("/city/{city}")
    public ResponseEntity<ApiResponse<List<Theater>>> getTheatersByCity(@PathVariable String city) {
        try {
            List<Theater> theaters = theaterService.getTheatersByCity(city);
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Theaters retrieved successfully", theaters)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to retrieve theaters: " + e.getMessage(), null));
        }
    }

    /**
     * Get active theaters only
     * GET /api/theaters/active
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Theater>>> getActiveTheaters() {
        try {
            List<Theater> theaters = theaterService.getActiveTheaters();
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Active theaters retrieved successfully", theaters)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to retrieve active theaters: " + e.getMessage(), null));
        }
    }
}