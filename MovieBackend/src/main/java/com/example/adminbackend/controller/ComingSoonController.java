package com.example.adminbackend.controller;

import com.example.adminbackend.dto.ApiResponse;
import com.example.adminbackend.service.TmdbService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Public list of upcoming releases in our region, sourced from TMDB (cached for an hour).
 * Lives under /api/movies so the existing public GET rule applies.
 */
@RestController
@RequestMapping("/api/movies")
public class ComingSoonController {

    @Autowired
    private TmdbService tmdbService;

    @GetMapping("/coming-soon")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> comingSoon(
            @RequestParam(defaultValue = "12") int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 30));
        return ResponseEntity.ok(new ApiResponse<>(true, "Coming soon", tmdbService.comingSoon(safeLimit)));
    }
}
