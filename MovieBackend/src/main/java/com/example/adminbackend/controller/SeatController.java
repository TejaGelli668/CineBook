package com.example.adminbackend.controller;

import com.example.adminbackend.dto.*;
import com.example.adminbackend.entity.Show;
import com.example.adminbackend.entity.ShowSeat;
import com.example.adminbackend.repository.ShowSeatRepository;
import com.example.adminbackend.service.SeatService;
import com.example.adminbackend.service.ShowService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping("/debug/show/{showId}")
    public ResponseEntity<?> debugShowSeats(@PathVariable Long showId) {
        try {
            List<ShowSeat> allSeats = showSeatRepository.findByShowId(showId);

            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("showId", showId);
            debugInfo.put("totalSeats", allSeats.size());

            // Group seats by status
            Map<String, Long> seatsByStatus = allSeats.stream()
                    .collect(Collectors.groupingBy(
                            seat -> seat.getStatus().toString(),
                            Collectors.counting()
                    ));
            debugInfo.put("seatsByStatus", seatsByStatus);

            // Get sample seat numbers
            List<String> sampleSeatNumbers = allSeats.stream()
                    .limit(10)
                    .map(seat -> seat.getSeat().getSeatNumber())
                    .collect(Collectors.toList());
            debugInfo.put("sampleSeatNumbers", sampleSeatNumbers);

            // Get all seat numbers for comparison
            List<String> allSeatNumbers = allSeats.stream()
                    .map(seat -> seat.getSeat().getSeatNumber())
                    .collect(Collectors.toList());
            debugInfo.put("allSeatNumbers", allSeatNumbers);

            return ResponseEntity.ok(debugInfo);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Add this endpoint to check if specific seats exist
    @PostMapping("/debug/check-seats")
    public ResponseEntity<?> checkSpecificSeats(@RequestBody Map<String, Object> request) {
        try {
            Long showId = ((Number) request.get("showId")).longValue();
            @SuppressWarnings("unchecked")
            List<String> seatNumbers = (List<String>) request.get("seatNumbers");

            List<ShowSeat> foundSeats = showSeatRepository.findByShowIdAndSeatNumbers(showId, seatNumbers);

            List<String> foundSeatNumbers = foundSeats.stream()
                    .map(seat -> seat.getSeat().getSeatNumber())
                    .collect(Collectors.toList());

            List<String> missingSeatNumbers = seatNumbers.stream()
                    .filter(seatNumber -> !foundSeatNumbers.contains(seatNumber))
                    .collect(Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("requestedSeats", seatNumbers);
            result.put("foundSeats", foundSeatNumbers);
            result.put("missingSeats", missingSeatNumbers);
            result.put("foundCount", foundSeats.size());
            result.put("requestedCount", seatNumbers.size());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
    // Add these endpoints to your SeatController.java

    @PostMapping("/debug/remove-duplicates/{showId}")
    public ResponseEntity<?> removeDuplicateSeats(@PathVariable Long showId) {
        try {
            // Get all seats for this show
            List<ShowSeat> allSeats = showSeatRepository.findByShowId(showId);

            // Group by seat number to find duplicates
            Map<String, List<ShowSeat>> seatGroups = allSeats.stream()
                    .collect(Collectors.groupingBy(seat -> seat.getSeat().getSeatNumber()));

            int duplicatesRemoved = 0;
            List<Long> seatsToDelete = new ArrayList<>();

            // For each group, keep only the first seat and mark others for deletion
            for (Map.Entry<String, List<ShowSeat>> entry : seatGroups.entrySet()) {
                List<ShowSeat> duplicates = entry.getValue();
                if (duplicates.size() > 1) {
                    // Keep the first one, delete the rest
                    for (int i = 1; i < duplicates.size(); i++) {
                        seatsToDelete.add(duplicates.get(i).getId());
                        duplicatesRemoved++;
                    }
                }
            }

            // Delete duplicate seats
            if (!seatsToDelete.isEmpty()) {
                showSeatRepository.deleteAllById(seatsToDelete);
            }

            // Get remaining count
            int remainingSeats = showSeatRepository.findByShowId(showId).size();

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Duplicate seats removed successfully");
            result.put("showId", showId);
            result.put("duplicatesRemoved", duplicatesRemoved);
            result.put("remainingSeats", remainingSeats);
            result.put("uniqueSeatNumbers", seatGroups.keySet().size());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/debug/batch-delete-seats")
    public ResponseEntity<?> batchDeleteSeats(@RequestBody Map<String, Object> request) {
        try {
            Long showId = ((Number) request.get("showId")).longValue();
            @SuppressWarnings("unchecked")
            List<String> seatNumbers = (List<String>) request.get("seatNumbers");

            if (seatNumbers == null || seatNumbers.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "seatNumbers array is required"));
            }

            // Find seats to delete
            List<ShowSeat> seatsToDelete = showSeatRepository.findByShowIdAndSeatNumbers(showId, seatNumbers);

            // Delete them
            if (!seatsToDelete.isEmpty()) {
                showSeatRepository.deleteAll(seatsToDelete);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Seats deleted successfully");
            result.put("showId", showId);
            result.put("requestedToDelete", seatNumbers.size());
            result.put("actuallyDeleted", seatsToDelete.size());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Replace the problematic method in your SeatController.java

    @PostMapping("/debug/get-all-seats-detailed/{showId}")
    public ResponseEntity<?> getAllSeatsDetailed(@PathVariable Long showId) {
        try {
            List<ShowSeat> allSeats = showSeatRepository.findByShowId(showId);

            List<Map<String, Object>> seatDetails = allSeats.stream()
                    .map(showSeat -> {
                        Map<String, Object> detail = new HashMap<>();
                        detail.put("id", showSeat.getId());
                        detail.put("seatNumber", showSeat.getSeat().getSeatNumber());
                        detail.put("status", showSeat.getStatus().toString());
                        // REMOVE THE PRICE LINE OR GET IT FROM SEAT ENTITY
                        // detail.put("price", showSeat.getPrice()); // This was causing the error

                        // Option: Get price from seat type if available
                        if (showSeat.getSeat() != null && showSeat.getSeat().getSeatType() != null) {
                            detail.put("seatType", showSeat.getSeat().getSeatType());
                            // You can add price logic based on seat type here
                            detail.put("price", getPriceForSeatType(showSeat.getSeat().getSeatType()));
                        }

                        return detail;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("showId", showId);
            result.put("totalSeats", seatDetails.size());
            result.put("seats", seatDetails);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

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

    @PostMapping("/debug/create-missing-seats/{showId}")
    public ResponseEntity<?> createMissingSeats(@PathVariable Long showId, @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> expectedSeatNumbers = (List<String>) request.get("seatNumbers");

            if (expectedSeatNumbers == null || expectedSeatNumbers.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "seatNumbers array is required"));
            }

            // Get existing seats
            List<ShowSeat> existingSeats = showSeatRepository.findByShowId(showId);
            List<String> existingSeatNumbers = existingSeats.stream()
                    .map(seat -> seat.getSeat().getSeatNumber())
                    .collect(Collectors.toList());

            // Find missing seats
            List<String> missingSeatNumbers = expectedSeatNumbers.stream()
                    .filter(seatNumber -> !existingSeatNumbers.contains(seatNumber))
                    .collect(Collectors.toList());

            if (missingSeatNumbers.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "message", "No missing seats found",
                        "expectedSeats", expectedSeatNumbers.size(),
                        "existingSeats", existingSeatNumbers.size(),
                        "createdSeats", 0,
                        "missingSeats", missingSeatNumbers
                ));
            }

            // Create missing seats using the service
            int createdCount = seatService.createMissingSeats(showId, missingSeatNumbers);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Missing seats created successfully");
            result.put("expectedSeats", expectedSeatNumbers.size());
            result.put("existingSeats", existingSeatNumbers.size());
            result.put("missingSeats", missingSeatNumbers);
            result.put("createdSeats", createdCount);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/debug/find-duplicates")
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    //@PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> findDuplicateSeats() {
        try {
            // Find duplicates in seats table
            List<Object[]> duplicates = seatRepository.findDuplicateSeats();

            Map<String, Object> response = new HashMap<>();
            response.put("duplicateCount", duplicates.size());
            response.put("duplicates", duplicates.stream().map(row -> {
                Map<String, Object> duplicate = new HashMap<>();
                duplicate.put("seatNumber", row[0]);
                duplicate.put("theaterId", row[1]);
                duplicate.put("count", row[2]);
                return duplicate;
            }).collect(Collectors.toList()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error finding duplicates: " + e.getMessage());
        }
    }

    @DeleteMapping("/debug/delete-all-base-seats")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
   // @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> deleteAllBaseSeats() {
        try {
            // First delete all show_seats to avoid foreign key constraints
            showSeatRepository.deleteAll();

            // Then delete all seats
            seatRepository.deleteAll();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "All seats deleted successfully");
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting seats: " + e.getMessage());
        }
    }
    @PostMapping("/debug/create-missing-seats-all-shows")
    public ResponseEntity<?> createMissingSeatsAllShows(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> expectedSeatNumbers = (List<String>) request.get("seatNumbers");

            if (expectedSeatNumbers == null || expectedSeatNumbers.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "seatNumbers array is required"));
            }

            // Get all shows
            List<Show> allShows = showService.findAll();

            Map<String, Object> overallResult = new HashMap<>();
            List<Map<String, Object>> showResults = new ArrayList<>();
            int totalCreated = 0;
            int totalProcessed = 0;

            for (Show show : allShows) {
                try {
                    // Get existing seats for this show
                    List<ShowSeat> existingSeats = showSeatRepository.findByShowId(show.getId());
                    List<String> existingSeatNumbers = existingSeats.stream()
                            .map(seat -> seat.getSeat().getSeatNumber())
                            .collect(Collectors.toList());

                    // Find missing seats
                    List<String> missingSeatNumbers = expectedSeatNumbers.stream()
                            .filter(seatNumber -> !existingSeatNumbers.contains(seatNumber))
                            .collect(Collectors.toList());

                    int createdForThisShow = 0;
                    if (!missingSeatNumbers.isEmpty()) {
                        createdForThisShow = seatService.createMissingSeats(show.getId(), missingSeatNumbers);
                    }

                    Map<String, Object> showResult = new HashMap<>();
                    showResult.put("showId", show.getId());
                    showResult.put("movieTitle", show.getMovie().getTitle());
                    showResult.put("theaterName", show.getTheater().getName());
                    showResult.put("showTime", show.getShowTime());
                    showResult.put("existingSeats", existingSeatNumbers.size());
                    showResult.put("missingSeats", missingSeatNumbers.size());
                    showResult.put("createdSeats", createdForThisShow);

                    showResults.add(showResult);
                    totalCreated += createdForThisShow;
                    totalProcessed++;

                } catch (Exception e) {
                    Map<String, Object> errorResult = new HashMap<>();
                    errorResult.put("showId", show.getId());
                    errorResult.put("error", e.getMessage());
                    showResults.add(errorResult);
                }
            }

            overallResult.put("message", "Bulk seat creation completed");
            overallResult.put("totalShowsProcessed", totalProcessed);
            overallResult.put("totalSeatsCreated", totalCreated);
            overallResult.put("expectedSeatsPerShow", expectedSeatNumbers.size());
            overallResult.put("showResults", showResults);

            return ResponseEntity.ok(overallResult);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Bulk operation failed: " + e.getMessage()));
        }
    }
}