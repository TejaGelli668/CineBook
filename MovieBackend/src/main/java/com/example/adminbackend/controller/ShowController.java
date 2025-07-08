package com.example.adminbackend.controller;

import com.example.adminbackend.dto.ErrorResponse;
import com.example.adminbackend.entity.Show;
import com.example.adminbackend.entity.Movie;
import com.example.adminbackend.entity.Theater;
import com.example.adminbackend.service.ShowService;
import com.example.adminbackend.service.MovieService;
import com.example.adminbackend.service.TheaterService;
import com.example.adminbackend.repository.ShowSeatRepository;
import com.example.adminbackend.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import com.example.adminbackend.service.TheaterSeatService;
import com.example.adminbackend.config.TheaterSeatConfig;
import java.util.HashMap;
import java.util.Map;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping({ "/shows", "/api/shows" })
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ShowController {

    private static final Logger logger = LoggerFactory.getLogger(ShowController.class);

    @Autowired
    private ShowService showService;

    @Autowired
    private MovieService movieService;

    @Autowired
    private TheaterService theaterService;

    @Autowired
    private ShowSeatRepository showSeatRepository;
    @Autowired
    private TheaterSeatService theaterSeatService;

    @Autowired
    private TheaterSeatConfig theaterSeatConfig;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Show>>> getAll() {
        List<Show> shows = showService.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Shows retrieved", shows));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Show>> getOne(@PathVariable Long id) {
        Show show = showService.findById(id)
                .orElseThrow(() -> new RuntimeException("Show not found with id " + id));
        return ResponseEntity.ok(new ApiResponse<>(true, "Show retrieved", show));
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ApiResponse<List<Show>>> getShowsByMovie(@PathVariable Long movieId) {
        // Verify movie exists
        movieService.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found with id " + movieId));

        List<Show> shows = showService.findByMovieId(movieId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Shows retrieved for movie", shows));
    }

    @GetMapping("/theater/{theaterId}")
    public ResponseEntity<ApiResponse<List<Show>>> getShowsByTheater(@PathVariable Long theaterId) {
        // Verify theater exists
        theaterService.findById(theaterId)
                .orElseThrow(() -> new RuntimeException("Theater not found with id " + theaterId));

        List<Show> shows = showService.findByTheaterId(theaterId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Shows retrieved for theater", shows));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Show>> create(@Valid @RequestBody Map<String, Object> showData) {
        try {
            // Extract data from request with proper type checking
            @SuppressWarnings("unchecked")
            Map<String, Object> movieData = (Map<String, Object>) showData.get("movie");

            @SuppressWarnings("unchecked")
            Map<String, Object> theaterData = (Map<String, Object>) showData.get("theater");

            String showTime = (String) showData.get("showTime");
            Number ticketPrice = (Number) showData.get("ticketPrice");

            // Validate required fields
            if (movieData == null || theaterData == null || showTime == null || ticketPrice == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Missing required fields", null));
            }

            // Get movie and theater IDs
            Long movieId = ((Number) movieData.get("id")).longValue();
            Long theaterId = ((Number) theaterData.get("id")).longValue();

            // Fetch movie and theater entities
            Movie movie = movieService.findById(movieId)
                    .orElseThrow(() -> new RuntimeException("Movie not found with id " + movieId));

            Theater theater = theaterService.findById(theaterId)
                    .orElseThrow(() -> new RuntimeException("Theater not found with id " + theaterId));

            // Create new show
            Show show = new Show();
            show.setMovie(movie);
            show.setTheater(theater);
            show.setShowTime(LocalDateTime.parse(showTime));
            show.setTicketPrice(BigDecimal.valueOf(ticketPrice.doubleValue()));

            // Use createShow method which handles seat generation
            Show savedShow = showService.createShow(show);
            return ResponseEntity.ok(new ApiResponse<>(true, "Show created with seats", savedShow));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error creating show: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Show>> update(
            @PathVariable Long id,
            @Valid @RequestBody Map<String, Object> showData
    ) {
        Show existingShow = showService.findById(id)
                .orElseThrow(() -> new RuntimeException("Show not found with id " + id));

        try {
            // Update fields if provided
            if (showData.containsKey("movie")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> movieData = (Map<String, Object>) showData.get("movie");
                Long movieId = ((Number) movieData.get("id")).longValue();
                Movie movie = movieService.findById(movieId)
                        .orElseThrow(() -> new RuntimeException("Movie not found with id " + movieId));
                existingShow.setMovie(movie);
            }

            if (showData.containsKey("theater")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> theaterData = (Map<String, Object>) showData.get("theater");
                Long theaterId = ((Number) theaterData.get("id")).longValue();
                Theater theater = theaterService.findById(theaterId)
                        .orElseThrow(() -> new RuntimeException("Theater not found with id " + theaterId));
                existingShow.setTheater(theater);
            }

            if (showData.containsKey("showTime")) {
                String showTime = (String) showData.get("showTime");
                existingShow.setShowTime(LocalDateTime.parse(showTime));
            }

            if (showData.containsKey("ticketPrice")) {
                Number ticketPrice = (Number) showData.get("ticketPrice");
                existingShow.setTicketPrice(BigDecimal.valueOf(ticketPrice.doubleValue()));
            }

            Show updatedShow = showService.save(existingShow);
            return ResponseEntity.ok(new ApiResponse<>(true, "Show updated", updatedShow));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error updating show: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        showService.deleteById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Show deleted", null));
    }

    @PostMapping("/fix-seats")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    //@PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> fixShowsWithoutSeats() {
        try {
            showService.fixShowsWithoutSeats();
            return ResponseEntity.ok(new ApiResponse<>(true, "Shows fixed successfully", "All shows now have seats"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error fixing shows: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{id}/seats-count")
    public ResponseEntity<ApiResponse<Long>> getSeatsCount(@PathVariable Long id) {
        try {
            long count = showSeatRepository.countAvailableSeatsForShow(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Seat count retrieved", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error getting seat count: " + e.getMessage(), null));
        }
    }
    @PostMapping("/make-all-seats-available")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    //@PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> makeAllSeatsAvailable() {
        try {
            showService.makeAllShowSeatsAvailable();
            return ResponseEntity.ok(new ApiResponse<>(true, "Success", "All seats are now AVAILABLE (except booked ones)"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error making seats available: " + e.getMessage(), null));
        }
    }

    @GetMapping("/seats-statistics")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    //@PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> getSeatsStatistics() {
        try {
            String stats = showService.getSeatsStatistics();
            return ResponseEntity.ok(new ApiResponse<>(true, "Statistics retrieved", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error getting statistics: " + e.getMessage(), null));
        }
    }
    // Add this to your ShowController:
    @PostMapping("/cleanup-duplicates/{showId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> cleanupDuplicates(@PathVariable Long showId) {
        try {
            showService.cleanupDuplicateSeatsForShow(showId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Duplicates cleaned up", "Success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Error: " + e.getMessage(), null));
        }
    }
    /**
     * 🎭 CREATE NEW SHOW WITH AUTO-GENERATED CLEAN LAYOUT
     */
    @PostMapping("/create-with-seats")
    public ResponseEntity<?> createShowWithAutoSeats(@RequestBody Show show) {
        try {
            logger.info("🎭 Creating show with auto-generated seats...");

            // Create the show first
            Show savedShow = showService.createShow(show);
            logger.info("✅ Show created with ID: {}", savedShow.getId());

            // Generate seats for this show
            theaterSeatService.generateShowSeatsForNewShow(savedShow.getId(), savedShow.getTheater().getId());

            // Get layout statistics
            Map<String, Integer> seatStats = theaterSeatConfig.getSeatCountByCategory();
            int totalSeats = theaterSeatConfig.getTotalSeatCount();

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Show created successfully with " + totalSeats + " available seats");
            response.put("show", savedShow);
            response.put("seatsGenerated", totalSeats);
            response.put("seatsByCategory", seatStats);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("❌ Failed to create show with seats: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to create show: " + e.getMessage()));
        }
    }

    /**
     * 🔧 APPLY CLEAN LAYOUT TO EXISTING THEATER
     */
    @PostMapping("/setup-theater/{theaterId}")
    public ResponseEntity<?> setupTheaterWithCleanLayout(@PathVariable Long theaterId) {
        try {
            logger.info("🏢 Setting up theater {} with clean layout...", theaterId);

            theaterSeatService.generateSeatsForTheater(theaterId);
            Map<String, Object> stats = theaterSeatService.getTheaterSeatStats(theaterId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Theater " + theaterId + " set up with clean layout");
            response.put("theaterId", theaterId);
            response.put("stats", stats);
            response.put("totalSeats", theaterSeatConfig.getTotalSeatCount());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("❌ Failed to setup theater {}: {}", theaterId, e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to setup theater: " + e.getMessage()));
        }
    }

    /**
     * 🔄 FIX ALL EXISTING SHOWS
     */
    @PostMapping("/fix-all-shows")
    public ResponseEntity<?> fixAllShowsWithCleanLayout() {
        try {
            logger.info("🔄 Fixing all existing shows with clean layout...");

            theaterSeatService.generateSeatsForAllTheaters();
            showService.fixShowsWithoutSeats();
            showService.makeAllShowSeatsAvailable();

            String stats = showService.getSeatsStatistics();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All shows fixed with clean layout");
            response.put("statistics", stats);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("❌ Failed to fix all shows: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to fix shows: " + e.getMessage()));
        }
    }

    /**
     * 📊 GET LAYOUT PREVIEW
     */
    @GetMapping("/layout-preview")
    public ResponseEntity<?> getLayoutPreview() {
        try {
            Map<String, Object> layout = new HashMap<>();

            for (TheaterSeatConfig.SeatCategory category : theaterSeatConfig.getDefaultTheaterLayout()) {
                Map<String, Object> categoryInfo = new HashMap<>();
                categoryInfo.put("price", category.getPrice());
                categoryInfo.put("rows", category.getRows().size());

                int totalSeatsInCategory = category.getRows().stream()
                        .mapToInt(row -> row.getSeatNumbers().size())
                        .sum();
                categoryInfo.put("totalSeats", totalSeatsInCategory);

                layout.put(category.getName(), categoryInfo);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("layoutName", "Clean Theater Layout");
            response.put("totalSeats", theaterSeatConfig.getTotalSeatCount());
            response.put("wheelchairSeats", theaterSeatConfig.getDefaultWheelchairSeats().size());
            response.put("categories", layout);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to get layout preview: " + e.getMessage()));
        }
    }
    @PostMapping("/fix-show/{showId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> fixSpecificShow(@PathVariable Long showId) {
        try {
            logger.info("🎯 Fixing specific show: {}", showId);

            Show show = showService.getShowById(showId);
            if (show == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Show not found: " + showId, null));
            }

            // Ensure the theater has seats
            theaterSeatService.generateSeatsForTheater(show.getTheater().getId());

            // Generate seats for this specific show
            theaterSeatService.generateShowSeatsForNewShow(showId, show.getTheater().getId());

            // Clean up any duplicates
            showService.cleanupDuplicateSeatsForShow(showId);

            return ResponseEntity.ok(new ApiResponse<>(true,
                    "Show " + showId + " fixed with clean layout",
                    "Success"));
        } catch (Exception e) {
            logger.error("❌ Failed to fix show {}: {}", showId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Failed to fix show: " + e.getMessage(), null));
        }
    }
}