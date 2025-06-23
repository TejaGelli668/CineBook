package com.example.adminbackend.controller;

import com.example.adminbackend.dto.ErrorResponse;
import com.example.adminbackend.dto.MessageResponse;
import com.example.adminbackend.service.TheaterSeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/seats")
@PreAuthorize("hasRole('ADMIN')") // Only admins can manage seats
public class SeatManagementController {

    @Autowired
    private TheaterSeatService theaterSeatService;

    /**
     * Generate default seat layout for a specific theater
     */
    @PostMapping("/generate/theater/{theaterId}")
    public ResponseEntity<?> generateSeatsForTheater(@PathVariable Long theaterId) {
        try {
            theaterSeatService.generateSeatsForTheater(theaterId);
            return ResponseEntity.ok(new MessageResponse("Seats generated successfully for theater " + theaterId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to generate seats: " + e.getMessage()));
        }
    }

    /**
     * Generate show_seats for a specific show
     */
    @PostMapping("/generate/show/{showId}/theater/{theaterId}")
    public ResponseEntity<?> generateShowSeats(@PathVariable Long showId, @PathVariable Long theaterId) {
        try {
            theaterSeatService.generateShowSeatsForNewShow(showId, theaterId);
            return ResponseEntity.ok(new MessageResponse("Show seats generated successfully for show " + showId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to generate show seats: " + e.getMessage()));
        }
    }

    /**
     * Generate seats for all theaters that don't have seats
     */
    @PostMapping("/generate/all-theaters")
    public ResponseEntity<?> generateSeatsForAllTheaters() {
        try {
            theaterSeatService.generateSeatsForAllTheaters();
            return ResponseEntity.ok(new MessageResponse("Seats generated for all theaters"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to generate seats: " + e.getMessage()));
        }
    }

    /**
     * Get seat statistics for a theater
     */
    @GetMapping("/stats/theater/{theaterId}")
    public ResponseEntity<?> getTheaterSeatStats(@PathVariable Long theaterId) {
        try {
            return ResponseEntity.ok(theaterSeatService.getTheaterSeatStats(theaterId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to get seat stats: " + e.getMessage()));
        }
    }
}