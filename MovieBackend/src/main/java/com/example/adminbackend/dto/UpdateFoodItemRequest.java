package com.example.adminbackend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateFoodItemRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private String imageUrl;
    private String size;
    private Boolean isAvailable;
}
