package com.example.adminbackend.controller;

import com.example.adminbackend.service.GeminiService;
import com.example.adminbackend.service.MovieService;
import com.example.adminbackend.service.ShowService;
import com.example.adminbackend.service.FoodItemService;
import com.example.adminbackend.service.TheaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    private final GeminiService geminiService;

    @Autowired
    private MovieService movieService;

    @Autowired
    private ShowService showService;

    @Autowired
    private FoodItemService foodItemService;

    @Autowired
    private TheaterService theaterService;

    public ChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping
    public ResponseEntity<String> chat(@RequestBody Map<String, String> body) {
        try {
            String message = body.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Message cannot be empty");
            }

            String reply = geminiService.chat(message);
            return ResponseEntity.ok(reply);
        } catch (Exception e) {
            System.err.println("Error in chat endpoint: " + e.getMessage());
            return ResponseEntity.ok("I'm having some technical difficulties right now. Please try again in a moment! 🤖");
        }
    }

    @GetMapping("/quick-info")
    public ResponseEntity<Map<String, Object>> getQuickInfo() {
        try {
            Map<String, Object> quickInfo = new HashMap<>();

            // Quick stats - FIXED: Using correct method names
            quickInfo.put("totalMovies", movieService.findAll().size());
            quickInfo.put("totalTheaters", theaterService.getAllTheaters().size());
            quickInfo.put("totalSnacks", foodItemService.getAvailableFoodItems(null, null).size());

            // Quick responses
            Map<String, String> quickResponses = new HashMap<>();
            quickResponses.put("greeting", "Hi! I can help you with movie bookings, show times, and snack info! 🎬");
            quickResponses.put("booking", "To book tickets: Choose a movie → Select show time → Pick seats → Add snacks → Pay securely");
            quickResponses.put("payment", "We accept UPI, Cards, Net Banking & Digital Wallets. All payments are 100% secure! 💳");
            quickResponses.put("cancellation", "Cancel 2+ hours before show for full refund, or get 50% refund for late cancellations");

            quickInfo.put("quickResponses", quickResponses);

            return ResponseEntity.ok(quickInfo);
        } catch (Exception e) {
            System.err.println("Error getting quick info: " + e.getMessage());
            return ResponseEntity.ok(Map.of("error", "Unable to fetch quick information"));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "Movie Assistant Chatbot");
        response.put("message", "Ready to help with your movie needs! 🍿");
        return ResponseEntity.ok(response);
    }
}