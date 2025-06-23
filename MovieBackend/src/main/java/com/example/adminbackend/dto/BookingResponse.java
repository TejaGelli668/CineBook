package com.example.adminbackend.dto;

public class BookingResponse {
    private String bookingId;
    private boolean success;
    private double totalAmount;
    private String message;

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
