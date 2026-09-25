package com.example.adminbackend.controller;

import com.example.adminbackend.dto.ApiResponse;
import com.example.adminbackend.entity.FoodItem;
import com.example.adminbackend.service.FoodItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food-items")
// REMOVED @CrossOrigin - using SecurityConfig CORS instead
public class FoodItemController {

    @Autowired
    private FoodItemService foodItemService;

    // GET ALL FOOD ITEMS (for users) - WITH DEBUG LOGGING
    @GetMapping
    public ResponseEntity<ApiResponse<List<FoodItem>>> getAllFoodItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long theaterId) {
        try {
            System.out.println("🔍 FoodItemController.getAllFoodItems called");
            System.out.println("Category: " + category);
            System.out.println("TheaterId: " + theaterId);
            System.out.println("Request received at: " + java.time.LocalDateTime.now());

            List<FoodItem> items = foodItemService.getAvailableFoodItems(category, theaterId);

            System.out.println("✅ Found " + items.size() + " food items");
            for (FoodItem item : items) {
                System.out.println("- ID: " + item.getId() + ", Name: " + item.getName() +
                        ", Available: " + item.getIsAvailable() + ", Theater: " + item.getTheaterId() +
                        ", Category: " + item.getCategory());
            }

            ApiResponse<List<FoodItem>> response = new ApiResponse<>(true, "Food items retrieved successfully", items);
            System.out.println("📤 Returning response with " + items.size() + " items");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error in getAllFoodItems: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Failed to retrieve food items: " + e.getMessage(), null));
        }
    }

    // GET FOOD ITEMS BY CATEGORY - WITH DEBUG
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<FoodItem>>> getFoodItemsByCategory(@PathVariable String category) {
        try {
            System.out.println("🔍 getFoodItemsByCategory called with category: " + category);

            List<FoodItem> items = foodItemService.getFoodItemsByCategory(category);

            System.out.println("✅ Found " + items.size() + " items for category: " + category);

            return ResponseEntity.ok(new ApiResponse<>(true, "Food items retrieved successfully", items));
        } catch (Exception e) {
            System.err.println("❌ Error in getFoodItemsByCategory: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Failed to retrieve food items: " + e.getMessage(), null));
        }
    }

    // GET FOOD ITEM BY ID - WITH DEBUG
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodItem>> getFoodItemById(@PathVariable Long id) {
        try {
            System.out.println("🔍 getFoodItemById called with ID: " + id);

            List<FoodItem> allItems = foodItemService.getAvailableFoodItems(null, null);
            FoodItem foodItem = allItems.stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Food item not found with id: " + id));

            System.out.println("✅ Found food item: " + foodItem.getName());

            return ResponseEntity.ok(new ApiResponse<>(true, "Food item retrieved successfully", foodItem));
        } catch (Exception e) {
            System.err.println("❌ Error in getFoodItemById: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(404)
                    .body(new ApiResponse<>(false, "Food item not found: " + e.getMessage(), null));
        }
    }

    // THEATER-SPECIFIC ENDPOINT (missing from your original controller)
    @GetMapping("/theater/{theaterId}")
    public ResponseEntity<ApiResponse<List<FoodItem>>> getFoodItemsByTheater(@PathVariable Long theaterId) {
        try {
            System.out.println("🔍 getFoodItemsByTheater called with theaterId: " + theaterId);

            List<FoodItem> items = foodItemService.getAvailableFoodItems(null, theaterId);

            System.out.println("✅ Found " + items.size() + " items for theater: " + theaterId);
            for (FoodItem item : items) {
                System.out.println("- " + item.getName() + " (Theater: " + item.getTheaterId() + ")");
            }

            return ResponseEntity.ok(new ApiResponse<>(true, "Food items retrieved successfully", items));
        } catch (Exception e) {
            System.err.println("❌ Error in getFoodItemsByTheater: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Failed to retrieve food items: " + e.getMessage(), null));
        }
    }
}