package com.example.adminbackend.dto;

public class SeatDTO {
    private String seatNumber;
    private String row;
    private Integer position;
    private String category;
    private Double price;
    private boolean wheelchairAccessible;
    private String status;

    // Getters and setters
    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }

    public String getRow() { return row; }
    public void setRow(String row) { this.row = row; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public boolean isWheelchairAccessible() { return wheelchairAccessible; }
    public void setWheelchairAccessible(boolean wheelchairAccessible) {
        this.wheelchairAccessible = wheelchairAccessible;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}