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

    // Seat maps in one statement each (row-by-row inserts are far too slow against a remote database).
    // Both skip seats a show already has, so re-running them never creates duplicates.
    @Modifying
    @Query(value = "INSERT INTO show_seats (show_id, seat_id, status) "
            + "SELECT :showId, s.id, 'AVAILABLE' FROM seats s WHERE s.theater_id = :theaterId "
            + "AND NOT EXISTS (SELECT 1 FROM show_seats ss WHERE ss.show_id = :showId AND ss.seat_id = s.id)",
            nativeQuery = true)
    int insertMissingSeatsForShow(@Param("showId") Long showId, @Param("theaterId") Long theaterId);

    @Modifying
    @Query(value = "INSERT INTO show_seats (show_id, seat_id, status) "
            + "SELECT sh.id, s.id, 'AVAILABLE' FROM shows sh JOIN seats s ON s.theater_id = sh.theater_id "
            + "WHERE sh.theater_id = :theaterId "
            + "AND NOT EXISTS (SELECT 1 FROM show_seats ss WHERE ss.show_id = sh.id AND ss.seat_id = s.id)",
            nativeQuery = true)
    int insertMissingSeatsForTheaterShows(@Param("theaterId") Long theaterId);

    // Seat status rows for shows before the cutoff (bookings keep their own copy of seat numbers)
    // Copies seat numbers onto bookings that don't have them yet, for shows about to be cleaned up
    @Modifying
    @Query(value = "UPDATE bookings SET seat_numbers = (SELECT string_agg(s.seat_number, ',' ORDER BY s.row_letter, s.seat_position) "
            + "FROM show_seats ss JOIN seats s ON s.id = ss.seat_id WHERE ss.booking_id = bookings.id) "
            + "WHERE (seat_numbers IS NULL OR seat_numbers = '') AND id IN (SELECT ss.booking_id FROM show_seats ss "
            + "JOIN shows sh ON sh.id = ss.show_id WHERE sh.show_time < :cutoff AND ss.booking_id IS NOT NULL)",
            nativeQuery = true)
    int copySeatNumbersToBookingsBefore(@Param("cutoff") LocalDateTime cutoff);

    @Modifying
    @Query(value = "DELETE FROM show_seats WHERE show_id IN (SELECT id FROM shows WHERE show_time < :cutoff)",
            nativeQuery = true)
    int deleteSeatsForShowsBefore(@Param("cutoff") LocalDateTime cutoff);

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

    // Seats still free for several shows in one query: rows of [showId, count]
    @Query("SELECT ss.show.id, COUNT(ss) FROM ShowSeat ss WHERE ss.show.id IN :showIds AND ss.status = 'AVAILABLE' GROUP BY ss.show.id")
    List<Object[]> countAvailableSeatsForShows(@Param("showIds") List<Long> showIds);

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


    // Seat counts per show and status in one query: rows of [showId, status, count]
    @Query("SELECT ss.show.id, ss.status, COUNT(ss) FROM ShowSeat ss WHERE ss.show.id IN :showIds GROUP BY ss.show.id, ss.status")
    List<Object[]> countSeatsByStatusForShows(@Param("showIds") List<Long> showIds);


    // Seats a customer is holding right now, in any show
    @Query("SELECT ss FROM ShowSeat ss JOIN FETCH ss.seat WHERE ss.lockedByUser.id = :userId AND ss.status = 'LOCKED' AND ss.expiresAt > :now")
    List<ShowSeat> findActiveHoldsByUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}