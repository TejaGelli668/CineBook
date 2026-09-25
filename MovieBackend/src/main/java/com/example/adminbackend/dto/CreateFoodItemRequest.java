package com.example.adminbackend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateFoodItemRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String category; // beverages, snacks, desserts
    private String imageUrl;
    private String size;
    private Boolean isAvailable = true;
    private Long theaterId; // Optional: for theater-specific items
}