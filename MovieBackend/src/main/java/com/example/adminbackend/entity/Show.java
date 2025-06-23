// src/main/java/com/example/adminbackend/entity/Show.java
//package com.example.adminbackend.entity;
//
//import com.fasterxml.jackson.annotation.JsonBackReference;
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
//import com.fasterxml.jackson.annotation.JsonManagedReference;
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
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
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "movie_id")
//    @JsonIgnoreProperties("shows")
//    private Movie movie;
//
//    // unidirectional to Theater (no cycle here)
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "theater_id")
//    private Theater theater;
//
//    private LocalDateTime showTime;
//    private Double ticketPrice;
//
//    // ← parent side of Show → ShowSeat
//    @OneToMany(mappedBy = "show", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
//    @JsonIgnore
//    private List<ShowSeat> showSeats;
//
//
//
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
package com.example.adminbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Entity
@Table(name = "shows")
public class Show {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ← back side of Movie → Show
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "movie_id")
    @JsonIgnoreProperties({"shows", "hibernateLazyInitializer", "handler"})
    private Movie movie;

    // unidirectional to Theater (no cycle here)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "theater_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Theater theater;

    private LocalDateTime showTime;
    private Double ticketPrice;

    // ← parent side of Show → ShowSeat
    @OneToMany(mappedBy = "show", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ShowSeat> showSeats;

    // Add transient methods for easy access to formatted data
    @Transient
    public String getFormattedShowTime() {
        return showTime != null ? showTime.format(DateTimeFormatter.ofPattern("h:mm a")) : "Unknown Time";
    }

    @Transient
    public String getFormattedShowDate() {
        return showTime != null ? showTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "Unknown Date";
    }

    // Keep original methods for backward compatibility
    @Transient
    public LocalDateTime getStartTime() {
        return showTime;
    }

    @Transient
    public String getDate() {
        return showTime != null ? showTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "Unknown Date";
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }

    public Theater getTheater() { return theater; }
    public void setTheater(Theater theater) { this.theater = theater; }

    public LocalDateTime getShowTime() { return showTime; }
    public void setShowTime(LocalDateTime showTime) { this.showTime = showTime; }

    public Double getTicketPrice() { return ticketPrice; }
    public void setTicketPrice(Double ticketPrice) { this.ticketPrice = ticketPrice; }

    public List<ShowSeat> getShowSeats() { return showSeats; }
    public void setShowSeats(List<ShowSeat> showSeats) { this.showSeats = showSeats; }
}