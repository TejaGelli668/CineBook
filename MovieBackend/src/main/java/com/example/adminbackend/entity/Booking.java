////package com.example.adminbackend.entity;
////
////import com.fasterxml.jackson.annotation.JsonIgnore;
////import jakarta.persistence.*;
////
////
////import java.time.LocalDateTime;
////import java.util.List;
////
////@Entity
////@Table(name = "bookings")
////public class Booking {
////    @Id
////    @GeneratedValue(strategy = GenerationType.IDENTITY)
////    private Long id;
////
////    private String bookingId;
////
////    @ManyToOne(fetch = FetchType.LAZY)
////    @JoinColumn(name = "user_id")
////    @JsonIgnore
////    private User user;
////
////    @ManyToOne(fetch = FetchType.LAZY)
////    @JoinColumn(name = "show_id")
////    @JsonIgnore
////    private Show show;
////
////    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
////    @JsonIgnore
////    private List<ShowSeat> seats;
////
////    private Double totalAmount;
////    private LocalDateTime bookingTime;
////
////    @Enumerated(EnumType.STRING)
////    private BookingStatus status;
////
////    // Getters and setters
////    public Long getId() { return id; }
////    public void setId(Long id) { this.id = id; }
////
////    public String getBookingId() { return bookingId; }
////    public void setBookingId(String bookingId) { this.bookingId = bookingId; }
////
////    public User getUser() { return user; }
////    public void setUser(User user) { this.user = user; }
////
////    public Show getShow() { return show; }
////    public void setShow(Show show) { this.show = show; }
////
////    public List<ShowSeat> getSeats() { return seats; }
////    public void setSeats(List<ShowSeat> seats) { this.seats = seats; }
////
////    public Double getTotalAmount() { return totalAmount; }
////    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
////
////    public LocalDateTime getBookingTime() { return bookingTime; }
////    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }
////
////    public BookingStatus getStatus() { return status; }
////    public void setStatus(BookingStatus status) { this.status = status; }
////}
//package com.example.adminbackend.entity;
//
//import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
//import jakarta.persistence.*;
//
//import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;
//import java.util.List;
//import java.util.stream.Collectors;
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
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "user_id")
//    @JsonIgnoreProperties({"password", "bookings", "hibernateLazyInitializer", "handler"})
//    private User user;
//
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "show_id")
//    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "showSeats"})
//    private Show show;
//
//    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
//    @JsonIgnoreProperties({"booking", "hibernateLazyInitializer", "handler", "show"})
//    private List<ShowSeat> seats;
//
//    private Double totalAmount;
//    private LocalDateTime bookingTime;
//
//    @Enumerated(EnumType.STRING)
//    private BookingStatus status;
//
//    // Add transient fields for frontend compatibility
//    @Transient
//    public String getMovieTitle() {
//        return show != null && show.getMovie() != null ? show.getMovie().getTitle() : "Unknown Movie";
//    }
//
//    @Transient
//    public String getTheaterName() {
//        return show != null && show.getTheater() != null ? show.getTheater().getName() : "Unknown Theater";
//    }
//
//    @Transient
//    public String getTheaterLocation() {
//        return show != null && show.getTheater() != null ? show.getTheater().getLocation() : "Unknown Location";
//    }
//
//    @Transient
//    public String getShowTime() {
//        if (show != null && show.getShowTime() != null) {
//            return show.getShowTime().format(DateTimeFormatter.ofPattern("h:mm a"));
//        }
//        return "Unknown Time";
//    }
//
//    @Transient
//    public String getShowDate() {
//        if (show != null && show.getShowTime() != null) {
//            return show.getShowTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
//        }
//        return "Unknown Date";
//    }
//
//    @Transient
//    public String getBookingDate() {
//        return bookingTime != null ? bookingTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "Unknown Date";
//    }
//
//    @Transient
//    public String getSeatNumbers() {
//        if (seats == null || seats.isEmpty()) {
//            return "No seats";
//        }
//        return seats.stream()
//                .map(ShowSeat::getSeatNumber)
//                .collect(Collectors.joining(", "));
//    }
//
//    @Transient
//    public Integer getNumberOfSeats() {
//        return seats != null ? seats.size() : 0;
//    }
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
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
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

    @Column(name = "booking_id", unique = true)
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

    // NEW: Food-related relationships
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"booking", "hibernateLazyInitializer", "handler"})
    private List<BookingFoodItem> foodItems;

    // Enhanced pricing fields
    @Column(name = "ticket_total", precision = 10)
    private BigDecimal ticketTotal;

    @Column(name = "food_total", precision = 10)
    private BigDecimal foodTotal;

    @Column(name = "convenience_fee", precision = 10)
    private BigDecimal convenienceFee;

    @Column(name = "grand_total", precision = 10)
    private BigDecimal grandTotal;

    // Keep existing field for backward compatibility
    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "booking_time")
    @CreationTimestamp
    private LocalDateTime bookingTime;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    // NEW: Additional fields for better tracking
    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_id")
    private String paymentId;

    @Column(name = "seat_numbers", columnDefinition = "TEXT")
    private String seatNumbers; // Comma-separated seat numbers for quick access

    // Constructors
    public Booking() {}

    public Booking(String bookingId, User user, Show show) {
        this.bookingId = bookingId;
        this.user = user;
        this.show = show;
        this.status = BookingStatus.PENDING;
    }

    // Existing transient methods for frontend compatibility
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
    public String getSeatNumbersFromSeats() {
        if (seats == null || seats.isEmpty()) {
            return seatNumbers != null ? seatNumbers : "No seats";
        }
        return seats.stream()
                .map(ShowSeat::getSeatNumber)
                .collect(Collectors.joining(", "));
    }

    @Transient
    public Integer getNumberOfSeats() {
        if (seats != null && !seats.isEmpty()) {
            return seats.size();
        }
        // Fallback to counting from seatNumbers string
        if (seatNumbers != null && !seatNumbers.trim().isEmpty()) {
            return seatNumbers.split(",").length;
        }
        return 0;
    }

    // NEW: Food-related transient methods
    @Transient
    public Boolean getHasFoodItems() {
        return foodItems != null && !foodItems.isEmpty();
    }

    @Transient
    public Integer getFoodItemsCount() {
        return foodItems != null ? foodItems.size() : 0;
    }

    @Transient
    public Double getTicketTotalAsDouble() {
        return ticketTotal != null ? ticketTotal.doubleValue() : 0.0;
    }

    @Transient
    public Double getFoodTotalAsDouble() {
        return foodTotal != null ? foodTotal.doubleValue() : 0.0;
    }

    @Transient
    public Double getConvenienceFeeAsDouble() {
        return convenienceFee != null ? convenienceFee.doubleValue() : 0.0;
    }

    @Transient
    public Double getGrandTotalAsDouble() {
        return grandTotal != null ? grandTotal.doubleValue() : totalAmount != null ? totalAmount : 0.0;
    }

    // NEW: Utility methods for calculations
    public void calculateTotals() {
        if (ticketTotal == null) ticketTotal = BigDecimal.ZERO;
        if (foodTotal == null) foodTotal = BigDecimal.ZERO;

        // Calculate convenience fee (2% of subtotal)
        BigDecimal subtotal = ticketTotal.add(foodTotal);
        this.convenienceFee = subtotal.multiply(new BigDecimal("0.02"));

        // Calculate grand total
        this.grandTotal = subtotal.add(convenienceFee);

        // Update legacy field for backward compatibility
        this.totalAmount = grandTotal.doubleValue();
    }

    public void addFoodItem(BookingFoodItem foodItem) {
        if (this.foodItems == null) {
            this.foodItems = new java.util.ArrayList<>();
        }
        this.foodItems.add(foodItem);
        foodItem.setBooking(this);
    }

    public void removeFoodItem(BookingFoodItem foodItem) {
        if (this.foodItems != null) {
            this.foodItems.remove(foodItem);
            foodItem.setBooking(null);
        }
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Show getShow() {
        return show;
    }

    public void setShow(Show show) {
        this.show = show;
    }

    public List<ShowSeat> getSeats() {
        return seats;
    }

    public void setSeats(List<ShowSeat> seats) {
        this.seats = seats;
    }

    public List<BookingFoodItem> getFoodItems() {
        return foodItems;
    }

    public void setFoodItems(List<BookingFoodItem> foodItems) {
        this.foodItems = foodItems;
    }

    public BigDecimal getTicketTotal() {
        return ticketTotal;
    }

    public void setTicketTotal(BigDecimal ticketTotal) {
        this.ticketTotal = ticketTotal;
    }

    public BigDecimal getFoodTotal() {
        return foodTotal;
    }

    public void setFoodTotal(BigDecimal foodTotal) {
        this.foodTotal = foodTotal;
    }

    public BigDecimal getConvenienceFee() {
        return convenienceFee;
    }

    public void setConvenienceFee(BigDecimal convenienceFee) {
        this.convenienceFee = convenienceFee;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(BigDecimal grandTotal) {
        this.grandTotal = grandTotal;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalDateTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getSeatNumbers() {
        return seatNumbers;
    }

    public void setSeatNumbers(String seatNumbers) {
        this.seatNumbers = seatNumbers;
    }

    @Override
    public String toString() {
        return "Booking{" +
                "id=" + id +
                ", bookingId='" + bookingId + '\'' +
                ", movieTitle='" + getMovieTitle() + '\'' +
                ", theaterName='" + getTheaterName() + '\'' +
                ", numberOfSeats=" + getNumberOfSeats() +
                ", grandTotal=" + grandTotal +
                ", status=" + status +
                ", hasFoodItems=" + getHasFoodItems() +
                '}';
    }
}