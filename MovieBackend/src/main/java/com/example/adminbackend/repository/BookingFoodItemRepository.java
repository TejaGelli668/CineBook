package com.example.adminbackend.repository;

import com.example.adminbackend.entity.BookingFoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingFoodItemRepository extends JpaRepository<BookingFoodItem, Long> {
    List<BookingFoodItem> findByBookingId(Long bookingId);
    List<BookingFoodItem> findByBookingIdIn(List<Long> bookingIds);
}
