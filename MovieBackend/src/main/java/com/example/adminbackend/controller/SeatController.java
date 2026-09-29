package com.example.adminbackend.controller;

import com.example.adminbackend.dto.*;
import com.example.adminbackend.entity.Show;
import com.example.adminbackend.entity.ShowSeat;
import com.example.adminbackend.repository.ShowSeatRepository;
import com.example.adminbackend.service.SeatService;
import com.example.adminbackend.service.ShowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.adminbackend.repository.SeatRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/seats")
public class SeatController {



    @Autowired
    private SeatService seatService;
    @Autowired
    private ShowSeatRepository showSeatRepository;
    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowService showService;

    @GetMapping("/show/{showId}")
    public ResponseEntity<?> getShowSeats(@PathVariable Long showId) {
        return ResponseEntity.ok(seatService.getShowSeats(showId));
    }

    @PostMapping("/lock")
    public ResponseEntity<?> lockSeats(@RequestBody SeatLockRequest request) {
        try {
            SeatLockResponse response = seatService.lockSeats(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/unlock")
    public ResponseEntity<?> unlockSeats(@RequestBody SeatUnlockRequest request) {
        seatService.unlockSeats(request);
        return ResponseEntity.ok(new MessageResponse("Seats unlocked successfully"));
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookSeats(@RequestBody BookingRequest request) {
        try {
            BookingResponse response = seatService.bookSeats(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    // Add this to your SeatController.java

    // Add this endpoint to check if specific seats exist
    // Add these endpoints to your SeatController.java

    // Replace the problematic method in your SeatController.java

    private Double getPriceForSeatType(String seatType) {
        // Based on your theater layout pricing
        switch (seatType != null ? seatType.toLowerCase() : "") {
            case "royal recliner":
                return 630.0; // Double, not BigDecimal
            case "royal":
                return 380.0; // Double, not BigDecimal
            case "club":
                return 350.0; // Double, not BigDecimal
            case "executive":
                return 330.0; // Double, not BigDecimal
            default:
                return 300.0; // Default price, Double
        }
    }
    // Add this endpoint to your SeatController.java

    @PostMapping("/extend-lock")
    public ResponseEntity<ApiResponse<SeatLockResponse>> extendSeatLocks(@RequestBody SeatLockRequest request) {
        try {
            SeatLockResponse response = seatService.extendSeatLocks(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Seat locks extended successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Failed to extend seat locks: " + e.getMessage(), null));
        }
    }
}