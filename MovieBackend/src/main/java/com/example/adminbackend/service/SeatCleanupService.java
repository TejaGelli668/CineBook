package com.example.adminbackend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class SeatCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(SeatCleanupService.class);

    @Autowired
    private BookingService bookingService;

    /**
     * Scheduled task to release expired locked seats
     * Runs every 2 minutes to clean up expired seat locks
     */
    @Scheduled(fixedRate = 120000) // 2 minutes in milliseconds
    public void releaseExpiredSeats() {
        try {
            logger.debug("Running scheduled task to release expired seats");
            bookingService.releaseExpiredSeats();
        } catch (Exception e) {
            logger.error("Error in scheduled seat cleanup task: {}", e.getMessage(), e);
        }
    }
}