package com.example.adminbackend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SeatUpdateMessage {
    private Long showId;
    private List<String> seatNumbers;
    private String status;
    private LocalDateTime timestamp;

    public Long getShowId() { return showId; }
    public void setShowId(Long showId) { this.showId = showId; }

    public List<String> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}