package com.example.adminbackend.scheduler;

import com.example.adminbackend.repository.ShowSeatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Removes seat status rows (show_seats) for shows from previous days, so the table
 * only ever holds today's and upcoming shows. Bookings are unaffected: each booking
 * stores its own seat numbers, amounts and payment reference. Physical seats and the
 * shows themselves are kept.
 *
 * Runs every night at 3 AM Hyderabad time, and once at startup in case the server was off at 3 AM.
 */
@Component
public class PastShowSeatCleanup {

    private static final Logger logger = LoggerFactory.getLogger(PastShowSeatCleanup.class);

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private TransactionTemplate tx;

    @Scheduled(cron = "${app.cleanup.show-seats-cron:0 0 3 * * *}", zone = "${app.time-zone:Asia/Kolkata}")
    public void nightly() {
        run();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        run();
    }

    private void run() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        try {
            // One transaction: seat numbers are saved on the bookings first, and if that
            // fails nothing is deleted
            tx.executeWithoutResult(status -> {
                int copied = showSeatRepository.copySeatNumbersToBookingsBefore(startOfToday);
                if (copied > 0) logger.info("Saved seat numbers on {} bookings before cleanup", copied);
                int removed = showSeatRepository.deleteSeatsForShowsBefore(startOfToday);
                if (removed > 0) {
                    logger.info("Cleared {} seat rows for shows before {}", removed, startOfToday.toLocalDate());
                } else {
                    logger.debug("No past show seats to clear");
                }
            });
        } catch (RuntimeException e) {
            logger.warn("Past show seat cleanup skipped, nothing was deleted: {}", e.getMessage());
        }
    }
}
