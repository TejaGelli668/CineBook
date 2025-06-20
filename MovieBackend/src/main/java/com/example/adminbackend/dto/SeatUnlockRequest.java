package com.example.adminbackend.dto;

import java.util.List;

public class SeatUnlockRequest {
    private Long showId;
    private List<String> seatNumbers;

    public Long getShowId() { return showId; }
    public void setShowId(Long showId) { this.showId = showId; }

    public List<String> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }
}