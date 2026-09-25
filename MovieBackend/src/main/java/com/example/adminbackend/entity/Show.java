package com.example.adminbackend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shows")
public class Show {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "movie_id", nullable = false)
//    private Movie movie;
//
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name = "theater_id", nullable = false)
//    private Theater theater;
//
//    @Column(name = "show_time", nullable = false)
//    private LocalDateTime showTime;
//
//    @Column(name = "ticket_price", nullable = false, precision = 10, scale = 2)
//    private BigDecimal ticketPrice;
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
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
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