package com.example.adminbackend.controller;

import com.example.adminbackend.dto.*;
import com.example.adminbackend.service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    @Autowired
    private SeatService seatService;

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
}