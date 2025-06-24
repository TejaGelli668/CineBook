//package com.example.adminbackend.dto;
//
//public class BookingResponse {
//    private String bookingId;
//    private boolean success;
//    private double totalAmount;
//    private String message;
//
//    public String getBookingId() { return bookingId; }
//    public void setBookingId(String bookingId) { this.bookingId = bookingId; }
//
//    public boolean isSuccess() { return success; }
//    public void setSuccess(boolean success) { this.success = success; }
//
//    public double getTotalAmount() { return totalAmount; }
//    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
//
//    public String getMessage() { return message; }
//    public void setMessage(String message) { this.message = message; }
//}
package com.example.adminbackend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class BookingResponse {
    // Existing fields
    private String bookingId;
    private boolean success;
    private double totalAmount;
    private String message;

    // NEW: Enhanced booking details
    private Long id;
    private ShowDetailsResponse show;
    private List<String> seatNumbers;
    private Double ticketTotal;
    private Double foodTotal;
    private Double convenienceFee;
    private Double grandTotal;
    private List<BookingFoodItemResponse> foodItems;
    private String status;
    private LocalDateTime createdAt;

    // Existing getters/setters
    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    // NEW: Enhanced getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ShowDetailsResponse getShow() { return show; }
    public void setShow(ShowDetailsResponse show) { this.show = show; }

    public List<String> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }

    public Double getTicketTotal() { return ticketTotal; }
    public void setTicketTotal(Double ticketTotal) { this.ticketTotal = ticketTotal; }

    public Double getFoodTotal() { return foodTotal; }
    public void setFoodTotal(Double foodTotal) { this.foodTotal = foodTotal; }

    public Double getConvenienceFee() { return convenienceFee; }
    public void setConvenienceFee(Double convenienceFee) { this.convenienceFee = convenienceFee; }

    public Double getGrandTotal() { return grandTotal; }
    public void setGrandTotal(Double grandTotal) { this.grandTotal = grandTotal; }

    public List<BookingFoodItemResponse> getFoodItems() { return foodItems; }
    public void setFoodItems(List<BookingFoodItemResponse> foodItems) { this.foodItems = foodItems; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Inner class for food item responses
    public static class BookingFoodItemResponse {
        private Long foodItemId;
        private String name;
        private String category;
        private String imageUrl;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;

        // Getters and setters
        public Long getFoodItemId() { return foodItemId; }
        public void setFoodItemId(Long foodItemId) { this.foodItemId = foodItemId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public Double getUnitPrice() { return unitPrice; }
        public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

        public Double getTotalPrice() { return totalPrice; }
        public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    }

    // Inner class for show details (if you don't have this already)
    public static class ShowDetailsResponse {
        private Long id;
        private String movieTitle;
        private String theaterName;
        private String showTime;
        private String showDate;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getMovieTitle() { return movieTitle; }
        public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }

        public String getTheaterName() { return theaterName; }
        public void setTheaterName(String theaterName) { this.theaterName = theaterName; }

        public String getShowTime() { return showTime; }
        public void setShowTime(String showTime) { this.showTime = showTime; }

        public String getShowDate() { return showDate; }
        public void setShowDate(String showDate) { this.showDate = showDate; }
    }
}