//package com.example.adminbackend.entity;
//
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;
//import java.util.List;
//
//@Entity
//@Table(name = "shows")
//public class Show {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    // ← back side of Movie → Show
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "movie_id")
//    @JsonIgnoreProperties({"shows", "hibernateLazyInitializer", "handler"})
//    private Movie movie;
//
//    // unidirectional to Theater (no cycle here)
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "theater_id")
//    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
//    private Theater theater;
//
//    private LocalDateTime showTime;
//    private Double ticketPrice;
//
//    // ← parent side of Show → ShowSeat
//    @OneToMany(mappedBy = "show", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    @JsonIgnore
//    private List<ShowSeat> showSeats;
//
//    // Add transient methods for easy access to formatted data
//    @Transient
//    public String getFormattedShowTime() {
//        return showTime != null ? showTime.format(DateTimeFormatter.ofPattern("h:mm a")) : "Unknown Time";
//    }
//
//    @Transient
//    public String getFormattedShowDate() {
//        return showTime != null ? showTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "Unknown Date";
//    }
//
//    // Keep original methods for backward compatibility
//    @Transient
//    public LocalDateTime getStartTime() {
//        return showTime;
//    }
//
//    @Transient
//    public String getDate() {
//        return showTime != null ? showTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "Unknown Date";
//    }
//
//    // Getters and setters
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//
//    public Movie getMovie() { return movie; }
//    public void setMovie(Movie movie) { this.movie = movie; }
//
//    public Theater getTheater() { return theater; }
//    public void setTheater(Theater theater) { this.theater = theater; }
//
//    public LocalDateTime getShowTime() { return showTime; }
//    public void setShowTime(LocalDateTime showTime) { this.showTime = showTime; }
//
//    public Double getTicketPrice() { return ticketPrice; }
//    public void setTicketPrice(Double ticketPrice) { this.ticketPrice = ticketPrice; }
//
//    public List<ShowSeat> getShowSeats() { return showSeats; }
//    public void setShowSeats(List<ShowSeat> showSeats) { this.showSeats = showSeats; }
//}
// src/main/java/com/example/adminbackend/entity/Show.java
package com.example.adminbackend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shows")
public class Show {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "theater_id", nullable = false)
    private Theater theater;

    @Column(name = "show_time", nullable = false)
    private LocalDateTime showTime;

    @Column(name = "ticket_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal ticketPrice;

    // Constructors
    public Show() {}

    public Show(Movie movie, Theater theater, LocalDateTime showTime, BigDecimal ticketPrice) {
        this.movie = movie;
        this.theater = theater;
        this.showTime = showTime;
        this.ticketPrice = ticketPrice;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Movie getMovie() {
        return movie;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public Theater getTheater() {
        return theater;
    }

    public void setTheater(Theater theater) {
        this.theater = theater;
    }

    public LocalDateTime getShowTime() {
        return showTime;
    }

    public void setShowTime(LocalDateTime showTime) {
        this.showTime = showTime;
    }

    public BigDecimal getTicketPrice() {
        return ticketPrice;
    }

    public void setTicketPrice(BigDecimal ticketPrice) {
        this.ticketPrice = ticketPrice;
    }

    @Override
    public String toString() {
        return "Show{" +
                "id=" + id +
                ", movie=" + (movie != null ? movie.getTitle() : "null") +
                ", theater=" + (theater != null ? theater.getName() : "null") +
                ", showTime=" + showTime +
                ", ticketPrice=" + ticketPrice +
                '}';
    }
}