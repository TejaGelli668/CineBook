// src/main/java/com/example/adminbackend/entity/Seat.java
package com.example.adminbackend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "seats")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String seatNumber;
    private String rowLetter;
    private Integer seatPosition;
    private String category;
    private Double price;
    private boolean isWheelchairAccessible;

    // ← child side of Seat → Theater
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_id")
    @JsonBackReference
    private Theater theater;

    public Seat() {}

    // Add transient method for consistent seat type access
    @Transient
    public String getSeatType() {
        return category != null ? category : "REGULAR";
    }

    // Add transient method to generate seat number if not set
    @Transient
    public String getFormattedSeatNumber() {
        if (seatNumber != null && !seatNumber.isEmpty()) {
            return seatNumber;
        }
        if (rowLetter != null && seatPosition != null) {
            return rowLetter + seatPosition;
        }
        return "Unknown";
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }

    public String getRowLetter() { return rowLetter; }
    public void setRowLetter(String rowLetter) { this.rowLetter = rowLetter; }

    public Integer getSeatPosition() { return seatPosition; }
    public void setSeatPosition(Integer seatPosition) { this.seatPosition = seatPosition; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public boolean isWheelchairAccessible() { return isWheelchairAccessible; }
    public void setWheelchairAccessible(boolean wheelchairAccessible) {
        isWheelchairAccessible = wheelchairAccessible;
    }

    public Theater getTheater() { return theater; }
    public void setTheater(Theater theater) { this.theater = theater; }
}