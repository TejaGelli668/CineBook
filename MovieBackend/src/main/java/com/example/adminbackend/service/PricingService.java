package com.example.adminbackend.service;

import com.example.adminbackend.dto.BookingRequest;
import com.example.adminbackend.entity.FoodItem;
import com.example.adminbackend.entity.Show;
import com.example.adminbackend.entity.ShowSeat;
import com.example.adminbackend.repository.FoodItemRepository;
import com.example.adminbackend.repository.ShowSeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * The single source of truth for what a booking costs. Prices come from the
 * database (seat category prices, canteen prices), never from the browser.
 */
@Service
public class PricingService {

    /** Convenience fee as a fraction of tickets + food, rounded to the rupee. */
    private static final double FEE_RATE = 0.02;
    private static final int MAX_SEATS = 10;
    private static final int MAX_ITEM_QUANTITY = 20;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    public Quote quote(Long showId, List<String> seatNumbers, List<BookingRequest.FoodItemRequest> food) {
        if (showId == null) throw new PricingException("Choose a show first");
        List<String> seats = normaliseSeats(seatNumbers);
        if (seats.isEmpty()) throw new PricingException("Choose at least one seat");
        if (seats.size() > MAX_SEATS) throw new PricingException("You can book up to " + MAX_SEATS + " seats at a time");

        List<ShowSeat> showSeats = showSeatRepository.findByShowIdAndSeatNumbers(showId, seats);
        if (showSeats.size() != seats.size()) throw new PricingException("Some of those seats don't exist for this show");

        Quote q = new Quote();
        q.showId = showId;
        q.seatNumbers = seats;
        q.showSeats = showSeats;
        q.show = showSeats.get(0).getShow();
        for (ShowSeat s : showSeats) {
            q.ticketTotal += s.getSeat().getPrice() == null ? 0 : s.getSeat().getPrice();
        }

        Long theaterId = q.show.getTheater() != null ? q.show.getTheater().getId() : null;
        for (Map.Entry<Long, Integer> e : normaliseFood(food).entrySet()) {
            FoodItem item = foodItemRepository.findById(e.getKey())
                    .orElseThrow(() -> new PricingException("A snack in your order is no longer on the menu"));
            if (!Boolean.TRUE.equals(item.getIsAvailable())) {
                throw new PricingException(item.getName() + " is sold out");
            }
            if (item.getTheaterId() != null && !item.getTheaterId().equals(theaterId)) {
                throw new PricingException(item.getName() + " isn't sold at this cinema");
            }
            FoodLine line = new FoodLine();
            line.item = item;
            line.quantity = e.getValue();
            line.unitPrice = item.getPrice() == null ? 0 : item.getPrice();
            q.foodLines.add(line);
            q.foodTotal += line.unitPrice * line.quantity;
        }

        q.fee = Math.round((q.ticketTotal + q.foodTotal) * FEE_RATE);
        q.total = Math.round(q.ticketTotal + q.foodTotal + q.fee);
        return q;
    }

    /** Stable text form of the order, stored on the Stripe payment so the booking can be checked against it. */
    public static String seatsKey(List<String> seats) {
        return String.join(",", normaliseSeats(seats));
    }

    public static String foodKey(List<BookingRequest.FoodItemRequest> food) {
        return normaliseFood(food).entrySet().stream()
                .map(e -> e.getKey() + "x" + e.getValue())
                .collect(Collectors.joining(","));
    }

    private static List<String> normaliseSeats(List<String> seats) {
        if (seats == null) return List.of();
        return seats.stream()
                .filter(s -> s != null && !s.isBlank())
                .map(s -> s.trim().toUpperCase())
                .distinct()
                .sorted(Comparator.naturalOrder())
                .collect(Collectors.toList());
    }

    private static Map<Long, Integer> normaliseFood(List<BookingRequest.FoodItemRequest> food) {
        Map<Long, Integer> merged = new TreeMap<>();
        if (food == null) return merged;
        for (BookingRequest.FoodItemRequest f : food) {
            if (f == null || f.getFoodItemId() == null || f.getQuantity() == null || f.getQuantity() <= 0) continue;
            merged.merge(f.getFoodItemId(), f.getQuantity(), Integer::sum);
        }
        for (Map.Entry<Long, Integer> e : merged.entrySet()) {
            if (e.getValue() > MAX_ITEM_QUANTITY) {
                throw new PricingException("You can order up to " + MAX_ITEM_QUANTITY + " of each snack");
            }
        }
        return merged;
    }

    public static class Quote {
        public Long showId;
        public Show show;
        public List<String> seatNumbers;
        public List<ShowSeat> showSeats;
        public List<FoodLine> foodLines = new ArrayList<>();
        public double ticketTotal;
        public double foodTotal;
        public long fee;
        public long total; // rupees

        public long totalPaise() {
            return total * 100;
        }
    }

    public static class FoodLine {
        public FoodItem item;
        public int quantity;
        public double unitPrice;
    }

    /** A problem with the order the customer can fix (shown to them as-is). */
    public static class PricingException extends RuntimeException {
        public PricingException(String message) {
            super(message);
        }
    }
}
