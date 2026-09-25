package com.example.adminbackend.dto;

public class PaymentIntentRequest {
    private Long amount; // Amount in paise (smallest currency unit)
    private String currency;
    private BookingDataRequest bookingData;

    // Getters and setters
    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BookingDataRequest getBookingData() { return bookingData; }
    public void setBookingData(BookingDataRequest bookingData) { this.bookingData = bookingData; }

    // Inner class for booking data
    public static class BookingDataRequest {
        private String movieTitle;
        private String theaterName;
        private String showTime;
        private String seats;
        private String showDate;
        private Long showId;
        private java.util.List<String> seatNumbers;
        private Object foodItems;

        // Getters and setters
        public String getMovieTitle() { return movieTitle; }
        public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }

        public String getTheaterName() { return theaterName; }
        public void setTheaterName(String theaterName) { this.theaterName = theaterName; }

        public String getShowTime() { return showTime; }
        public void setShowTime(String showTime) { this.showTime = showTime; }

        public String getSeats() { return seats; }
        public void setSeats(String seats) { this.seats = seats; }

        public String getShowDate() { return showDate; }
        public void setShowDate(String showDate) { this.showDate = showDate; }

        public Long getShowId() { return showId; }
        public void setShowId(Long showId) { this.showId = showId; }

        public java.util.List<String> getSeatNumbers() { return seatNumbers; }
        public void setSeatNumbers(java.util.List<String> seatNumbers) { this.seatNumbers = seatNumbers; }

        public Object getFoodItems() { return foodItems; }
        public void setFoodItems(Object foodItems) { this.foodItems = foodItems; }
    }
}