package com.example.adminbackend.dto;

import java.util.Map;

public class ShowSeatsDTO {
    private Long showId;
    private Map<String, SeatDTO> seats;

    public Long getShowId() { return showId; }
    public void setShowId(Long showId) { this.showId = showId; }

    public Map<String, SeatDTO> getSeats() { return seats; }
    public void setSeats(Map<String, SeatDTO> seats) { this.seats = seats; }
}