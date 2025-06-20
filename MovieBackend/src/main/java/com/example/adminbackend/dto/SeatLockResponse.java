package com.example.adminbackend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SeatLockResponse {
    private boolean success;
    private List<String> lockedSeats;
    private LocalDateTime expiresAt;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public List<String> getLockedSeats() { return lockedSeats; }
    public void setLockedSeats(List<String> lockedSeats) { this.lockedSeats = lockedSeats; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}