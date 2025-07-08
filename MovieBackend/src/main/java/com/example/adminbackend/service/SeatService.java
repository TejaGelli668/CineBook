//package com.example.adminbackend.service;
//
//import com.example.adminbackend.dto.*;
//import com.example.adminbackend.entity.*;
//import com.example.adminbackend.repository.*;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Service
//public class SeatService {
//
//    @Autowired
//    private ShowSeatRepository showSeatRepository;
//
//    @Autowired
//    private BookingRepository bookingRepository;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private SimpMessagingTemplate messagingTemplate;
//
//    private static final int LOCK_DURATION_MINUTES = 10;
//
//    public ShowSeatsDTO getShowSeats(Long showId) {
//        List<ShowSeat> showSeats = showSeatRepository.findByShowId(showId);
//
//        Map<String, SeatDTO> seatMap = new HashMap<>();
//        for (ShowSeat showSeat : showSeats) {
//            SeatDTO seatDTO = new SeatDTO();
//            seatDTO.setSeatNumber(showSeat.getSeat().getSeatNumber());
//            seatDTO.setRow(showSeat.getSeat().getRowLetter());
//            seatDTO.setPosition(showSeat.getSeat().getSeatPosition());
//            seatDTO.setCategory(showSeat.getSeat().getCategory());
//            seatDTO.setPrice(showSeat.getSeat().getPrice());
//            seatDTO.setWheelchairAccessible(showSeat.getSeat().isWheelchairAccessible());
//            seatDTO.setStatus(showSeat.getStatus().toString());
//
//            seatMap.put(seatDTO.getSeatNumber(), seatDTO);
//        }
//
//        ShowSeatsDTO response = new ShowSeatsDTO();
//        response.setShowId(showId);
//        response.setSeats(seatMap);
//
//        return response;
//    }
//
//    @Transactional
//    public SeatLockResponse lockSeats(SeatLockRequest request) {
//        // Release any expired locks first
//        showSeatRepository.releaseExpiredSeats(LocalDateTime.now());
//
//        List<ShowSeat> seatsToLock = showSeatRepository.findByShowIdAndSeatNumbers(
//                request.getShowId(), request.getSeatNumbers()
//        );
//
//        // Check if all seats are available
//        List<String> unavailableSeats = new ArrayList<>();
//        for (ShowSeat seat : seatsToLock) {
//            if (seat.getStatus() != SeatStatus.AVAILABLE) {
//                unavailableSeats.add(seat.getSeat().getSeatNumber());
//            }
//        }
//
//        if (!unavailableSeats.isEmpty()) {
//            throw new RuntimeException("Seats not available: " + String.join(", ", unavailableSeats));
//        }
//
//        // Lock the seats
//        LocalDateTime now = LocalDateTime.now();
//        LocalDateTime expiresAt = now.plusMinutes(LOCK_DURATION_MINUTES);
//        User currentUser = getCurrentUser();
//
//        for (ShowSeat seat : seatsToLock) {
//            seat.setStatus(SeatStatus.LOCKED);
//            seat.setLockedByUser(currentUser);
//            seat.setLockedAt(now);
//            seat.setExpiresAt(expiresAt);
//        }
//
//        showSeatRepository.saveAll(seatsToLock);
//
//        // Broadcast update via WebSocket
//        broadcastSeatUpdate(request.getShowId(), request.getSeatNumbers(), SeatStatus.LOCKED);
//
//        SeatLockResponse response = new SeatLockResponse();
//        response.setSuccess(true);
//        response.setLockedSeats(request.getSeatNumbers());
//        response.setExpiresAt(expiresAt);
//
//        return response;
//    }
//
//    @Transactional
//    public void unlockSeats(SeatUnlockRequest request) {
//        List<ShowSeat> seatsToUnlock = showSeatRepository.findByShowIdAndSeatNumbers(
//                request.getShowId(), request.getSeatNumbers()
//        );
//
//        User currentUser = getCurrentUser();
//
//        for (ShowSeat seat : seatsToUnlock) {
//            if (seat.getStatus() == SeatStatus.LOCKED &&
//                    seat.getLockedByUser().getId().equals(currentUser.getId())) {
//                seat.setStatus(SeatStatus.AVAILABLE);
//                seat.setLockedByUser(null);
//                seat.setLockedAt(null);
//                seat.setExpiresAt(null);
//            }
//        }
//
//        showSeatRepository.saveAll(seatsToUnlock);
//
//        // Broadcast update via WebSocket
//        broadcastSeatUpdate(request.getShowId(), request.getSeatNumbers(), SeatStatus.AVAILABLE);
//    }
//
//    @Transactional
//    public BookingResponse bookSeats(BookingRequest request) {
//        List<ShowSeat> seatsToBook = showSeatRepository.findByShowIdAndSeatNumbers(
//                request.getShowId(), request.getSeatNumbers()
//        );
//
//        User currentUser = getCurrentUser();
//
//        // Verify all seats are locked by current user
//        for (ShowSeat seat : seatsToBook) {
//            if (seat.getStatus() != SeatStatus.LOCKED ||
//                    !seat.getLockedByUser().getId().equals(currentUser.getId())) {
//                throw new RuntimeException("Invalid seat selection");
//            }
//        }
//
//        // Create booking
//        Booking booking = new Booking();
//        booking.setBookingId(generateBookingId());
//        booking.setUser(currentUser);
//        booking.setShow(seatsToBook.get(0).getShow());
//        booking.setBookingTime(LocalDateTime.now());
//        booking.setStatus(BookingStatus.CONFIRMED);
//
//        double totalAmount = 0;
//        for (ShowSeat seat : seatsToBook) {
//            seat.setStatus(SeatStatus.BOOKED);
//            seat.setBooking(booking);
//            totalAmount += seat.getSeat().getPrice();
//        }
//
//        booking.setTotalAmount(totalAmount);
//        booking.setSeats(seatsToBook);
//
//        bookingRepository.save(booking);
//        showSeatRepository.saveAll(seatsToBook);
//
//        // Broadcast update via WebSocket
//        broadcastSeatUpdate(request.getShowId(), request.getSeatNumbers(), SeatStatus.BOOKED);
//
//        BookingResponse response = new BookingResponse();
//        response.setBookingId(booking.getBookingId());
//        response.setSuccess(true);
//        response.setTotalAmount(totalAmount);
//
//        return response;
//    }
//
//    private void broadcastSeatUpdate(Long showId, List<String> seatNumbers, SeatStatus status) {
//        SeatUpdateMessage message = new SeatUpdateMessage();
//        message.setShowId(showId);
//        message.setSeatNumbers(seatNumbers);
//        message.setStatus(status.toString());
//        message.setTimestamp(LocalDateTime.now());
//
//        messagingTemplate.convertAndSend("/topic/seat-updates/" + showId, message);
//    }
//
//    private User getCurrentUser() {
//        String email = SecurityContextHolder.getContext().getAuthentication().getName();
//        return userRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//    }
//
//    private String generateBookingId() {
//        return "BK" + System.currentTimeMillis();
//    }
//}
package com.example.adminbackend.service;

