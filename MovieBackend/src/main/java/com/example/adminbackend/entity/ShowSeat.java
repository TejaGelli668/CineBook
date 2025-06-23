// src/main/java/com/example/adminbackend/entity/ShowSeat.java
//package com.example.adminbackend.entity;
//
//import com.fasterxml.jackson.annotation.JsonBackReference;
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "show_seats")
//public class ShowSeat {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    // ← child side of Show → ShowSeat
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "show_id")
//    @JsonIgnore
//    private Show show;
//
//    // unidirectional to Seat
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "seat_id")
//    @JsonIgnore
//    private Seat seat;
//
//    @Enumerated(EnumType.STRING)
//    private SeatStatus status;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "booking_id")
//    @JsonIgnore
//    private Booking booking;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "locked_by_user_id")
//    @JsonIgnore
//    private User lockedByUser;
//
//    private LocalDateTime lockedAt;
//    private LocalDateTime expiresAt;
//
//
//
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//
//    public Show getShow() { return show; }
//    public void setShow(Show show) { this.show = show; }
//
//    public Seat getSeat() { return seat; }
//    public void setSeat(Seat seat) { this.seat = seat; }
//
//    public SeatStatus getStatus() { return status; }
//    public void setStatus(SeatStatus status) { this.status = status; }
//
//    public Booking getBooking() { return booking; }
//    public void setBooking(Booking booking) { this.booking = booking; }
//
//    public User getLockedByUser() { return lockedByUser; }
//    public void setLockedByUser(User lockedByUser) { this.lockedByUser = lockedByUser; }
//
//    public LocalDateTime getLockedAt() { return lockedAt; }
//    public void setLockedAt(LocalDateTime lockedAt) { this.lockedAt = lockedAt; }
//
//    public LocalDateTime getExpiresAt() { return expiresAt; }
//    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
//}
package com.example.adminbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "show_seats")
public class ShowSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ← child side of Show → ShowSeat
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id")
    @JsonIgnore
    private Show show;

    // unidirectional to Seat - we need this for seat number
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Seat seat;

    @Enumerated(EnumType.STRING)
    private SeatStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    @JsonIgnore
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locked_by_user_id")
    @JsonIgnore
    private User lockedByUser;

    private LocalDateTime lockedAt;
    private LocalDateTime expiresAt;

    // Add transient method to get seat number from the Seat entity
    @Transient
    public String getSeatNumber() {
        return seat != null ? seat.getSeatNumber() : "Unknown";
    }

    @Transient
    public String getSeatType() {
        return seat != null ? seat.getSeatType() : "Unknown";
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Show getShow() { return show; }
    public void setShow(Show show) { this.show = show; }

    public Seat getSeat() { return seat; }
    public void setSeat(Seat seat) { this.seat = seat; }

    public SeatStatus getStatus() { return status; }
    public void setStatus(SeatStatus status) { this.status = status; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public User getLockedByUser() { return lockedByUser; }
    public void setLockedByUser(User lockedByUser) { this.lockedByUser = lockedByUser; }

    public LocalDateTime getLockedAt() { return lockedAt; }
    public void setLockedAt(LocalDateTime lockedAt) { this.lockedAt = lockedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}