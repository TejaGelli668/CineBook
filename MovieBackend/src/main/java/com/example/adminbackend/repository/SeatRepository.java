package com.example.adminbackend.repository;

import com.example.adminbackend.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByTheaterId(Long theaterId);

    Seat findBySeatNumberAndTheaterId(String seatNumber, Long theaterId);

    // FIXED: Use s.theater.id instead of s.theaterId
    @Query("SELECT s.seatNumber, s.theater.id, COUNT(s) " +
            "FROM Seat s " +
            "GROUP BY s.seatNumber, s.theater.id " +
            "HAVING COUNT(s) > 1")
    List<Object[]> findDuplicateSeats();

    // Seat categories and prices per theater in one query: rows of [theaterId, category, price, firstRow, lastRow]
    @org.springframework.data.jpa.repository.Query("SELECT s.theater.id, s.category, MIN(s.price), MIN(s.rowLetter), MAX(s.rowLetter) "
            + "FROM Seat s GROUP BY s.theater.id, s.category")
    List<Object[]> seatPriceBands();
}