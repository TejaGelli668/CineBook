package com.example.adminbackend.controller;

import com.example.adminbackend.dto.ApiResponse;
import com.example.adminbackend.entity.Movie;
import com.example.adminbackend.repository.MovieRepository;
import com.example.adminbackend.service.MovieService;
import com.example.adminbackend.service.TmdbService;
import com.example.adminbackend.service.TmdbService.TmdbException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Admin-only proxy to TMDB: browse/search movies and import them into our catalogue.
 */
@RestController
@RequestMapping("/api/admin/tmdb")
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
public class TmdbController {

    @Autowired
    private TmdbService tmdbService;

    @Autowired
    private MovieService movieService;

    @Autowired
    private MovieRepository movieRepository;

    @Value("${payment.default.ticket.price:250}")
    private BigDecimal defaultTicketPrice;

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> status() {
        return ResponseEntity.ok(new ApiResponse<>(true, "TMDB status",
                Map.of("configured", tmdbService.isConfigured())));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Map<String, Object>>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Search results", tmdbService.search(query, page)));
    }

    @GetMapping("/now-playing")
    public ResponseEntity<ApiResponse<Map<String, Object>>> nowPlaying(@RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Now playing", tmdbService.nowPlaying(page)));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<Map<String, Object>>> upcoming(@RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Upcoming", tmdbService.upcoming(page)));
    }

    /** Mapped, unsaved movie — used to pre-fill the admin movie form. */
    @GetMapping("/movies/{tmdbId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> preview(@PathVariable long tmdbId) {
        Movie movie = tmdbService.buildMovie(tmdbId);
        movie.setPrice(defaultTicketPrice);
        Long existingId = movieRepository.findByTmdbId(tmdbId).map(Movie::getId).orElse(null);
        Map<String, Object> data = new java.util.HashMap<>();
        data.put("movie", movie);
        data.put("existingMovieId", existingId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Movie details", data));
    }

    /** One-click import: creates the movie directly (without shows). */
    @PostMapping("/import/{tmdbId}")
    public ResponseEntity<ApiResponse<Movie>> importMovie(@PathVariable long tmdbId) {
        var existing = movieRepository.findByTmdbId(tmdbId);
        if (existing.isPresent()) {
            return ResponseEntity.status(409)
                    .body(new ApiResponse<>(false, "This movie is already in your catalogue", existing.get()));
        }
        Movie movie = tmdbService.buildMovie(tmdbId);
        movie.setPrice(defaultTicketPrice);
        Movie saved = movieService.save(movie);
        return ResponseEntity.ok(new ApiResponse<>(true, "Movie imported from TMDB", saved));
    }

    @ExceptionHandler(TmdbException.class)
    public ResponseEntity<ApiResponse<Void>> handleTmdb(TmdbException e) {
        return ResponseEntity.status(e.getStatus()).body(new ApiResponse<>(false, e.getMessage(), null));
    }
}
