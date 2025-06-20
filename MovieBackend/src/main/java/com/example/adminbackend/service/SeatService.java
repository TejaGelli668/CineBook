package com.example.adminbackend.service;

import com.example.adminbackend.dto.*;
import com.example.adminbackend.entity.*;
import com.example.adminbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SeatService {

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private static final int LOCK_DURATION_MINUTES = 10;

    public ShowSeatsDTO getShowSeats(Long showId) {
        List<ShowSeat> showSeats = showSeatRepository.findByShowId(showId);

        Map<String, SeatDTO> seatMap = new HashMap<>();
        for (ShowSeat showSeat : showSeats) {
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

        ShowSeatsDTO response = new ShowSeatsDTO();
        response.setShowId(showId);
        response.setSeats(seatMap);

        return response;
    }

    @Transactional
    public SeatLockResponse lockSeats(SeatLockRequest request) {
        // Release any expired locks first
        showSeatRepository.releaseExpiredSeats(LocalDateTime.now());

        List<ShowSeat> seatsToLock = showSeatRepository.findByShowIdAndSeatNumbers(
                request.getShowId(), request.getSeatNumbers()
        );

        // Check if all seats are available
        List<String> unavailableSeats = new ArrayList<>();
        for (ShowSeat seat : seatsToLock) {
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                unavailableSeats.add(seat.getSeat().getSeatNumber());
            }
        }

        if (!unavailableSeats.isEmpty()) {
            throw new RuntimeException("Seats not available: " + String.join(", ", unavailableSeats));
        }

        // Lock the seats
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(LOCK_DURATION_MINUTES);
        User currentUser = getCurrentUser();

        for (ShowSeat seat : seatsToLock) {
            seat.setStatus(SeatStatus.LOCKED);
            seat.setLockedByUser(currentUser);
            seat.setLockedAt(now);
            seat.setExpiresAt(expiresAt);
        }

        showSeatRepository.saveAll(seatsToLock);

        // Broadcast update via WebSocket
        broadcastSeatUpdate(request.getShowId(), request.getSeatNumbers(), SeatStatus.LOCKED);

        SeatLockResponse response = new SeatLockResponse();
        response.setSuccess(true);
        response.setLockedSeats(request.getSeatNumbers());
        response.setExpiresAt(expiresAt);

        return response;
    }

    @Transactional
    public void unlockSeats(SeatUnlockRequest request) {
        List<ShowSeat> seatsToUnlock = showSeatRepository.findByShowIdAndSeatNumbers(
                request.getShowId(), request.getSeatNumbers()
        );

        User currentUser = getCurrentUser();

        for (ShowSeat seat : seatsToUnlock) {
            if (seat.getStatus() == SeatStatus.LOCKED &&
                    seat.getLockedByUser().getId().equals(currentUser.getId())) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setLockedByUser(null);
                seat.setLockedAt(null);
                seat.setExpiresAt(null);
            }
        }

        showSeatRepository.saveAll(seatsToUnlock);

        // Broadcast update via WebSocket
        broadcastSeatUpdate(request.getShowId(), request.getSeatNumbers(), SeatStatus.AVAILABLE);
    }

    @Transactional
    public BookingResponse bookSeats(BookingRequest request) {
        List<ShowSeat> seatsToBook = showSeatRepository.findByShowIdAndSeatNumbers(
                request.getShowId(), request.getSeatNumbers()
        );

        User currentUser = getCurrentUser();

        // Verify all seats are locked by current user
        for (ShowSeat seat : seatsToBook) {
            if (seat.getStatus() != SeatStatus.LOCKED ||
                    !seat.getLockedByUser().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Invalid seat selection");
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
            totalAmount += seat.getSeat().getPrice();
        }

        booking.setTotalAmount(totalAmount);
        booking.setSeats(seatsToBook);

        bookingRepository.save(booking);
        showSeatRepository.saveAll(seatsToBook);

        // Broadcast update via WebSocket
        broadcastSeatUpdate(request.getShowId(), request.getSeatNumbers(), SeatStatus.BOOKED);

        BookingResponse response = new BookingResponse();
        response.setBookingId(booking.getBookingId());
        response.setSuccess(true);
        response.setTotalAmount(totalAmount);

        return response;
    }

    private void broadcastSeatUpdate(Long showId, List<String> seatNumbers, SeatStatus status) {
        SeatUpdateMessage message = new SeatUpdateMessage();
        message.setShowId(showId);
        message.setSeatNumbers(seatNumbers);
        message.setStatus(status.toString());
        message.setTimestamp(LocalDateTime.now());

        messagingTemplate.convertAndSend("/topic/seat-updates/" + showId, message);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String generateBookingId() {
        return "BK" + System.currentTimeMillis();
    }
}