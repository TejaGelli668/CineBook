package com.example.adminbackend.controller;

import com.example.adminbackend.dto.ApiResponse;
import com.example.adminbackend.dto.FoodItemRequest;
import com.example.adminbackend.entity.FoodItem;
import com.example.adminbackend.service.FoodItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/food-items")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:3001"}, allowCredentials = "true")
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
public class AdminFoodItemController {

    @Autowired
    private FoodItemService foodItemService;

    // GET ALL FOOD ITEMS FOR ADMIN (including inactive)
    @GetMapping
    public ResponseEntity<ApiResponse<List<FoodItem>>> getAllFoodItems() {
        try {
            List<FoodItem> foodItems = foodItemService.getAllFoodItemsForAdmin();
            return ResponseEntity.ok(new ApiResponse<>(true, "Food items retrieved successfully", foodItems));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Failed to retrieve food items: " + e.getMessage(), null));
        }
    }

    // CREATE FOOD ITEM
    @PostMapping
    public ResponseEntity<ApiResponse<FoodItem>> createFoodItem(@RequestBody FoodItemRequest request) {
        try {
            FoodItem foodItem = foodItemService.createFoodItem(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Food item created successfully", foodItem));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Failed to create food item: " + e.getMessage(), null));
        }
    }

    // UPDATE FOOD ITEM
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodItem>> updateFoodItem(
            @PathVariable Long id,
            @RequestBody FoodItemRequest request) {
        try {
            FoodItem foodItem = foodItemService.updateFoodItem(id, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Food item updated successfully", foodItem));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Failed to update food item: " + e.getMessage(), null));
        }
    }

    // DELETE FOOD ITEM
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFoodItem(@PathVariable Long id) {
        try {
            foodItemService.deleteFoodItem(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Food item deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Failed to delete food item: " + e.getMessage(), null));
        }
    }

    // GET FOOD ITEM BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodItem>> getFoodItemById(@PathVariable Long id) {
        try {
            FoodItem foodItem = foodItemService.getAllFoodItemsForAdmin().stream()
                    .filter(item -> item.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Food item not found with id: " + id));
            return ResponseEntity.ok(new ApiResponse<>(true, "Food item retrieved successfully", foodItem));
        } catch (Exception e) {
            return ResponseEntity.status(404)
                    .body(new ApiResponse<>(false, "Food item not found: " + e.getMessage(), null));
        }
    }
}