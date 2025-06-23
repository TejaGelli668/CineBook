package com.example.adminbackend.repository;

import com.example.adminbackend.entity.ShowSeat;
import com.example.adminbackend.entity.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowSeatRepository extends JpaRepository<ShowSeat, Long> {

    // FIXED: Find all seats for a specific show with seat details in one query (N+1 fix)
    @Query("SELECT ss FROM ShowSeat ss LEFT JOIN FETCH ss.seat s WHERE ss.show.id = :showId ORDER BY s.rowLetter, s.seatPosition")
    List<ShowSeat> findByShowId(@Param("showId") Long showId);

    // Find available seats for a specific show
    @Query("SELECT ss FROM ShowSeat ss LEFT JOIN FETCH ss.seat s WHERE ss.show.id = :showId AND ss.status = :status ORDER BY s.rowLetter, s.seatPosition")
    List<ShowSeat> findByShowIdAndStatus(@Param("showId") Long showId, @Param("status") SeatStatus status);

    // Find available seats for a show (convenience method)
    default List<ShowSeat> findAvailableSeatsForShow(Long showId) {
        return findByShowIdAndStatus(showId, SeatStatus.AVAILABLE);
    }

    // Find booked seats for a show
    default List<ShowSeat> findBookedSeatsForShow(Long showId) {
        return findByShowIdAndStatus(showId, SeatStatus.BOOKED);
    }

    // Find locked seats for a show
    default List<ShowSeat> findLockedSeatsForShow(Long showId) {
        return findByShowIdAndStatus(showId, SeatStatus.LOCKED);
    }

    // Find seats by booking ID
    @Query("SELECT ss FROM ShowSeat ss LEFT JOIN FETCH ss.seat WHERE ss.booking.id = :bookingId")
    List<ShowSeat> findByBookingId(@Param("bookingId") Long bookingId);

    // FIXED: Find seats by show and seat numbers with proper JOIN FETCH
    @Query("SELECT ss FROM ShowSeat ss LEFT JOIN FETCH ss.seat s WHERE ss.show.id = :showId AND s.seatNumber IN :seatNumbers")
    List<ShowSeat> findByShowIdAndSeatNumbers(@Param("showId") Long showId, @Param("seatNumbers") List<String> seatNumbers);

    // Find expired locked seats that need to be released
    @Query("SELECT ss FROM ShowSeat ss LEFT JOIN FETCH ss.seat WHERE ss.status = 'LOCKED' AND ss.expiresAt < :currentTime")
    List<ShowSeat> findExpiredLockedSeats(@Param("currentTime") LocalDateTime currentTime);

    // Find seats locked by a specific user
    @Query("SELECT ss FROM ShowSeat ss LEFT JOIN FETCH ss.seat WHERE ss.lockedByUser.id = :userId AND ss.status = 'LOCKED'")
    List<ShowSeat> findSeatsLockedByUser(@Param("userId") Long userId);

    // Count available seats for a show
    @Query("SELECT COUNT(ss) FROM ShowSeat ss WHERE ss.show.id = :showId AND ss.status = 'AVAILABLE'")
    long countAvailableSeatsForShow(@Param("showId") Long showId);

    // Count booked seats for a show
    @Query("SELECT COUNT(ss) FROM ShowSeat ss WHERE ss.show.id = :showId AND ss.status = 'BOOKED'")
    long countBookedSeatsForShow(@Param("showId") Long showId);

    // Delete all seats for a specific show (used when deleting a show)
    @Modifying
    @Transactional
    @Query("DELETE FROM ShowSeat ss WHERE ss.show.id = :showId")
    void deleteByShowId(@Param("showId") Long showId);

    // Release expired locked seats
    @Modifying
    @Transactional
    @Query("UPDATE ShowSeat ss SET ss.status = 'AVAILABLE', ss.lockedByUser = null, ss.lockedAt = null, ss.expiresAt = null WHERE ss.status = 'LOCKED' AND ss.expiresAt < :currentTime")
    void releaseExpiredSeats(@Param("currentTime") LocalDateTime currentTime);

    // Additional utility methods for seat management

    // Release all seats locked by a specific user
    @Modifying
    @Transactional
    @Query("UPDATE ShowSeat ss SET ss.status = 'AVAILABLE', ss.lockedByUser = null, ss.lockedAt = null, ss.expiresAt = null WHERE ss.lockedByUser.id = :userId AND ss.status = 'LOCKED'")
    void releaseSeatsLockedByUser(@Param("userId") Long userId);

    // Find seats that are about to expire (within next few minutes)
    @Query("SELECT ss FROM ShowSeat ss LEFT JOIN FETCH ss.seat WHERE ss.status = 'LOCKED' AND ss.expiresAt BETWEEN :currentTime AND :warningTime")
    List<ShowSeat> findSeatsAboutToExpire(@Param("currentTime") LocalDateTime currentTime, @Param("warningTime") LocalDateTime warningTime);

    // Update seat status for multiple seats
    @Modifying
    @Transactional
    @Query("UPDATE ShowSeat ss SET ss.status = :status WHERE ss.id IN :seatIds")
    void updateSeatStatus(@Param("seatIds") List<Long> seatIds, @Param("status") SeatStatus status);

    // Find all seats for a show with their current lock information (already optimized above)
    @Query("SELECT ss FROM ShowSeat ss LEFT JOIN FETCH ss.seat LEFT JOIN FETCH ss.lockedByUser WHERE ss.show.id = :showId ORDER BY ss.seat.rowLetter, ss.seat.seatPosition")
    List<ShowSeat> findAllSeatsWithDetailsForShow(@Param("showId") Long showId);

    // NEW METHOD: Check if a specific show-seat combination exists
    @Query("SELECT CASE WHEN COUNT(ss) > 0 THEN true ELSE false END FROM ShowSeat ss WHERE ss.show.id = :showId AND ss.seat.id = :seatId")
    boolean existsByShowIdAndSeatId(@Param("showId") Long showId, @Param("seatId") Long seatId);

}