import com.example.adminbackend.dto.*;
import com.example.adminbackend.entity.*;
import com.example.adminbackend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SeatService {

    private static final Logger logger = LoggerFactory.getLogger(SeatService.class);

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private static final int LOCK_DURATION_MINUTES = 10;

    public ShowSeatsDTO getShowSeats(Long showId) {
        logger.info("Getting seats for show: {}", showId);

        // FIXED: Use optimized query to fetch all seats with details in one query
        List<ShowSeat> showSeats = showSeatRepository.findByShowId(showId);
        logger.info("Found {} seats for show {}", showSeats.size(), showId);

        Map<String, SeatDTO> seatMap = new HashMap<>();
        for (ShowSeat showSeat : showSeats) {
            if (showSeat.getSeat() != null) {
                SeatDTO seatDTO = new SeatDTO();
                seatDTO.setSeatNumber(showSeat.getSeat().getSeatNumber());
                seatDTO.setRow(showSeat.getSeat().getRowLetter());
                seatDTO.setPosition(showSeat.getSeat().getSeatPosition());
                seatDTO.setCategory(showSeat.getSeat().getCategory());
                seatDTO.setPrice(showSeat.getSeat().getPrice());
                seatDTO.setWheelchairAccessible(showSeat.getSeat().isWheelchairAccessible());
                seatDTO.setStatus(showSeat.getStatus().toString());

                seatMap.put(seatDTO.getSeatNumber(), seatDTO);
            }
        }

        ShowSeatsDTO response = new ShowSeatsDTO();
        response.setShowId(showId);
        response.setSeats(seatMap);

        return response;
    }

    @Transactional
    public SeatLockResponse lockSeats(SeatLockRequest request) {
        logger.info("Attempting to lock seats: {} for show: {}", request.getSeatNumbers(), request.getShowId());

        // FIXED: Remove duplicates from seat numbers
        List<String> uniqueSeatNumbers = request.getSeatNumbers().stream()
                .distinct()
                .collect(Collectors.toList());

        if (uniqueSeatNumbers.size() != request.getSeatNumbers().size()) {
            logger.warn("Duplicate seat numbers detected in request: {}. Using unique seats: {}",
                    request.getSeatNumbers(), uniqueSeatNumbers);
        }

        // Release any expired locks first
        showSeatRepository.releaseExpiredSeats(LocalDateTime.now());

        List<ShowSeat> seatsToLock = showSeatRepository.findByShowIdAndSeatNumbers(
                request.getShowId(), uniqueSeatNumbers
        );

        logger.info("Found {} seats to lock out of {} requested", seatsToLock.size(), uniqueSeatNumbers.size());

        // Check if all requested seats were found
        if (seatsToLock.size() != uniqueSeatNumbers.size()) {
            List<String> foundSeatNumbers = seatsToLock.stream()
                    .map(seat -> seat.getSeat().getSeatNumber())
                    .collect(Collectors.toList());
            List<String> missingSeatNumbers = uniqueSeatNumbers.stream()
                    .filter(seatNumber -> !foundSeatNumbers.contains(seatNumber))
                    .collect(Collectors.toList());

            logger.error("Some seats not found: {}", missingSeatNumbers);
            throw new RuntimeException("Seats not found: " + String.join(", ", missingSeatNumbers));
        }

        // Check if all seats are available
        List<String> unavailableSeats = new ArrayList<>();
        User currentUser = getCurrentUser();

        for (ShowSeat seat : seatsToLock) {
            if (seat.getStatus() == SeatStatus.BOOKED) {
                unavailableSeats.add(seat.getSeat().getSeatNumber());
            } else if (seat.getStatus() == SeatStatus.LOCKED) {
                // Check if locked by current user (allow re-locking)
                if (seat.getLockedByUser() != null &&
                        !seat.getLockedByUser().getId().equals(currentUser.getId())) {
                    unavailableSeats.add(seat.getSeat().getSeatNumber());
                }
            }
        }

        if (!unavailableSeats.isEmpty()) {
            logger.error("Seats not available: {}", unavailableSeats);
            throw new RuntimeException("Seats not available: " + String.join(", ", unavailableSeats));
        }

        // Lock the seats
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(LOCK_DURATION_MINUTES);

        for (ShowSeat seat : seatsToLock) {
            seat.setStatus(SeatStatus.LOCKED);
            seat.setLockedByUser(currentUser);
            seat.setLockedAt(now);
            seat.setExpiresAt(expiresAt);

            logger.debug("Locking seat: {}", seat.getSeat().getSeatNumber());
        }

        showSeatRepository.saveAll(seatsToLock);
        logger.info("Successfully locked {} seats", seatsToLock.size());

        // Broadcast update via WebSocket
        broadcastSeatUpdate(request.getShowId(), uniqueSeatNumbers, SeatStatus.LOCKED);

        SeatLockResponse response = new SeatLockResponse();
        response.setSuccess(true);
        response.setLockedSeats(uniqueSeatNumbers);
        response.setExpiresAt(expiresAt);

        return response;
    }

    @Transactional
    public void unlockSeats(SeatUnlockRequest request) {
        logger.info("Unlocking seats: {} for show: {}", request.getSeatNumbers(), request.getShowId());

        // Remove duplicates
        List<String> uniqueSeatNumbers = request.getSeatNumbers().stream()
                .distinct()
                .collect(Collectors.toList());

        List<ShowSeat> seatsToUnlock = showSeatRepository.findByShowIdAndSeatNumbers(
                request.getShowId(), uniqueSeatNumbers
        );

        User currentUser = getCurrentUser();
        int unlockedCount = 0;

        for (ShowSeat seat : seatsToUnlock) {
            if (seat.getStatus() == SeatStatus.LOCKED &&
                    seat.getLockedByUser() != null &&
                    seat.getLockedByUser().getId().equals(currentUser.getId())) {

                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setLockedByUser(null);
                seat.setLockedAt(null);
                seat.setExpiresAt(null);
                unlockedCount++;

                logger.debug("Unlocked seat: {}", seat.getSeat().getSeatNumber());
            }
        }

        if (unlockedCount > 0) {
            showSeatRepository.saveAll(seatsToUnlock);
            logger.info("Successfully unlocked {} seats", unlockedCount);

            // Broadcast update via WebSocket
            broadcastSeatUpdate(request.getShowId(), uniqueSeatNumbers, SeatStatus.AVAILABLE);
        } else {
            logger.warn("No seats were unlocked for request: {}", request.getSeatNumbers());
        }
    }

    @Transactional
    public BookingResponse bookSeats(BookingRequest request) {
        logger.info("Booking seats: {} for show: {}", request.getSeatNumbers(), request.getShowId());

        // Remove duplicates
        List<String> uniqueSeatNumbers = request.getSeatNumbers().stream()
                .distinct()
                .collect(Collectors.toList());

        List<ShowSeat> seatsToBook = showSeatRepository.findByShowIdAndSeatNumbers(
                request.getShowId(), uniqueSeatNumbers
        );

        User currentUser = getCurrentUser();

        // Verify all seats are locked by current user
        for (ShowSeat seat : seatsToBook) {
            if (seat.getStatus() != SeatStatus.LOCKED ||
                    seat.getLockedByUser() == null ||
                    !seat.getLockedByUser().getId().equals(currentUser.getId())) {

                logger.error("Invalid seat selection for seat: {}, status: {}, locked by: {}",
                        seat.getSeat().getSeatNumber(),
                        seat.getStatus(),
                        seat.getLockedByUser() != null ? seat.getLockedByUser().getEmail() : "null");
                throw new RuntimeException("Invalid seat selection for seat: " + seat.getSeat().getSeatNumber());
            }
        }

        // Create booking
        Booking booking = new Booking();
        booking.setBookingId(generateBookingId());
        booking.setUser(currentUser);
        booking.setShow(seatsToBook.get(0).getShow());
        booking.setBookingTime(LocalDateTime.now());
        booking.setStatus(BookingStatus.CONFIRMED);

        double totalAmount = 0;
        for (ShowSeat seat : seatsToBook) {
            seat.setStatus(SeatStatus.BOOKED);
            seat.setBooking(booking);
            seat.setLockedByUser(null);
            seat.setLockedAt(null);
            seat.setExpiresAt(null);
            totalAmount += seat.getSeat().getPrice();
        }

        booking.setTotalAmount(totalAmount);
        booking.setSeats(seatsToBook);

        booking = bookingRepository.save(booking);
        showSeatRepository.saveAll(seatsToBook);

        logger.info("Successfully created booking: {} for {} seats with total amount: {}",
                booking.getBookingId(), seatsToBook.size(), totalAmount);

        // Broadcast update via WebSocket
        broadcastSeatUpdate(request.getShowId(), uniqueSeatNumbers, SeatStatus.BOOKED);

        BookingResponse response = new BookingResponse();
        response.setBookingId(booking.getBookingId());
        response.setSuccess(true);
        response.setTotalAmount(totalAmount);

        return response;
    }

    private void broadcastSeatUpdate(Long showId, List<String> seatNumbers, SeatStatus status) {
        try {
            SeatUpdateMessage message = new SeatUpdateMessage();
            message.setShowId(showId);
            message.setSeatNumbers(seatNumbers);
            message.setStatus(status.toString());
            message.setTimestamp(LocalDateTime.now());

            messagingTemplate.convertAndSend("/topic/seat-updates/" + showId, message);
            logger.debug("Broadcasted seat update for show {} with {} seats", showId, seatNumbers.size());
        } catch (Exception e) {
            logger.warn("Failed to broadcast seat update: {}", e.getMessage());
        }
    }
    // Add this method to your SeatService.java

    // Replace the createMissingSeats method in your SeatService.java with this:

    @Transactional
    public int createMissingSeats(Long showId, List<String> missingSeatNumbers) {
        try {
            // Get the show
            Show show = showRepository.findById(showId)
                    .orElseThrow(() -> new RuntimeException("Show not found with id: " + showId));

            int createdCount = 0;

            for (String seatNumber : missingSeatNumbers) {
                try {
                    // CHANGE THIS LINE:
// Seat seat = seatRepository.findBySeatNumber(seatNumber);

// TO THIS:
                    Seat seat = seatRepository.findBySeatNumberAndTheaterId(seatNumber, show.getTheater().getId());
                    if (seat == null) {
                        // Create new seat if it doesn't exist
                        seat = new Seat();
                        seat.setSeatNumber(seatNumber);
                        seat.setTheater(show.getTheater()); // Assuming show has theater

                        // Parse row and position from seat number
                        String row = seatNumber.substring(0, 1);
                        seat.setRowLetter(row);

                        try {
                            Integer position = Integer.parseInt(seatNumber.substring(1));
                            seat.setSeatPosition(position);
                        } catch (NumberFormatException e) {
                            seat.setSeatPosition(1); // Default position
                        }

                        // Set category and price based on row (FIXED: using Double instead of BigDecimal)
                        switch (row) {
                            case "A":
                                seat.setCategory("Royal Recliner");
                                seat.setPrice(630.0); // Double, not BigDecimal
                                break;
                            case "B": case "C": case "D":
                                seat.setCategory("Royal");
                                seat.setPrice(380.0); // Double, not BigDecimal
                                break;
                            case "E": case "F": case "G": case "H": case "I":
                                seat.setCategory("Club");
                                seat.setPrice(350.0); // Double, not BigDecimal
                                break;
                            default:
                                seat.setCategory("Executive");
                                seat.setPrice(330.0); // Double, not BigDecimal
                                break;
                        }

                        seat = seatRepository.save(seat);
                    }

                    // Create ShowSeat (REMOVED price setting since ShowSeat doesn't have price field)
                    ShowSeat showSeat = new ShowSeat();
                    showSeat.setShow(show);
                    showSeat.setSeat(seat);
                    showSeat.setStatus(SeatStatus.AVAILABLE);
                    // Note: ShowSeat doesn't store price directly - price comes from Seat entity

                    showSeatRepository.save(showSeat);
                    createdCount++;

                } catch (Exception e) {
                    logger.error("Failed to create seat " + seatNumber + ": " + e.getMessage());
                }
            }

            return createdCount;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create missing seats: " + e.getMessage());
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    private String generateBookingId() {
        return "BK" + System.currentTimeMillis();
    }

    // WebSocket message class
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