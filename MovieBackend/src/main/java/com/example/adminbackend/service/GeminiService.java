package com.example.adminbackend.service;

import com.example.adminbackend.entity.Movie;
import com.example.adminbackend.entity.Show;
import com.example.adminbackend.entity.Theater;
import com.example.adminbackend.entity.FoodItem;
import com.example.adminbackend.repository.MovieRepository;
import com.example.adminbackend.repository.ShowRepository;
import com.example.adminbackend.repository.TheaterRepository;
import com.example.adminbackend.repository.FoodItemRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final WebClient webClient;

    @Autowired
    private MovieService movieService;

    @Autowired
    private TheaterService theaterService;

    @Autowired
    private FoodItemService foodItemService;

    // Direct repository access for more complex queries
    @Autowired
    private ShowRepository showRepository;

    public GeminiService(WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("https://generativelanguage.googleapis.com/v1/models")
                .build();
    }

    public String chat(String userMessage) {
        // Build context for Gemini about our cinema
        String context = buildCinemaContext();

        // Create enhanced prompt with context
        String enhancedPrompt = createEnhancedPrompt(userMessage, context);

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", enhancedPrompt)
                        ))
                )
        );

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/gemini-1.5-flash:generateContent")
                        .queryParam("key", apiKey)
                        .build())
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::extractContent)
                .onErrorResume(WebClientResponseException.class, ex -> {
                    String errorBody = ex.getResponseBodyAsString();
                    System.err.println("Error from Gemini API: " + errorBody);
                    return Mono.just("Sorry, I'm having trouble right now. Please try again later! 😊");
                })
                .block();
    }

    private String buildCinemaContext() {
        StringBuilder context = new StringBuilder();

        try {
            // Current date info
            LocalDate today = LocalDate.now();
            context.append("Current Date: ").append(today.format(DateTimeFormatter.ofPattern("MMMM d, yyyy"))).append("\n");

            // Available movies - FIXED: Using correct method name
            List<Movie> movies = movieService.findAll();
            if (!movies.isEmpty()) {
                context.append("\nAvailable Movies:\n");
                movies.forEach(movie -> {
                    context.append("- ").append(movie.getTitle())
                            .append(" (").append(movie.getGenre()).append(")")
                            .append(" - Duration: ").append(movie.getDuration()).append(" mins")
                            .append(" - Rating: ").append(movie.getRating()).append("\n");
                });
            }

            // Available theaters - FIXED: Using correct method name
            List<Theater> theaters = theaterService.getAllTheaters();
            if (!theaters.isEmpty()) {
                context.append("\nAvailable Theaters:\n");
                theaters.forEach(theater -> {
                    context.append("- ").append(theater.getName())
                            .append(" (").append(theater.getLocation()).append(")")
                            .append(" - Screens: ").append(theater.getNumberOfScreens())
                            .append(" - Total Seats: ").append(theater.getTotalSeats()).append("\n");
                });
            }

            // Today's shows - Using repository directly for date queries
            List<Show> todaysShows = showRepository.findByShowTimeBetween(
                    today.atStartOfDay(),
                    today.plusDays(1).atStartOfDay()
            );
            if (!todaysShows.isEmpty()) {
                context.append("\nToday's Shows:\n");
                todaysShows.forEach(show -> {
                    context.append("- ").append(show.getMovie().getTitle())
                            .append(" at ").append(show.getTheater().getName())
                            .append(" - ").append(show.getShowTime().format(DateTimeFormatter.ofPattern("h:mm a")))
                            .append(" - Price: ₹").append(show.getTicketPrice()).append("\n");
                });
            }

            // Food items - FIXED: Using correct method name
            List<FoodItem> foodItems = foodItemService.getAvailableFoodItems(null, null);
            if (!foodItems.isEmpty()) {
                context.append("\nAvailable Snacks:\n");
                foodItems.forEach(food -> {
                    context.append("- ").append(food.getName())
                            .append(" - ₹").append(food.getPrice()).append("\n");
                });
            }

        } catch (Exception e) {
            System.err.println("Error building context: " + e.getMessage());
        }

        return context.toString();
    }

    private String createEnhancedPrompt(String userMessage, String context) {
        return String.format("""
            You are a helpful movie theater assistant chatbot for a cinema booking system.
            
            IMPORTANT GUIDELINES:
            - Be friendly, helpful, and enthusiastic about movies 🎬
            - Use emojis appropriately to make responses engaging
            - Keep responses concise but informative
            - If users ask about booking, guide them through the process
            - Always provide accurate information based on the context below
            - If you don't have specific information, acknowledge it politely
            - Use proper formatting with line breaks for better readability
            
            CURRENT CINEMA INFORMATION:
            %s
            
            PAYMENT METHODS ACCEPTED:
            - UPI (PhonePe, Google Pay, Paytm)
            - Credit/Debit Cards (Visa, Mastercard, RuPay)
            - Net Banking
            - Digital Wallets
            All payments are 100%% secure with encryption.
            
            BOOKING PROCESS:
            1. Browse available shows
            2. Select preferred movie and time
            3. Choose seats
            4. Add snacks (optional)
            5. Make secure payment
            6. Get booking confirmation
            
            CANCELLATION POLICY:
            - Full refund: 2+ hours before show
            - 50%% refund: Less than 2 hours before show
            - No refund: After show time
            
            USER QUERY: "%s"
            
            Please provide a helpful, accurate response based on the above information.
            """, context, userMessage);
    }

    private String extractContent(String json) {
        try {
            JSONObject obj = new JSONObject(json);
            return obj.getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text");
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini response: " + json);
            return "I'm having trouble understanding that right now. Could you please try again? 🤔";
        }
    }
}