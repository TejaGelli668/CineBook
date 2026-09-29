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
    private static final int MAX_HELD_SEATS = 10;

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

        // One customer can't hold a whole show: at most MAX_HELD_SEATS at a time, across all shows
        // (seats in this request that they already hold aren't counted twice)
        long heldElsewhere = showSeatRepository.findActiveHoldsByUser(currentUser.getId(), LocalDateTime.now()).stream()
                .filter(ss -> !(ss.getShow().getId().equals(request.getShowId())
                        && uniqueSeatNumbers.contains(ss.getSeat().getSeatNumber())))
                .count();
        if (heldElsewhere + uniqueSeatNumbers.size() > MAX_HELD_SEATS) {
            throw new RuntimeException("You can hold up to " + MAX_HELD_SEATS + " seats at a time."
                    + (heldElsewhere > 0 ? " Release the seats you're holding first." : ""));
        }

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

    @Autowired
    private PricingService pricingService;

    @Autowired
    private StripeService stripeService;

    @Autowired
    private BookingFoodItemRepository bookingFoodItemRepository;

    /**
     * Turns a paid order into a booking. The payment is checked with Stripe first:
     * it must have succeeded, belong to this customer, cover exactly these seats and
     * snacks, and be for at least the server-calculated total. Repeating the call with
     * the same payment returns the same booking instead of booking twice.
     */
    @Transactional
    public BookingResponse bookSeats(BookingRequest request) {
        return bookSeatsFor(getCurrentUser(), request);
    }

    /**
     * Same as {@link #bookSeats} for a known customer: used by the Stripe webhook,
     * which books on the customer's behalf when their browser didn't finish.
     * Callers should hold {@link BookingLocks} for the payment so the browser and
     * the webhook can't book the same payment at once.
     */
    @Transactional
    public BookingResponse bookSeatsFor(User currentUser, BookingRequest request) {
        logger.info("Booking seats {} for show {} (payment {})",
                request.getSeatNumbers(), request.getShowId(), request.getPaymentIntentId());

        // Same payment again (e.g. a retry after a network blip): hand back the existing booking
        if (request.getPaymentIntentId() != null) {
            Optional<Booking> existing = bookingRepository.findByPaymentId(request.getPaymentIntentId());
            if (existing.isPresent()) {
                Booking b = existing.get();
                if (!b.getUser().getId().equals(currentUser.getId())) {
                    throw new RuntimeException("This payment belongs to another booking");
                }
                return toResponse(b);
            }
        }

        PricingService.Quote quote = pricingService.quote(request.getShowId(), request.getSeatNumbers(), request.getFoodItems());
        String seatsKey = PricingService.seatsKey(request.getSeatNumbers());
        String foodKey = PricingService.foodKey(request.getFoodItems());
        stripeService.verifyBookingPayment(request.getPaymentIntentId(), currentUser.getId(),
                request.getShowId(), seatsKey, foodKey, quote.totalPaise());

        // The payment is real. Seats must still be ours (held) or free; if someone else got
        // them meanwhile, give the money back rather than keep a payment with no booking.
        // Seats already booked under this same payment mean another path (browser or
        // webhook) finished first: hand that booking back, never refund it
        for (ShowSeat seat : quote.showSeats) {
            Booking owner = seat.getBooking();
            if (seat.getStatus() == SeatStatus.BOOKED && owner != null
                    && request.getPaymentIntentId() != null && request.getPaymentIntentId().equals(owner.getPaymentId())) {
                return toResponse(owner);
            }
        }

        List<String> lost = new ArrayList<>();
        for (ShowSeat seat : quote.showSeats) {
            boolean heldByMe = seat.getStatus() == SeatStatus.LOCKED && seat.getLockedByUser() != null
                    && seat.getLockedByUser().getId().equals(currentUser.getId());
            boolean free = seat.getStatus() == SeatStatus.AVAILABLE
                    || (seat.getStatus() == SeatStatus.LOCKED && seat.getExpiresAt() != null
                        && seat.getExpiresAt().isBefore(LocalDateTime.now()));
            if (!heldByMe && !free) lost.add(seat.getSeat().getSeatNumber());
        }
        if (!lost.isEmpty()) {
            String msg = "Seat(s) " + String.join(", ", lost) + " were taken before your booking completed.";
            try {
                stripeService.refund(request.getPaymentIntentId(), null, "seats_unavailable");
                msg += " Your payment has been refunded in full.";
            } catch (Exception e) {
                logger.error("Refund failed for {}: {}", request.getPaymentIntentId(), e.getMessage());
                msg += " We couldn't refund automatically; contact the cinema with reference " + request.getPaymentIntentId() + ".";
            }
            throw new RuntimeException(msg);
        }

        Booking booking = new Booking();
        booking.setBookingId(generateBookingId());
        booking.setUser(currentUser);
        booking.setShow(quote.show);
        booking.setBookingTime(LocalDateTime.now());
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPaymentId(request.getPaymentIntentId());
        booking.setPaymentMethod("stripe");
        booking.setSeatNumbers(seatsKey);
        booking.setTicketTotal(BigDecimal.valueOf(quote.ticketTotal));
        booking.setFoodTotal(BigDecimal.valueOf(quote.foodTotal));
        booking.setConvenienceFee(BigDecimal.valueOf(quote.fee));
        booking.setGrandTotal(BigDecimal.valueOf(quote.total));
        booking.setTotalAmount((double) quote.total);

        for (ShowSeat seat : quote.showSeats) {
            seat.setStatus(SeatStatus.BOOKED);
            seat.setBooking(booking);
            seat.setLockedByUser(null);
            seat.setLockedAt(null);
            seat.setExpiresAt(null);
        }
        booking.setSeats(quote.showSeats);
        booking = bookingRepository.save(booking);
        showSeatRepository.saveAll(quote.showSeats);

        List<BookingFoodItem> foodItems = new ArrayList<>();
        for (PricingService.FoodLine line : quote.foodLines) {
            BookingFoodItem bfi = new BookingFoodItem();
            bfi.setBooking(booking);
            bfi.setFoodItem(line.item);
            bfi.setQuantity(line.quantity);
            bfi.setUnitPrice(BigDecimal.valueOf(line.unitPrice));
            bfi.setTotalPrice(BigDecimal.valueOf(line.unitPrice * line.quantity));
            bfi.setCreatedAt(LocalDateTime.now());
            foodItems.add(bfi);
        }
        if (!foodItems.isEmpty()) {
            bookingFoodItemRepository.saveAll(foodItems);
            booking.setFoodItems(foodItems);
        }

        logger.info("Booking {} confirmed: {} seats, INR {} paid via {}",
                booking.getBookingId(), quote.showSeats.size(), quote.total, request.getPaymentIntentId());
        broadcastSeatUpdate(request.getShowId(), quote.seatNumbers, SeatStatus.BOOKED);
        return toResponse(booking);
    }

    private BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setBookingId(booking.getBookingId());
        response.setSuccess(true);
        response.setTotalAmount(booking.getTotalAmount());
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

    // Add this method to your SeatService.java:

    @Transactional
    public SeatLockResponse extendSeatLocks(SeatLockRequest request) {
        logger.info("Extending locks for seats: {} for show: {}", request.getSeatNumbers(), request.getShowId());

        List<String> uniqueSeatNumbers = request.getSeatNumbers().stream()
                .distinct()
                .collect(Collectors.toList());

        List<ShowSeat> seatsToExtend = showSeatRepository.findByShowIdAndSeatNumbers(
                request.getShowId(), uniqueSeatNumbers
        );

        User currentUser = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime newExpiresAt = now.plusMinutes(LOCK_DURATION_MINUTES); // Extend by another 10 minutes

        int extendedCount = 0;
        for (ShowSeat seat : seatsToExtend) {
            if (seat.getStatus() == SeatStatus.LOCKED &&
                    seat.getLockedByUser() != null &&
                    seat.getLockedByUser().getId().equals(currentUser.getId())) {

                seat.setExpiresAt(newExpiresAt);
                extendedCount++;
                logger.debug("Extended lock for seat: {}", seat.getSeat().getSeatNumber());
            }
        }

        if (extendedCount > 0) {
            showSeatRepository.saveAll(seatsToExtend);
            logger.info("Successfully extended locks for {} seats until {}", extendedCount, newExpiresAt);
        }

        SeatLockResponse response = new SeatLockResponse();
        response.setSuccess(true);
        response.setLockedSeats(uniqueSeatNumbers);
        response.setExpiresAt(newExpiresAt);

        return response;
    }

// Add this endpoint to your SeatController.java:



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