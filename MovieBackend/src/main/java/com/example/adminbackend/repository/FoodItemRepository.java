package com.example.adminbackend.repository;

import com.example.adminbackend.entity.FoodCategory;
import com.example.adminbackend.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByIsAvailableTrue();
    List<FoodItem> findByIsAvailableTrueAndCategory(FoodCategory category);
    List<FoodItem> findByIsAvailableTrueAndTheaterId(Long theaterId);
    List<FoodItem> findByIsAvailableTrueAndCategoryAndTheaterId(FoodCategory category, Long theaterId);
}