//package com.example.adminbackend.service;
//
//import com.example.adminbackend.dto.*;
//import com.example.adminbackend.entity.*;
//import com.example.adminbackend.repository.*;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.Arrays;
//import java.util.List;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
//@Service
//@Transactional
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
//    @Autowired
//    private BookingFoodItemRepository bookingFoodItemRepository;
//
//    @Autowired
//    private FoodItemRepository foodItemRepository;
//
//    @Autowired
//    private ShowRepository showRepository;
//
//    @Autowired
//    private SeatService seatService;
//
//    @Autowired
//    private SimpMessagingTemplate messagingTemplate; // For WebSocket updates
//
//    // CREATE BOOKING WITH FOOD ITEMS
//    public BookingResponse createBookingWithFood(BookingRequest request) {
//        try {
//            logger.info("Creating booking with food items for show: {}", request.getShowId());
//
//            // 1. Validate show and seats
//            Show show = showRepository.findById(request.getShowId())
//                    .orElseThrow(() -> new RuntimeException("Show not found"));
//
//            // 2. Create booking entity
//            Booking booking = new Booking();
//            booking.setShow(show);
//            booking.setSeatNumbers(String.join(",", request.getSeatNumbers()));
//
//            // 3. Calculate ticket total
//            BigDecimal ticketTotal = calculateTicketTotal(show, request.getSeatNumbers());
//            booking.setTicketTotal(ticketTotal);
//
//            // 4. Calculate food total
//            BigDecimal foodTotal = BigDecimal.ZERO;
//            if (request.getFoodItems() != null && !request.getFoodItems().isEmpty()) {
//                foodTotal = calculateFoodTotal(request.getFoodItems());
//            }
//            booking.setFoodTotal(foodTotal);
//
//            // 5. Calculate totals using the entity method
//            booking.calculateTotals();
//            booking.setStatus(BookingStatus.CONFIRMED);
//
//            // 6. Generate booking ID
//            booking.setBookingId("BKG" + System.currentTimeMillis());
//
//            // 7. Save booking
//            booking = bookingRepository.save(booking);
//
//            // 8. Save food items if present
//            if (request.getFoodItems() != null && !request.getFoodItems().isEmpty()) {
//                saveFoodItems(booking, request.getFoodItems());
//            }
//
//            // 9. FIXED: Update seat status using the correct method signature
//            seatService.bookSeats(request);
//
//            // 10. Return response
//            return createBookingResponse(booking);
//
//        } catch (Exception e) {
//            logger.error("Error creating booking: {}", e.getMessage(), e);
//            throw new RuntimeException("Failed to create booking: " + e.getMessage());
//        }
//    }
//
//    // CALCULATE TICKET TOTAL
//    private BigDecimal calculateTicketTotal(Show show, List<String> seatNumbers) {
//        // You should implement this based on your show/theater pricing logic
//        // For now, using a default price - replace with your actual pricing logic
//        BigDecimal basePrice = new BigDecimal("250.00"); // Default ticket price
//        return basePrice.multiply(new BigDecimal(seatNumbers.size()));
//    }
//
//    // CALCULATE FOOD TOTAL
//    private BigDecimal calculateFoodTotal(List<BookingRequest.FoodItemRequest> foodItemRequests) {
//        BigDecimal total = BigDecimal.ZERO;
//
//        for (BookingRequest.FoodItemRequest request : foodItemRequests) {
//            FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
//                    .orElseThrow(() -> new RuntimeException("Food item not found: " + request.getFoodItemId()));
//
//            BigDecimal itemTotal = BigDecimal.valueOf(foodItem.getPrice()).multiply(new BigDecimal(request.getQuantity()));
//            total = total.add(itemTotal);
//        }
//
//        return total;
//    }
//
//    // SAVE FOOD ITEMS
//    private void saveFoodItems(Booking booking, List<BookingRequest.FoodItemRequest> foodItemRequests) {
//        for (BookingRequest.FoodItemRequest request : foodItemRequests) {
//            FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
//                    .orElseThrow(() -> new RuntimeException("Food item not found: " + request.getFoodItemId()));
//
//            BookingFoodItem bookingFoodItem = new BookingFoodItem();
//            bookingFoodItem.setBooking(booking);
//            bookingFoodItem.setFoodItem(foodItem);
//            bookingFoodItem.setQuantity(request.getQuantity());
//            bookingFoodItem.setUnitPrice(BigDecimal.valueOf(foodItem.getPrice()));
//            bookingFoodItem.setTotalPrice(BigDecimal.valueOf(foodItem.getPrice()).multiply(new BigDecimal(request.getQuantity())));
//
//            bookingFoodItemRepository.save(bookingFoodItem);
//        }
//    }
//
//    // CREATE BOOKING RESPONSE
//    private BookingResponse createBookingResponse(Booking booking) {
//        BookingResponse response = new BookingResponse();
//        response.setBookingId(booking.getBookingId());
//        response.setSuccess(true);
//        response.setTotalAmount(booking.getGrandTotalAsDouble());
//        response.setMessage("Booking created successfully");
//
//        // Set enhanced properties
//        response.setId(booking.getId());
//        response.setTicketTotal(booking.getTicketTotalAsDouble());
//        response.setFoodTotal(booking.getFoodTotalAsDouble());
//        response.setConvenienceFee(booking.getConvenienceFeeAsDouble());
//        response.setGrandTotal(booking.getGrandTotalAsDouble());
//        response.setStatus(booking.getStatus().name());
//        response.setCreatedAt(booking.getBookingTime());
//
//        // Set seat numbers
//        response.setSeatNumbers(Arrays.asList(booking.getSeatNumbers().split(",")));
//
//        return response;
//    }
//
//    // GET BOOKING WITH FOOD ITEMS
//    public BookingResponse getBookingWithFoodItems(Long bookingId) {
//        Booking booking = bookingRepository.findById(bookingId)
//                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
//
//        List<BookingFoodItem> foodItems = bookingFoodItemRepository.findByBookingId(bookingId);
//
//        return createBookingDetailsResponse(booking, foodItems);
//    }
//
//    // CREATE BOOKING DETAILS RESPONSE
//    private BookingResponse createBookingDetailsResponse(Booking booking, List<BookingFoodItem> foodItems) {
//        BookingResponse response = new BookingResponse();
//        response.setId(booking.getId());
//        response.setBookingId(booking.getBookingId());
//        response.setSuccess(true);
//        response.setMessage("Booking details retrieved successfully");
//        response.setStatus(booking.getStatus().name());
//        response.setCreatedAt(booking.getBookingTime());
//
//        // Set financial details
//        response.setTicketTotal(booking.getTicketTotalAsDouble());
//        response.setFoodTotal(booking.getFoodTotalAsDouble());
//        response.setConvenienceFee(booking.getConvenienceFeeAsDouble());
//        response.setGrandTotal(booking.getGrandTotalAsDouble());
//        response.setTotalAmount(booking.getGrandTotalAsDouble());
//
//        // Set seat numbers
//        if (booking.getSeatNumbers() != null) {
//            response.setSeatNumbers(Arrays.asList(booking.getSeatNumbers().split(",")));
//        }
//
//        // Convert food items
//        List<BookingResponse.BookingFoodItemResponse> foodItemResponses = foodItems.stream()
//                .map(this::convertToFoodItemResponse)
//                .collect(Collectors.toList());
//        response.setFoodItems(foodItemResponses);
//
//        // Set show details
//        if (booking.getShow() != null) {
//            BookingResponse.ShowDetailsResponse showDetails = new BookingResponse.ShowDetailsResponse();
//            showDetails.setId(booking.getShow().getId());
//            showDetails.setMovieTitle(booking.getMovieTitle());
//            showDetails.setTheaterName(booking.getTheaterName());
//            showDetails.setShowTime(booking.getShowTime());
//            showDetails.setShowDate(booking.getShowDate());
//            response.setShow(showDetails);
//        }
//
//        return response;
//    }
//
//    // CONVERT TO FOOD ITEM RESPONSE
//    private BookingResponse.BookingFoodItemResponse convertToFoodItemResponse(BookingFoodItem bookingFoodItem) {
//        BookingResponse.BookingFoodItemResponse response = new BookingResponse.BookingFoodItemResponse();
//        response.setFoodItemId(bookingFoodItem.getFoodItem().getId());
//        response.setName(bookingFoodItem.getFoodItem().getName());
//        response.setCategory(bookingFoodItem.getFoodItem().getCategory().name());
//        response.setImageUrl(bookingFoodItem.getFoodItem().getImageUrl());
//        response.setQuantity(bookingFoodItem.getQuantity());
//        response.setUnitPrice(bookingFoodItem.getUnitPrice().doubleValue());
//        response.setTotalPrice(bookingFoodItem.getTotalPrice().doubleValue());
//        return response;
//    }
//
//    // VALIDATE FOOD ITEMS
//    public void validateFoodItems(List<BookingRequest.FoodItemRequest> foodItemRequests) {
//        for (BookingRequest.FoodItemRequest request : foodItemRequests) {
//            FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
//                    .orElseThrow(() -> new RuntimeException("Food item not found: " + request.getFoodItemId()));
//
//            if (!foodItem.getIsAvailable()) {
//                throw new RuntimeException("Food item is not available: " + foodItem.getName());
//            }
//
//            if (request.getQuantity() <= 0) {
//                throw new RuntimeException("Invalid quantity for food item: " + foodItem.getName());
//            }
//        }
//    }
//
//    // EXISTING METHODS (all your existing booking management methods)
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
//            // Get all seats associated with this booking
//            List<ShowSeat> bookedSeats = booking.getSeats();
//            if (bookedSeats == null || bookedSeats.isEmpty()) {
//                // Try to find seats by booking ID if not loaded
//                bookedSeats = showSeatRepository.findByBookingId(bookingId);
//            }
//
//            // Release all seats associated with this booking
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
//
//                // Broadcast seat updates via WebSocket
//                try {
//                    List<String> seatNumbers = bookedSeats.stream()
//                            .map(seat -> seat.getSeat() != null ? seat.getSeat().getSeatNumber() : "Unknown")
//                            .filter(seatNumber -> !"Unknown".equals(seatNumber))
//                            .collect(Collectors.toList());
//
//                    if (!seatNumbers.isEmpty() && booking.getShow() != null) {
//                        broadcastSeatUpdate(booking.getShow().getId(), seatNumbers, SeatStatus.AVAILABLE);
//                    }
//                } catch (Exception e) {
//                    logger.warn("Failed to broadcast seat update: {}", e.getMessage());
//                }
//            } else {
//                logger.warn("No seats found for booking {}", bookingId);
//            }
//
//            // Update booking status to cancelled
//            booking.setStatus(BookingStatus.CANCELLED);
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
//    // Method to release expired locked seats (called by scheduler)
//    @Transactional
//    public void releaseExpiredSeats() {
//        try {
//            LocalDateTime now = LocalDateTime.now();
//
//            // Use the repository method to release expired seats
//            showSeatRepository.releaseExpiredSeats(now);
//
//            logger.debug("Released expired locked seats at {}", now);
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
//
//    // Helper method to broadcast seat updates via WebSocket
//    private void broadcastSeatUpdate(Long showId, List<String> seatNumbers, SeatStatus status) {
//        try {
//            if (messagingTemplate != null) {
//                SeatUpdateMessage message = new SeatUpdateMessage();
//                message.setShowId(showId);
//                message.setSeatNumbers(seatNumbers);
//                message.setStatus(status.toString());
//                message.setTimestamp(LocalDateTime.now());
//
//                messagingTemplate.convertAndSend("/topic/seat-updates/" + showId, message);
//                logger.debug("Broadcasted seat update for show {} with {} seats", showId, seatNumbers.size());
//            }
//        } catch (Exception e) {
//            logger.warn("Failed to broadcast seat update: {}", e.getMessage());
//        }
//    }
//
//    // Inner class for WebSocket messages
//    public static class SeatUpdateMessage {
//        private Long showId;
//        private List<String> seatNumbers;
//        private String status;
//        private LocalDateTime timestamp;
//
//        // Getters and setters
//        public Long getShowId() { return showId; }
//        public void setShowId(Long showId) { this.showId = showId; }
//
//        public List<String> getSeatNumbers() { return seatNumbers; }
//        public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }
//
//        public String getStatus() { return status; }
//        public void setStatus(String status) { this.status = status; }
//
//        public LocalDateTime getTimestamp() { return timestamp; }
//        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
//    }
//}

