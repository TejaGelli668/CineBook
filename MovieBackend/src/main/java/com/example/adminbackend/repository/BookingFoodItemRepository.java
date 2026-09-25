package com.example.adminbackend.repository;

import com.example.adminbackend.entity.BookingFoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingFoodItemRepository extends JpaRepository<BookingFoodItem, Long> {
    List<BookingFoodItem> findByBookingId(Long bookingId);
    List<BookingFoodItem> findByBookingIdIn(List<Long> bookingIds);

    // Canteen sales in a period: rows of [item name, quantity, revenue]
    @org.springframework.data.jpa.repository.Query("SELECT bfi.foodItem.name, SUM(bfi.quantity), SUM(bfi.totalPrice) FROM BookingFoodItem bfi "
            + "WHERE bfi.booking.bookingTime BETWEEN :from AND :to AND bfi.booking.status <> :cancelled "
            + "GROUP BY bfi.foodItem.name ORDER BY SUM(bfi.quantity) DESC")
    List<Object[]> canteenSales(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from,
                                @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to,
                                @org.springframework.data.repository.query.Param("cancelled") com.example.adminbackend.entity.BookingStatus cancelled);

}
