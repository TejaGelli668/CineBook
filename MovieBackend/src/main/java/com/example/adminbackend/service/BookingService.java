//package com.example.adminbackend.service;
//
//import com.example.adminbackend.entity.Booking;
//import com.example.adminbackend.entity.BookingStatus;
//import com.example.adminbackend.entity.ShowSeat;
//import com.example.adminbackend.entity.SeatStatus;
//import com.example.adminbackend.repository.BookingRepository;
//import com.example.adminbackend.repository.ShowSeatRepository;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class BookingService {
//
//    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
//
//    @Autowired
//    private BookingRepository bookingRepository;
//
//    @Autowired
//    private ShowSeatRepository showSeatRepository;
//
//    // Get all bookings for a specific user with all related data
//    public List<Booking> getBookingsByUserId(Long userId) {
//        return bookingRepository.findByUserIdWithDetails(userId);
//    }
//
//    // Get booking by ID
//    public Optional<Booking> getBookingById(Long bookingId) {
//        return bookingRepository.findById(bookingId);
//    }
//
//    // Cancel a booking and release the seats
//    @Transactional
//    public Booking cancelBooking(Long bookingId) {
//        try {
//            logger.info("Starting booking cancellation for booking ID: {}", bookingId);
//
//            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
//            if (bookingOpt.isEmpty()) {
//                throw new RuntimeException("Booking not found with id: " + bookingId);
//            }
//
//            Booking booking = bookingOpt.get();
//
//            // Check if booking is already cancelled
//            if (booking.getStatus() == BookingStatus.CANCELLED) {
//                logger.warn("Booking {} is already cancelled", bookingId);
//                return booking;
//            }
//
//            // Update booking status to cancelled
//            booking.setStatus(BookingStatus.CANCELLED);
//
//            // Release all seats associated with this booking
//            List<ShowSeat> bookedSeats = booking.getSeats();
//            if (bookedSeats != null && !bookedSeats.isEmpty()) {
//                logger.info("Releasing {} seats for cancelled booking {}", bookedSeats.size(), bookingId);
//
//                for (ShowSeat seat : bookedSeats) {
//                    // Reset seat status to AVAILABLE
//                    seat.setStatus(SeatStatus.AVAILABLE);
//                    // Clear booking reference
//                    seat.setBooking(null);
//                    // Clear any lock information
//                    seat.setLockedByUser(null);
//                    seat.setLockedAt(null);
//                    seat.setExpiresAt(null);
//
//                    logger.debug("Released seat: {}", seat.getSeat() != null ? seat.getSeat().getSeatNumber() : "Unknown");
//                }
//
//                // Save all updated seats
//                showSeatRepository.saveAll(bookedSeats);
//                logger.info("Successfully released {} seats", bookedSeats.size());
//            } else {
//                logger.warn("No seats found for booking {}", bookingId);
//            }
//
//            // Save the updated booking
//            Booking savedBooking = bookingRepository.save(booking);
//            logger.info("Booking {} successfully cancelled", bookingId);
//
//            return savedBooking;
//
//        } catch (Exception e) {
//            logger.error("Error cancelling booking {}: {}", bookingId, e.getMessage(), e);
//            throw new RuntimeException("Failed to cancel booking: " + e.getMessage());
//        }
//    }
//
//    // Save booking
//    public Booking saveBooking(Booking booking) {
//        return bookingRepository.save(booking);
//    }
//
//    // Find booking by booking ID string
//    public Optional<Booking> findByBookingId(String bookingId) {
//        return bookingRepository.findByBookingId(bookingId);
//    }
//
//    // Get all bookings (for admin purposes)
//    public List<Booking> getAllBookings() {
//        return bookingRepository.findAll();
//    }
//
//    // Additional method to get bookings by user ID without extra fetching (for performance)
//    public List<Booking> getSimpleBookingsByUserId(Long userId) {
//        return bookingRepository.findByUserIdOrderByBookingTimeDesc(userId);
//    }
//
//    // Method to release expired locked seats (should be called by a scheduled task)
//    @Transactional
//    public void releaseExpiredSeats() {
//        try {
//            LocalDateTime now = LocalDateTime.now();
//            List<ShowSeat> expiredSeats = showSeatRepository.findExpiredLockedSeats(now);
//
//            if (!expiredSeats.isEmpty()) {
//                logger.info("Found {} expired locked seats to release", expiredSeats.size());
//
//                for (ShowSeat seat : expiredSeats) {
//                    seat.setStatus(SeatStatus.AVAILABLE);
//                    seat.setLockedByUser(null);
//                    seat.setLockedAt(null);
//                    seat.setExpiresAt(null);
//                    seat.setBooking(null);
//                }
//
//                showSeatRepository.saveAll(expiredSeats);
//                logger.info("Released {} expired seats", expiredSeats.size());
//            }
//        } catch (Exception e) {
//            logger.error("Error releasing expired seats: {}", e.getMessage(), e);
//        }
//    }
//
//    // Method to get available seats for a show
//    public List<ShowSeat> getAvailableSeatsForShow(Long showId) {
//        return showSeatRepository.findAvailableSeatsForShow(showId);
//    }
//
//    // Method to get all seats for a show (regardless of status)
//    public List<ShowSeat> getAllSeatsForShow(Long showId) {
//        return showSeatRepository.findByShowId(showId);
//    }
//}
package com.example.adminbackend.service;

