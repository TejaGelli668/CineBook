//package com.example.adminbackend.repository;
//
//import com.example.adminbackend.entity.Booking;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface BookingRepository extends JpaRepository<Booking, Long> {
//    Optional<Booking> findByBookingId(String bookingId);
//    List<Booking> findByUserId(Long userId);
//}
package com.example.adminbackend.repository;

import com.example.adminbackend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingId(String bookingId);

    @Query("SELECT DISTINCT b FROM Booking b " +
            "LEFT JOIN FETCH b.show s " +
            "LEFT JOIN FETCH s.movie m " +
            "LEFT JOIN FETCH s.theater t " +
            "LEFT JOIN FETCH b.seats seats " +
            "LEFT JOIN FETCH seats.seat seat " +
            "WHERE b.user.id = :userId " +
            "ORDER BY b.bookingTime DESC")
    List<Booking> findByUserIdWithDetails(@Param("userId") Long userId);

    List<Booking> findByUserIdOrderByBookingTimeDesc(Long userId);

    List<Booking> findByUserId(Long userId);
}