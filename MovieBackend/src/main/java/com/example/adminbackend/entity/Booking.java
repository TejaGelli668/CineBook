//package com.example.adminbackend.entity;
//
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import jakarta.persistence.*;
//
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Entity
//@Table(name = "bookings")
//public class Booking {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private String bookingId;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_id")
//    @JsonIgnore
//    private User user;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "show_id")
//    @JsonIgnore
//    private Show show;
//
//    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
//    @JsonIgnore
//    private List<ShowSeat> seats;
//
//    private Double totalAmount;
//    private LocalDateTime bookingTime;
//
//    @Enumerated(EnumType.STRING)
//    private BookingStatus status;
//
//    // Getters and setters
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//
//    public String getBookingId() { return bookingId; }
//    public void setBookingId(String bookingId) { this.bookingId = bookingId; }
//
//    public User getUser() { return user; }
//    public void setUser(User user) { this.user = user; }
//
//    public Show getShow() { return show; }
//    public void setShow(Show show) { this.show = show; }
//
//    public List<ShowSeat> getSeats() { return seats; }
//    public void setSeats(List<ShowSeat> seats) { this.seats = seats; }
//
//    public Double getTotalAmount() { return totalAmount; }
//    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
//
//    public LocalDateTime getBookingTime() { return bookingTime; }
//    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }
//
//    public BookingStatus getStatus() { return status; }
//    public void setStatus(BookingStatus status) { this.status = status; }
//}
package com.example.adminbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bookingId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "bookings", "hibernateLazyInitializer", "handler"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "show_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "showSeats"})
    private Show show;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"booking", "hibernateLazyInitializer", "handler", "show"})
    private List<ShowSeat> seats;

    private Double totalAmount;
    private LocalDateTime bookingTime;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    // Add transient fields for frontend compatibility
    @Transient
    public String getMovieTitle() {
        return show != null && show.getMovie() != null ? show.getMovie().getTitle() : "Unknown Movie";
    }

    @Transient
    public String getTheaterName() {
        return show != null && show.getTheater() != null ? show.getTheater().getName() : "Unknown Theater";
    }

    @Transient
    public String getTheaterLocation() {
        return show != null && show.getTheater() != null ? show.getTheater().getLocation() : "Unknown Location";
    }

    @Transient
    public String getShowTime() {
        if (show != null && show.getShowTime() != null) {
            return show.getShowTime().format(DateTimeFormatter.ofPattern("h:mm a"));
        }
        return "Unknown Time";
    }

    @Transient
    public String getShowDate() {
        if (show != null && show.getShowTime() != null) {
            return show.getShowTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }
        return "Unknown Date";
    }

    @Transient
    public String getBookingDate() {
        return bookingTime != null ? bookingTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "Unknown Date";
    }

    @Transient
    public String getSeatNumbers() {
        if (seats == null || seats.isEmpty()) {
            return "No seats";
        }
        return seats.stream()
                .map(ShowSeat::getSeatNumber)
                .collect(Collectors.joining(", "));
    }

    @Transient
    public Integer getNumberOfSeats() {
        return seats != null ? seats.size() : 0;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Show getShow() { return show; }
    public void setShow(Show show) { this.show = show; }

    public List<ShowSeat> getSeats() { return seats; }
    public void setSeats(List<ShowSeat> seats) { this.seats = seats; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
}