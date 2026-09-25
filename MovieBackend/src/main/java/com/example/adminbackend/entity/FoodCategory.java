package com.example.adminbackend.entity;

public enum FoodCategory {
    BEVERAGES("Beverages"),
    SNACKS("Snacks"),
    DESSERTS("Desserts");

    private final String displayName;

    FoodCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }

    // Helper method to get category from string (case insensitive)
    public static FoodCategory fromString(String category) {
        if (category == null) {
            return null;
        }

        for (FoodCategory foodCategory : FoodCategory.values()) {
            if (foodCategory.name().equalsIgnoreCase(category) ||
                    foodCategory.displayName.equalsIgnoreCase(category)) {
                return foodCategory;
            }
        }

        throw new IllegalArgumentException("Unknown food category: " + category);
    }
}