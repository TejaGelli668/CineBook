package com.example.adminbackend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BookingFoodItemResponse {
    private Long foodItemId;
    private String name;
    private String category;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}