import com.example.adminbackend.entity.Booking;
import com.example.adminbackend.entity.BookingStatus;
import com.example.adminbackend.entity.ShowSeat;
import com.example.adminbackend.entity.SeatStatus;
import com.example.adminbackend.repository.BookingRepository;
import com.example.adminbackend.repository.ShowSeatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // For WebSocket updates

    // Get all bookings for a specific user with all related data
    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserIdWithDetails(userId);
    }

    // Get booking by ID
    public Optional<Booking> getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId);
    }

    // Cancel a booking and release the seats
    @Transactional
    public Booking cancelBooking(Long bookingId) {
        try {
            logger.info("Starting booking cancellation for booking ID: {}", bookingId);

            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
            if (bookingOpt.isEmpty()) {
                throw new RuntimeException("Booking not found with id: " + bookingId);
            }

            Booking booking = bookingOpt.get();

            // Check if booking is already cancelled
            if (booking.getStatus() == BookingStatus.CANCELLED) {
                logger.warn("Booking {} is already cancelled", bookingId);
                return booking;
            }

            // Get all seats associated with this booking
            List<ShowSeat> bookedSeats = booking.getSeats();
            if (bookedSeats == null || bookedSeats.isEmpty()) {
                // Try to find seats by booking ID if not loaded
                bookedSeats = showSeatRepository.findByBookingId(bookingId);
            }

            // Release all seats associated with this booking
            if (bookedSeats != null && !bookedSeats.isEmpty()) {
                logger.info("Releasing {} seats for cancelled booking {}", bookedSeats.size(), bookingId);

                for (ShowSeat seat : bookedSeats) {
                    // Reset seat status to AVAILABLE
                    seat.setStatus(SeatStatus.AVAILABLE);
                    // Clear booking reference
                    seat.setBooking(null);
                    // Clear any lock information
                    seat.setLockedByUser(null);
                    seat.setLockedAt(null);
                    seat.setExpiresAt(null);

                    logger.debug("Released seat: {}", seat.getSeat() != null ? seat.getSeat().getSeatNumber() : "Unknown");
                }

                // Save all updated seats
                showSeatRepository.saveAll(bookedSeats);
                logger.info("Successfully released {} seats", bookedSeats.size());

                // Broadcast seat updates via WebSocket
                try {
                    List<String> seatNumbers = bookedSeats.stream()
                            .map(seat -> seat.getSeat() != null ? seat.getSeat().getSeatNumber() : "Unknown")
                            .filter(seatNumber -> !"Unknown".equals(seatNumber))
                            .toList();

                    if (!seatNumbers.isEmpty() && booking.getShow() != null) {
                        broadcastSeatUpdate(booking.getShow().getId(), seatNumbers, SeatStatus.AVAILABLE);
                    }
                } catch (Exception e) {
                    logger.warn("Failed to broadcast seat update: {}", e.getMessage());
                }
            } else {
                logger.warn("No seats found for booking {}", bookingId);
            }

            // Update booking status to cancelled
            booking.setStatus(BookingStatus.CANCELLED);

            // Save the updated booking
            Booking savedBooking = bookingRepository.save(booking);
            logger.info("Booking {} successfully cancelled", bookingId);

            return savedBooking;

        } catch (Exception e) {
            logger.error("Error cancelling booking {}: {}", bookingId, e.getMessage(), e);
            throw new RuntimeException("Failed to cancel booking: " + e.getMessage());
        }
    }

    // Save booking
    public Booking saveBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    // Find booking by booking ID string
    public Optional<Booking> findByBookingId(String bookingId) {
        return bookingRepository.findByBookingId(bookingId);
    }

    // Get all bookings (for admin purposes)
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // Additional method to get bookings by user ID without extra fetching (for performance)
    public List<Booking> getSimpleBookingsByUserId(Long userId) {
        return bookingRepository.findByUserIdOrderByBookingTimeDesc(userId);
    }

    // Method to release expired locked seats (called by scheduler)
    @Transactional
    public void releaseExpiredSeats() {
        try {
            LocalDateTime now = LocalDateTime.now();

            // Use the repository method to release expired seats
            showSeatRepository.releaseExpiredSeats(now);

            logger.debug("Released expired locked seats at {}", now);
        } catch (Exception e) {
            logger.error("Error releasing expired seats: {}", e.getMessage(), e);
        }
    }

    // Method to get available seats for a show
    public List<ShowSeat> getAvailableSeatsForShow(Long showId) {
        return showSeatRepository.findAvailableSeatsForShow(showId);
    }

    // Method to get all seats for a show (regardless of status)
    public List<ShowSeat> getAllSeatsForShow(Long showId) {
        return showSeatRepository.findByShowId(showId);
    }

    // Helper method to broadcast seat updates via WebSocket
    private void broadcastSeatUpdate(Long showId, List<String> seatNumbers, SeatStatus status) {
        try {
            if (messagingTemplate != null) {
                SeatUpdateMessage message = new SeatUpdateMessage();
                message.setShowId(showId);
                message.setSeatNumbers(seatNumbers);
                message.setStatus(status.toString());
                message.setTimestamp(LocalDateTime.now());

                messagingTemplate.convertAndSend("/topic/seat-updates/" + showId, message);
                logger.debug("Broadcasted seat update for show {} with {} seats", showId, seatNumbers.size());
            }
        } catch (Exception e) {
            logger.warn("Failed to broadcast seat update: {}", e.getMessage());
        }
    }

    // Inner class for WebSocket messages
    public static class SeatUpdateMessage {
        private Long showId;
        private List<String> seatNumbers;
        private String status;
        private LocalDateTime timestamp;

        // Getters and setters
        public Long getShowId() { return showId; }
        public void setShowId(Long showId) { this.showId = showId; }

        public List<String> getSeatNumbers() { return seatNumbers; }
        public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
}