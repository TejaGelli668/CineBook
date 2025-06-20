package com.example.adminbackend.scheduler;

import com.example.adminbackend.repository.ShowSeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class SeatExpirationScheduler {

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Scheduled(fixedDelay = 60000) // Run every minute
    @Transactional
    public void releaseExpiredSeats() {
        showSeatRepository.releaseExpiredSeats(LocalDateTime.now());
    }
}