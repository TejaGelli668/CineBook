package com.example.adminbackend.service;

import com.example.adminbackend.dto.FoodItemRequest;
import com.example.adminbackend.entity.FoodCategory;
import com.example.adminbackend.entity.FoodItem;
import com.example.adminbackend.repository.FoodItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FoodItemService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    // GET AVAILABLE FOOD ITEMS FOR USERS
    public List<FoodItem> getAvailableFoodItems(String category, Long theaterId) {
        if (category != null && theaterId != null) {
            return foodItemRepository.findByIsAvailableTrueAndCategoryAndTheaterId(
                    FoodCategory.valueOf(category.toUpperCase()), theaterId);
        } else if (category != null) {
            return foodItemRepository.findByIsAvailableTrueAndCategory(
                    FoodCategory.valueOf(category.toUpperCase()));
        } else if (theaterId != null) {
            return foodItemRepository.findByIsAvailableTrueAndTheaterId(theaterId);
        } else {
            return foodItemRepository.findByIsAvailableTrue();
        }
    }

    // GET FOOD ITEMS BY CATEGORY
    public List<FoodItem> getFoodItemsByCategory(String category) {
        return foodItemRepository.findByIsAvailableTrueAndCategory(
                FoodCategory.valueOf(category.toUpperCase()));
    }

    // CREATE FOOD ITEM
    public FoodItem createFoodItem(FoodItemRequest request) {
        FoodItem foodItem = new FoodItem();
        foodItem.setName(request.getName());
        foodItem.setDescription(request.getDescription());
        foodItem.setPrice(request.getPrice());
        foodItem.setCategory(FoodCategory.valueOf(request.getCategory().toUpperCase()));
        foodItem.setImageUrl(request.getImageUrl());
        foodItem.setSize(request.getSize());
        foodItem.setIsAvailable(request.getIsAvailable());
        foodItem.setTheaterId(request.getTheaterId());

        return foodItemRepository.save(foodItem);
    }

    // UPDATE FOOD ITEM
    public FoodItem updateFoodItem(Long id, FoodItemRequest request) {
        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found with id: " + id));

        if (request.getName() != null) {
            foodItem.setName(request.getName());
        }
        if (request.getDescription() != null) {
            foodItem.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            foodItem.setPrice(request.getPrice());
        }
        if (request.getCategory() != null) {
            foodItem.setCategory(FoodCategory.valueOf(request.getCategory().toUpperCase()));
        }
        if (request.getImageUrl() != null) {
            foodItem.setImageUrl(request.getImageUrl());
        }
        if (request.getSize() != null) {
            foodItem.setSize(request.getSize());
        }
        if (request.getIsAvailable() != null) {
            foodItem.setIsAvailable(request.getIsAvailable());
        }

        return foodItemRepository.save(foodItem);
    }

    // DELETE FOOD ITEM
    public void deleteFoodItem(Long id) {
        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found with id: " + id));

        // Soft delete - just mark as unavailable
        foodItem.setIsAvailable(false);
        foodItemRepository.save(foodItem);
    }

    // GET ALL FOOD ITEMS FOR ADMIN
    public List<FoodItem> getAllFoodItemsForAdmin() {
        return foodItemRepository.findAll();
    }

    // VALIDATE FOOD ITEMS
    public void validateFoodItems(List<com.example.adminbackend.dto.BookingRequest.FoodItemRequest> foodItemRequests) {
        for (com.example.adminbackend.dto.BookingRequest.FoodItemRequest request : foodItemRequests) {
            FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                    .orElseThrow(() -> new RuntimeException("Food item not found: " + request.getFoodItemId()));

            if (!foodItem.getIsAvailable()) {
                throw new RuntimeException("Food item is not available: " + foodItem.getName());
            }

            if (request.getQuantity() <= 0) {
                throw new RuntimeException("Invalid quantity for food item: " + foodItem.getName());
            }
        }
    }
}