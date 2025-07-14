//// src/main/java/com/example/adminbackend/repository/ShowRepository.java
//package com.example.adminbackend.repository;
//
//import com.example.adminbackend.entity.Show;
//import jakarta.transaction.Transactional;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Modifying;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Repository
//public interface ShowRepository extends JpaRepository<Show, Long> {
//
//    // Find all shows for a specific movie
//    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId")
//    List<Show> findByMovieId(@Param("movieId") Long movieId);
//
//    // Find all shows for a specific theater
//    @Query("SELECT s FROM Show s WHERE s.theater.id = :theaterId")
//    List<Show> findByTheaterId(@Param("theaterId") Long theaterId);
//
//    // Find shows by movie and theater
//    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId AND s.theater.id = :theaterId")
//    List<Show> findByMovieIdAndTheaterId(@Param("movieId") Long movieId, @Param("theaterId") Long theaterId);
//
//    // Find shows by movie and theater within a date range
//    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId AND s.theater.id = :theaterId AND s.showTime BETWEEN :startTime AND :endTime")
//    List<Show> findByMovieIdAndTheaterIdAndShowTimeBetween(
//            @Param("movieId") Long movieId,
//            @Param("theaterId") Long theaterId,
//            @Param("startTime") LocalDateTime startTime,
//            @Param("endTime") LocalDateTime endTime
//    );
//
//    // Find shows by date range
//    @Query("SELECT s FROM Show s WHERE s.showTime BETWEEN :startTime AND :endTime")
//    List<Show> findByShowTimeBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
//
//    // Find shows by movie within a date range
//    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId AND s.showTime BETWEEN :startTime AND :endTime")
//    List<Show> findByMovieIdAndShowTimeBetween(
//            @Param("movieId") Long movieId,
//            @Param("startTime") LocalDateTime startTime,
//            @Param("endTime") LocalDateTime endTime
//    );
//
//    // Find shows by theater within a date range
//    @Query("SELECT s FROM Show s WHERE s.theater.id = :theaterId AND s.showTime BETWEEN :startTime AND :endTime")
//    List<Show> findByTheaterIdAndShowTimeBetween(
//            @Param("theaterId") Long theaterId,
//            @Param("startTime") LocalDateTime startTime,
//            @Param("endTime") LocalDateTime endTime
//    );
//
//    // Find shows after a specific time
//    @Query("SELECT s FROM Show s WHERE s.showTime > :currentTime ORDER BY s.showTime ASC")
//    List<Show> findUpcomingShows(@Param("currentTime") LocalDateTime currentTime);
//
//    // Find shows for a movie after a specific time
//    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId AND s.showTime > :currentTime ORDER BY s.showTime ASC")
//    List<Show> findUpcomingShowsByMovie(@Param("movieId") Long movieId, @Param("currentTime") LocalDateTime currentTime);
//
//    // Alternative method name convention (Spring Data JPA will auto-implement):
//    // List<Show> findByMovieId(Long movieId);
//    // List<Show> findByTheaterId(Long theaterId);
//
//    // Add these THREE methods to your existing ShowRepository.java:
//
//    // Delete all bookings for all shows of a movie (bulk delete)
//    @Modifying
//    @Transactional
//    @Query(value = "DELETE FROM bookings WHERE show_id IN (SELECT id FROM shows WHERE movie_id = :movieId)", nativeQuery = true)
//    void deleteBookingsByMovieId(@Param("movieId") Long movieId);
//
//    // Delete all show_seats for all shows of a movie (bulk delete)
//    @Modifying
//    @Transactional
//    @Query(value = "DELETE FROM show_seats WHERE show_id IN (SELECT id FROM shows WHERE movie_id = :movieId)", nativeQuery = true)
//    void deleteShowSeatsByMovieId(@Param("movieId") Long movieId);
//
//    // Delete all shows for a specific movie (you should already have this)
//    @Modifying
//    @Transactional
//    @Query("DELETE FROM Show s WHERE s.movie.id = :movieId")
//    void deleteByMovieId(@Param("movieId") Long movieId);
//}
package com.example.adminbackend.repository;

import com.example.adminbackend.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {

    // Find all shows for a specific movie
    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId")
    List<Show> findByMovieId(@Param("movieId") Long movieId);

    // Find all shows for a specific theater
    @Query("SELECT s FROM Show s WHERE s.theater.id = :theaterId")
    List<Show> findByTheaterId(@Param("theaterId") Long theaterId);

    // Find shows by movie and theater
    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId AND s.theater.id = :theaterId")
    List<Show> findByMovieIdAndTheaterId(@Param("movieId") Long movieId, @Param("theaterId") Long theaterId);

    // Find shows by movie and theater within a date range
    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId AND s.theater.id = :theaterId AND s.showTime BETWEEN :startTime AND :endTime")
    List<Show> findByMovieIdAndTheaterIdAndShowTimeBetween(
            @Param("movieId") Long movieId,
            @Param("theaterId") Long theaterId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    // Find shows by date range
    @Query("SELECT s FROM Show s WHERE s.showTime BETWEEN :startTime AND :endTime")
    List<Show> findByShowTimeBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    // Find shows by movie within a date range
    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId AND s.showTime BETWEEN :startTime AND :endTime")
    List<Show> findByMovieIdAndShowTimeBetween(
            @Param("movieId") Long movieId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    // Find shows by theater within a date range
    @Query("SELECT s FROM Show s WHERE s.theater.id = :theaterId AND s.showTime BETWEEN :startTime AND :endTime")
    List<Show> findByTheaterIdAndShowTimeBetween(
            @Param("theaterId") Long theaterId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    // Find shows after a specific time
    @Query("SELECT s FROM Show s WHERE s.showTime > :currentTime ORDER BY s.showTime ASC")
    List<Show> findUpcomingShows(@Param("currentTime") LocalDateTime currentTime);

    // Find shows for a movie after a specific time
    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId AND s.showTime > :currentTime ORDER BY s.showTime ASC")
    List<Show> findUpcomingShowsByMovie(@Param("movieId") Long movieId, @Param("currentTime") LocalDateTime currentTime);

    // =================== NEW METHODS FOR MOVIE DELETION ===================

    // Delete all bookings for all shows of a movie (bulk delete)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM bookings WHERE show_id IN (SELECT id FROM shows WHERE movie_id = :movieId)", nativeQuery = true)
    void deleteBookingsByMovieId(@Param("movieId") Long movieId);

    // Delete all show_seats for all shows of a movie (bulk delete)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM show_seats WHERE show_id IN (SELECT id FROM shows WHERE movie_id = :movieId)", nativeQuery = true)
    void deleteShowSeatsByMovieId(@Param("movieId") Long movieId);

    // Delete all shows for a specific movie
    @Modifying
    @Transactional
    @Query("DELETE FROM Show s WHERE s.movie.id = :movieId")
    void deleteByMovieId(@Param("movieId") Long movieId);
}