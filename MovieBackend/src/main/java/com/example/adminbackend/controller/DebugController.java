package com.example.adminbackend.controller;

import com.example.adminbackend.entity.FoodItem;
import com.example.adminbackend.entity.FoodCategory;
import com.example.adminbackend.repository.FoodItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/debug")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:3001"}, allowCredentials = "true")
public class DebugController {

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Food item endpoints
    @GetMapping("/food-items")
    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    @GetMapping("/food-items/count")
    public Long getFoodItemCount() {
        return foodItemRepository.count();
    }

    // NEW SEAT ENDPOINTS - These were missing!
    @GetMapping("/shows/{showId}/seats")
    public List<Map<String, Object>> getShowSeats(@PathVariable Long showId) {
        String sql = "SELECT s.id as seat_id, s.seat_number, s.row_letter, s.category, s.price, ss.status " +
                "FROM seats s JOIN show_seats ss ON s.id = ss.seat_id " +
                "WHERE ss.show_id = ? ORDER BY s.row_letter, s.seat_position";
        return jdbcTemplate.queryForList(sql, showId);
    }

    @GetMapping("/shows/{showId}/available-seats")
    public List<Map<String, Object>> getAvailableSeats(@PathVariable Long showId) {
        String sql = "SELECT s.id as seat_id, s.seat_number, s.row_letter, s.category, s.price " +
                "FROM seats s JOIN show_seats ss ON s.id = ss.seat_id " +
                "WHERE ss.show_id = ? AND ss.status = 'AVAILABLE' " +
                "ORDER BY s.row_letter, s.seat_position";
        return jdbcTemplate.queryForList(sql, showId);
    }

    @GetMapping("/shows/{showId}/info")
    public Map<String, Object> getShowInfo(@PathVariable Long showId) {
        String sql = "SELECT id, movie_id, theater_id, show_time FROM shows WHERE id = ?";
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, showId);
        if (result.isEmpty()) {
            return Map.of("error", "Show not found", "showId", showId);
        }
        return result.get(0);
    }

    @PostMapping("/food-items/sample")
    public FoodItem createSampleFoodItem() {
        FoodItem foodItem = new FoodItem();
        foodItem.setName("Popcorn");
        foodItem.setDescription("Fresh popcorn");
        foodItem.setPrice(5.99);
        foodItem.setCategory(FoodCategory.SNACKS);
        foodItem.setSize("MEDIUM");
        foodItem.setIsAvailable(true);
        foodItem.setTheaterId(1L);
        return foodItemRepository.save(foodItem);
    }

    @PostMapping("/food-items/bulk")
    public List<FoodItem> createSampleFoodItems() {
        List<FoodItem> foodItems = Arrays.asList(
                createFoodItem("Popcorn", "Fresh buttered popcorn", 5.99, FoodCategory.SNACKS, "MEDIUM"),
                createFoodItem("Coca Cola", "Cold refreshing soda", 3.50, FoodCategory.BEVERAGES, "LARGE"),
                createFoodItem("Nachos", "Crispy nachos with cheese", 7.99, FoodCategory.SNACKS, "LARGE"),
                createFoodItem("Pepsi", "Cold refreshing cola", 3.50, FoodCategory.BEVERAGES, "MEDIUM"),
                createFoodItem("Ice Cream", "Vanilla ice cream", 4.99, FoodCategory.DESSERTS, "SMALL"),
                createFoodItem("Chocolate Cake", "Rich chocolate cake slice", 6.99, FoodCategory.DESSERTS, "MEDIUM")
        );
        return foodItemRepository.saveAll(foodItems);
    }

    @GetMapping("/shows/{showId}/seat/{seatNumber}/status")
    public Map<String, Object> getSeatStatus(@PathVariable Long showId, @PathVariable String seatNumber) {
        String sql = "SELECT s.id as seat_id, s.seat_number, s.row_letter, s.category, s.price, ss.status, ss.locked_by_user_id, ss.expires_at " +
                "FROM seats s JOIN show_seats ss ON s.id = ss.seat_id " +
                "WHERE ss.show_id = ? AND s.seat_number = ?";
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, showId, seatNumber);
        if (result.isEmpty()) {
            return Map.of("error", "Seat not found", "showId", showId, "seatNumber", seatNumber);
        }
        return result.get(0);
    }

    private FoodItem createFoodItem(String name, String description, Double price, FoodCategory category, String size) {
        FoodItem foodItem = new FoodItem();
        foodItem.setName(name);
        foodItem.setDescription(description);
        foodItem.setPrice(price);
        foodItem.setCategory(category);
        foodItem.setSize(size);
        foodItem.setIsAvailable(true);
        foodItem.setTheaterId(1L);
        return foodItem;
    }
}