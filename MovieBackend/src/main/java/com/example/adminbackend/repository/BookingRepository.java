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
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    // Add these methods to your existing BookingRepository.java
    boolean existsByShowId(Long showId);
    long countByShowId(Long showId);
    List<Booking> findByShowId(Long showId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Booking b WHERE b.show.id = :showId")
    void deleteByShowId(@Param("showId") Long showId);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.show.movie.id = :movieId")
    boolean existsByMovieId(@Param("movieId") Long movieId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.show.movie.id = :movieId")
    long countByMovieId(@Param("movieId") Long movieId);
}