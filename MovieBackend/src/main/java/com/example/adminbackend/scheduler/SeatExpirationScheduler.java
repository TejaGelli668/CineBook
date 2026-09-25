//package com.example.adminbackend.scheduler;
//
//import com.example.adminbackend.repository.ShowSeatRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//
//@Component
//public class SeatExpirationScheduler {
//
//    @Autowired
//    private ShowSeatRepository showSeatRepository;
//
//    @Scheduled(fixedDelay = 60000) // Run every minute
//    @Transactional
//    public void releaseExpiredSeats() {
//        showSeatRepository.releaseExpiredSeats(LocalDateTime.now());
//    }
//}
package com.example.adminbackend.scheduler;

import com.example.adminbackend.service.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SeatExpirationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(SeatExpirationScheduler.class);

    @Autowired
    private BookingService bookingService;

    @Scheduled(fixedDelay = 60000) // Run every minute
    public void releaseExpiredSeats() {
        try {
            logger.debug("Running scheduled task to release expired locked seats");
            bookingService.releaseExpiredSeats();
        } catch (Exception e) {
            logger.error("Error in seat expiration scheduler: {}", e.getMessage(), e);
        }
    }
}