package com.example.adminbackend.service;

import com.example.adminbackend.dto.*;
import com.example.adminbackend.entity.*;
import com.example.adminbackend.repository.*;
import com.stripe.model.PaymentIntent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private BookingFoodItemRepository bookingFoodItemRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SeatService seatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired(required = false)
    private StripeService stripeService;

    // ORIGINAL METHOD - for backward compatibility
    public BookingResponse createBookingWithFood(BookingRequest request) {
        try {
            logger.info("Creating booking with food items for show: {}", request.getShowId());

            Show show = showRepository.findById(request.getShowId())
                    .orElseThrow(() -> new RuntimeException("Show not found"));

            Booking booking = new Booking();
            booking.setShow(show);
            booking.setSeatNumbers(String.join(",", request.getSeatNumbers()));

            BigDecimal ticketTotal = calculateTicketTotal(show, request.getSeatNumbers());
            booking.setTicketTotal(ticketTotal);

            BigDecimal foodTotal = BigDecimal.ZERO;
            if (request.getFoodItems() != null && !request.getFoodItems().isEmpty()) {
                foodTotal = calculateFoodTotal(request.getFoodItems());
            }
            booking.setFoodTotal(foodTotal);

            booking.calculateTotals();
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setBookingId("BKG" + System.currentTimeMillis());

            booking = bookingRepository.save(booking);

            if (request.getFoodItems() != null && !request.getFoodItems().isEmpty()) {
                saveFoodItems(booking, request.getFoodItems());
            }

            seatService.bookSeats(request);

            return createBookingResponse(booking);

        } catch (Exception e) {
            logger.error("Error creating booking: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create booking: " + e.getMessage());
        }
    }

    // NEW METHOD - with user authentication and Stripe support
    public BookingResponse createBookingWithFood(BookingRequest request, User currentUser) {
        try {
            logger.info("Creating booking with Stripe payment for show: {} by user: {}",
                    request.getShowId(), currentUser.getEmail());

            if ("stripe".equals(request.getPaymentMethod()) && request.getPaymentIntentId() != null) {
                validateStripePayment(request.getPaymentIntentId(), request.getTotalAmount());
            }

            Show show = showRepository.findById(request.getShowId())
                    .orElseThrow(() -> new RuntimeException("Show not found"));

            Booking booking = new Booking();
            booking.setShow(show);
            booking.setUser(currentUser);
            booking.setSeatNumbers(String.join(",", request.getSeatNumbers()));

            BigDecimal ticketTotal = calculateTicketTotal(show, request.getSeatNumbers());
            booking.setTicketTotal(ticketTotal);

            BigDecimal foodTotal = BigDecimal.ZERO;
            if (request.getFoodItems() != null && !request.getFoodItems().isEmpty()) {
                foodTotal = calculateFoodTotal(request.getFoodItems());
            }
            booking.setFoodTotal(foodTotal);

            booking.calculateTotals();
            booking.setStatus(BookingStatus.CONFIRMED);

            if (request.getPaymentIntentId() != null) {
                booking.setPaymentId(request.getPaymentIntentId());
                booking.setPaymentMethod(request.getPaymentMethod());
            }

            booking.setBookingId("BKG" + System.currentTimeMillis());
            booking = bookingRepository.save(booking);

            if (request.getFoodItems() != null && !request.getFoodItems().isEmpty()) {
                saveFoodItems(booking, request.getFoodItems());
            }

            seatService.bookSeats(request);

            return createBookingResponse(booking);

        } catch (Exception e) {
            logger.error("Error creating booking: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create booking: " + e.getMessage());
        }
    }

    private void validateStripePayment(String paymentIntentId, Double expectedAmount) {
        try {
            if (stripeService == null) {
                throw new RuntimeException("Stripe service is not available");
            }

            PaymentIntent paymentIntent = stripeService.getPaymentIntent(paymentIntentId);

            if (!"succeeded".equals(paymentIntent.getStatus())) {
                throw new RuntimeException("Payment not completed. Status: " + paymentIntent.getStatus());
            }

            Long expectedAmountInPaise = Math.round(expectedAmount * 100);
            if (!paymentIntent.getAmount().equals(expectedAmountInPaise)) {
                throw new RuntimeException("Payment amount mismatch. Expected: " + expectedAmountInPaise +
                        ", Actual: " + paymentIntent.getAmount());
            }

            logger.info("Stripe payment validated successfully: {}", paymentIntentId);

        } catch (Exception e) {
            logger.error("Payment validation failed: {}", e.getMessage());
            throw new RuntimeException("Payment validation failed: " + e.getMessage());
        }
    }

    private BigDecimal calculateTicketTotal(Show show, List<String> seatNumbers) {
        try {
            BigDecimal basePrice = BigDecimal.valueOf(250.00);
            return basePrice.multiply(new BigDecimal(seatNumbers.size()));
        } catch (Exception e) {
            logger.error("Error calculating ticket total: {}", e.getMessage());
            throw new RuntimeException("Failed to calculate ticket total");
        }
    }

    private BigDecimal calculateFoodTotal(List<BookingRequest.FoodItemRequest> foodItemRequests) {
        BigDecimal total = BigDecimal.ZERO;

        for (BookingRequest.FoodItemRequest request : foodItemRequests) {
            FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                    .orElseThrow(() -> new RuntimeException("Food item not found: " + request.getFoodItemId()));

            BigDecimal itemTotal = BigDecimal.valueOf(foodItem.getPrice()).multiply(new BigDecimal(request.getQuantity()));
            total = total.add(itemTotal);
        }

        return total;
    }

    private void saveFoodItems(Booking booking, List<BookingRequest.FoodItemRequest> foodItemRequests) {
        for (BookingRequest.FoodItemRequest request : foodItemRequests) {
            FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                    .orElseThrow(() -> new RuntimeException("Food item not found: " + request.getFoodItemId()));

            BookingFoodItem bookingFoodItem = new BookingFoodItem();
            bookingFoodItem.setBooking(booking);
            bookingFoodItem.setFoodItem(foodItem);
            bookingFoodItem.setQuantity(request.getQuantity());
            bookingFoodItem.setUnitPrice(BigDecimal.valueOf(foodItem.getPrice()));
            bookingFoodItem.setTotalPrice(BigDecimal.valueOf(foodItem.getPrice()).multiply(new BigDecimal(request.getQuantity())));

            bookingFoodItemRepository.save(bookingFoodItem);
        }
    }

    private BookingResponse createBookingResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setBookingId(booking.getBookingId());
        response.setSuccess(true);
        response.setTotalAmount(booking.getGrandTotalAsDouble());
        response.setMessage("Booking created successfully");

        response.setId(booking.getId());
        response.setTicketTotal(booking.getTicketTotalAsDouble());
        response.setFoodTotal(booking.getFoodTotalAsDouble());
        response.setConvenienceFee(booking.getConvenienceFeeAsDouble());
        response.setGrandTotal(booking.getGrandTotalAsDouble());
        response.setStatus(booking.getStatus().name());
        response.setCreatedAt(booking.getBookingTime());

        if (booking.getSeatNumbers() != null) {
            response.setSeatNumbers(Arrays.asList(booking.getSeatNumbers().split(",")));
        }

        return response;
    }

    // All your existing methods remain the same...
    public BookingResponse getBookingWithFoodItems(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        List<BookingFoodItem> foodItems = bookingFoodItemRepository.findByBookingId(bookingId);
        return createBookingDetailsResponse(booking, foodItems);
    }

    private BookingResponse createBookingDetailsResponse(Booking booking, List<BookingFoodItem> foodItems) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setBookingId(booking.getBookingId());
        response.setSuccess(true);
        response.setMessage("Booking details retrieved successfully");
        response.setStatus(booking.getStatus().name());
        response.setCreatedAt(booking.getBookingTime());

        response.setTicketTotal(booking.getTicketTotalAsDouble());
        response.setFoodTotal(booking.getFoodTotalAsDouble());
        response.setConvenienceFee(booking.getConvenienceFeeAsDouble());
        response.setGrandTotal(booking.getGrandTotalAsDouble());
        response.setTotalAmount(booking.getGrandTotalAsDouble());

        if (booking.getSeatNumbers() != null) {
            response.setSeatNumbers(Arrays.asList(booking.getSeatNumbers().split(",")));
        }

        List<BookingResponse.BookingFoodItemResponse> foodItemResponses = foodItems.stream()
                .map(this::convertToFoodItemResponse)
                .collect(Collectors.toList());
        response.setFoodItems(foodItemResponses);

        if (booking.getShow() != null) {
            BookingResponse.ShowDetailsResponse showDetails = new BookingResponse.ShowDetailsResponse();
            showDetails.setId(booking.getShow().getId());
            showDetails.setMovieTitle(booking.getMovieTitle());
            showDetails.setTheaterName(booking.getTheaterName());
            showDetails.setShowTime(booking.getShowTime());
            showDetails.setShowDate(booking.getShowDate());
            response.setShow(showDetails);
        }

        return response;
    }

    private BookingResponse.BookingFoodItemResponse convertToFoodItemResponse(BookingFoodItem bookingFoodItem) {
        BookingResponse.BookingFoodItemResponse response = new BookingResponse.BookingFoodItemResponse();
        response.setFoodItemId(bookingFoodItem.getFoodItem().getId());
        response.setName(bookingFoodItem.getFoodItem().getName());
        response.setCategory(bookingFoodItem.getFoodItem().getCategory().name());
        response.setImageUrl(bookingFoodItem.getFoodItem().getImageUrl());
        response.setQuantity(bookingFoodItem.getQuantity());
        response.setUnitPrice(bookingFoodItem.getUnitPrice().doubleValue());
        response.setTotalPrice(bookingFoodItem.getTotalPrice().doubleValue());
        return response;
    }

    public void validateFoodItems(List<BookingRequest.FoodItemRequest> foodItemRequests) {
        for (BookingRequest.FoodItemRequest request : foodItemRequests) {
            FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                    .orElseThrow(() -> new RuntimeException("Food item not found: " + request.getFoodItemId()));

            if (!foodItem.getIsAvailable()) {
                throw new RuntimeException("Food item is not available: " + foodItem.getName());
            }

            if (request.getQuantity() <= 0) {
                throw new RuntimeException("Invalid quantity for food item: " + foodItem.getName());
            }
        }
    }

    // Keep all your existing methods unchanged...
    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserIdWithDetails(userId);
    }

    public Optional<Booking> getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId) {
        try {
            logger.info("Starting booking cancellation for booking ID: {}", bookingId);

            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
            if (bookingOpt.isEmpty()) {
                throw new RuntimeException("Booking not found with id: " + bookingId);
            }

            Booking booking = bookingOpt.get();

            if (booking.getStatus() == BookingStatus.CANCELLED) {
                logger.warn("Booking {} is already cancelled", bookingId);
                return booking;
            }

            List<ShowSeat> bookedSeats = booking.getSeats();
            if (bookedSeats == null || bookedSeats.isEmpty()) {
                bookedSeats = showSeatRepository.findByBookingId(bookingId);
            }

            if (bookedSeats != null && !bookedSeats.isEmpty()) {
                logger.info("Releasing {} seats for cancelled booking {}", bookedSeats.size(), bookingId);

                for (ShowSeat seat : bookedSeats) {
                    seat.setStatus(SeatStatus.AVAILABLE);
                    seat.setBooking(null);
                    seat.setLockedByUser(null);
                    seat.setLockedAt(null);
                    seat.setExpiresAt(null);
                }

                showSeatRepository.saveAll(bookedSeats);
                logger.info("Successfully released {} seats", bookedSeats.size());

                try {
                    List<String> seatNumbers = bookedSeats.stream()
                            .map(seat -> seat.getSeat() != null ? seat.getSeat().getSeatNumber() : "Unknown")
                            .filter(seatNumber -> !"Unknown".equals(seatNumber))
                            .collect(Collectors.toList());

                    if (!seatNumbers.isEmpty() && booking.getShow() != null) {
                        broadcastSeatUpdate(booking.getShow().getId(), seatNumbers, SeatStatus.AVAILABLE);
                    }
                } catch (Exception e) {
                    logger.warn("Failed to broadcast seat update: {}", e.getMessage());
                }
            }

            booking.setStatus(BookingStatus.CANCELLED);
            Booking savedBooking = bookingRepository.save(booking);
            logger.info("Booking {} successfully cancelled", bookingId);

            return savedBooking;

        } catch (Exception e) {
            logger.error("Error cancelling booking {}: {}", bookingId, e.getMessage(), e);
            throw new RuntimeException("Failed to cancel booking: " + e.getMessage());
        }
    }

    public Booking saveBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    public Optional<Booking> findByBookingId(String bookingId) {
        return bookingRepository.findByBookingId(bookingId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getSimpleBookingsByUserId(Long userId) {
        return bookingRepository.findByUserIdOrderByBookingTimeDesc(userId);
    }

    @Transactional
    public void releaseExpiredSeats() {
        try {
            LocalDateTime now = LocalDateTime.now();
            showSeatRepository.releaseExpiredSeats(now);
            logger.debug("Released expired locked seats at {}", now);
        } catch (Exception e) {
            logger.error("Error releasing expired seats: {}", e.getMessage(), e);
        }
    }

    public List<ShowSeat> getAvailableSeatsForShow(Long showId) {
        return showSeatRepository.findAvailableSeatsForShow(showId);
    }

    public List<ShowSeat> getAllSeatsForShow(Long showId) {
        return showSeatRepository.findByShowId(showId);
    }

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

    public static class SeatUpdateMessage {
        private Long showId;
        private List<String> seatNumbers;
        private String status;
        private LocalDateTime timestamp;

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