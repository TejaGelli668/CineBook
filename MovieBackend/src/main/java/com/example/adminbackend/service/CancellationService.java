package com.example.adminbackend.service;

import com.example.adminbackend.entity.Booking;
import com.example.adminbackend.entity.BookingStatus;
import com.example.adminbackend.entity.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * The refund policy, in one place for the website and the assistant:
 * full refund until 2 hours before the show, half after that, none once it starts.
 */
@Service
public class CancellationService {

    private final BookingService bookingService;
    private final StripeService stripeService;

    public CancellationService(BookingService bookingService, StripeService stripeService) {
        this.bookingService = bookingService;
        this.stripeService = stripeService;
    }

    /** Why a booking can't be cancelled, with the HTTP status that fits. */
    public static class CancelException extends RuntimeException {
        public final int status;

        public CancelException(int status, String message) {
            super(message);
            this.status = status;
        }
    }

    /** What cancelling would refund right now. */
    public record Preview(Booking booking, int percent, double paid, double refund) {}

    public record Outcome(String bookingId, int percent, double refunded, String message) {}

    public Preview preview(Long bookingId, User user) {
        Booking b = bookingService.getBookingById(bookingId)
                .orElseThrow(() -> new CancelException(404, "Booking not found"));
        if (b.getUser() == null || user == null || !b.getUser().getId().equals(user.getId())) {
            throw new CancelException(403, "That booking belongs to another account");
        }
        if (BookingStatus.CANCELLED.equals(b.getStatus())) {
            throw new CancelException(400, "This booking is already cancelled");
        }
        LocalDateTime start = b.getShow() != null ? b.getShow().getShowTime() : null;
        LocalDateTime now = LocalDateTime.now();
        if (start != null && !now.isBefore(start)) {
            throw new CancelException(400, "This show has already started, so it can't be cancelled.");
        }
        int percent = (start == null || now.isBefore(start.minusHours(2))) ? 100 : 50;
        double paid = b.getGrandTotal() != null ? b.getGrandTotal().doubleValue()
                : (b.getTotalAmount() != null ? b.getTotalAmount() : 0);
        return new Preview(b, percent, paid, Math.round(paid * percent) / 100.0);
    }

    /** Refunds through Stripe first; the booking is only cancelled once the refund went through. */
    public Outcome cancel(Long bookingId, User user) {
        Preview p = preview(bookingId, user);
        long refundPaise = Math.round(p.paid() * 100 * p.percent() / 100.0);
        long refunded = 0;
        String paymentId = p.booking().getPaymentId();
        if (paymentId != null && paymentId.startsWith("pi_") && refundPaise > 0) {
            try {
                refunded = stripeService.refund(paymentId, refundPaise,
                        p.percent() == 100 ? "cancelled_in_time" : "cancelled_late");
            } catch (Exception e) {
                throw new CancelException(502, "The refund couldn't be issued, so the booking is still active. Try again shortly.");
            }
        }
        Booking cancelled = bookingService.cancelBooking(bookingId);
        String message = refunded > 0
                ? String.format("Booking cancelled. ₹%.0f (%d%%) is on its way back to your card.", refunded / 100.0, p.percent())
                : "Booking cancelled.";
        return new Outcome(cancelled.getBookingId(), p.percent(), refunded / 100.0, message);
    }
}
