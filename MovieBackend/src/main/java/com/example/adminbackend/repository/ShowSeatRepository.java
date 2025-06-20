package com.example.adminbackend.repository;

import com.example.adminbackend.entity.ShowSeat;
import com.example.adminbackend.entity.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowSeatRepository extends JpaRepository<ShowSeat, Long> {

    List<ShowSeat> findByShowId(Long showId);

    List<ShowSeat> findByShowIdAndStatus(Long showId, SeatStatus status);

    @Query("SELECT ss FROM ShowSeat ss WHERE ss.show.id = :showId AND ss.seat.seatNumber IN :seatNumbers")
    List<ShowSeat> findByShowIdAndSeatNumbers(@Param("showId") Long showId, @Param("seatNumbers") List<String> seatNumbers);

    @Modifying
    @Query("UPDATE ShowSeat ss SET ss.status = 'AVAILABLE', ss.lockedByUser = null, ss.lockedAt = null, ss.expiresAt = null " +
            "WHERE ss.status = 'LOCKED' AND ss.expiresAt < :now")
    void releaseExpiredSeats(@Param("now") LocalDateTime now);
}