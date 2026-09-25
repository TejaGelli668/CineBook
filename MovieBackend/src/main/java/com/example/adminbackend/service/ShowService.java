//// src/main/java/com/example/adminbackend/service/ShowService.java
//package com.example.adminbackend.service;
//
//import com.example.adminbackend.entity.Movie;
//import com.example.adminbackend.entity.Show;
//import com.example.adminbackend.entity.ShowSeat;
//import com.example.adminbackend.entity.SeatStatus;
//import com.example.adminbackend.entity.Theater;
//import com.example.adminbackend.repository.MovieRepository;
//import com.example.adminbackend.repository.SeatRepository;
//import com.example.adminbackend.repository.ShowRepository;
//import com.example.adminbackend.repository.ShowSeatRepository;
//import com.example.adminbackend.repository.TheaterRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class ShowService {
//
//    @Autowired
//    private ShowRepository showRepository;
//
//    @Autowired
//    private MovieRepository movieRepository;
//
//    @Autowired
//    private TheaterRepository theaterRepository;
//
//    @Autowired
//    private SeatRepository seatRepository;
//
//    @Autowired
//    private ShowSeatRepository showSeatRepository;
//
//    @Autowired
//    private TheaterSeatService theaterSeatService;
//
//    // Basic CRUD operations (for your frontend integration)
//    public List<Show> findAll() {
//        return showRepository.findAll();
//    }
//
//    public Optional<Show> findById(Long id) {
//        return showRepository.findById(id);
//    }
//
//    public List<Show> findByMovieId(Long movieId) {
//        return showRepository.findByMovieId(movieId);
//    }
//
//    public List<Show> findByTheaterId(Long theaterId) {
//        return showRepository.findByTheaterId(theaterId);
//    }
//
//    public Show save(Show show) {
//        return showRepository.save(show);
//    }
//
//    public void deleteById(Long id) {
//        showRepository.deleteById(id);
//    }
//
//    // Existing methods (keeping your original functionality)
//    public List<Show> getShowsByMovie(Long movieId) {
//        return showRepository.findByMovieId(movieId);
//    }
//
//    public List<Show> getShowsByTheater(Long theaterId) {
//        return showRepository.findByTheaterId(theaterId);
//    }
//
//    public List<Show> getAllShows() {
//        return showRepository.findAll();
//    }
//
//    public Show getShowById(Long id) {
//        return showRepository.findById(id).orElse(null);
//    }
//
//    @Transactional
//    public Show createShow(Show show) {
//        // 1) Validate and load full Movie & Theater entities
//        Movie movie = movieRepository.findById(show.getMovie().getId())
//                .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + show.getMovie().getId()));
//        Theater theater = theaterRepository.findById(show.getTheater().getId())
//                .orElseThrow(() -> new IllegalArgumentException("Theater not found: " + show.getTheater().getId()));
//
//        show.setMovie(movie);
//        show.setTheater(theater);
//
//        // 2) Default the ticketPrice to the movie's price if none provided
//        if (show.getTicketPrice() == null && movie.getPrice() != null) {
//            // Fixed: Convert BigDecimal to BigDecimal properly
//            show.setTicketPrice(movie.getPrice());
//        }
//
//        // 3) Persist the Show
//        Show savedShow = showRepository.save(show);
//
//        // 4) Generate show_seats using the theater's own seats (which should already have the master layout)
//        theaterSeatService.generateShowSeatsForNewShow(savedShow.getId(), theater.getId());
//
//        return savedShow;
//    }
//
//    @Transactional
//    public Show updateShow(Long id, Show updatedShow) {
//        Show existingShow = showRepository.findById(id)
//                .orElseThrow(() -> new IllegalArgumentException("Show not found: " + id));
//
//        // Update fields
//        if (updatedShow.getShowTime() != null) {
//            existingShow.setShowTime(updatedShow.getShowTime());
//        }
//        if (updatedShow.getTicketPrice() != null) {
//            existingShow.setTicketPrice(updatedShow.getTicketPrice());
//        }
//        if (updatedShow.getMovie() != null && updatedShow.getMovie().getId() != null) {
//            Movie movie = movieRepository.findById(updatedShow.getMovie().getId())
//                    .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + updatedShow.getMovie().getId()));
//            existingShow.setMovie(movie);
//        }
//        if (updatedShow.getTheater() != null && updatedShow.getTheater().getId() != null) {
//            Theater theater = theaterRepository.findById(updatedShow.getTheater().getId())
//                    .orElseThrow(() -> new IllegalArgumentException("Theater not found: " + updatedShow.getTheater().getId()));
//            existingShow.setTheater(theater);
//        }
//
//        return showRepository.save(existingShow);
//    }
//
//    @Transactional
//    public boolean deleteShow(Long id) {
//        if (showRepository.existsById(id)) {
//            // First delete all show_seats for this show
//            showSeatRepository.deleteByShowId(id);
//            // Then delete the show
//            showRepository.deleteById(id);
//            return true;
//        }
//        return false;
//    }
//
//    /**
//     * Get shows by movie and theater
//     */
//    public List<Show> getShowsByMovieAndTheater(Long movieId, Long theaterId) {
//        return showRepository.findByMovieIdAndTheaterId(movieId, theaterId);
//    }
//
//    /**
//     * Check if a show has any bookings
//     */
//    public boolean hasBookings(Long showId) {
//        List<ShowSeat> showSeats = showSeatRepository.findByShowId(showId);
//        return showSeats.stream().anyMatch(seat -> seat.getStatus() == SeatStatus.BOOKED);
//    }
//}
// src/main/java/com/example/adminbackend/service/ShowService.java
// src/main/java/com/example/adminbackend/service/ShowService.java
package com.example.adminbackend.service;

import com.example.adminbackend.entity.Movie;
import com.example.adminbackend.entity.Show;
import com.example.adminbackend.entity.ShowSeat;
import com.example.adminbackend.entity.SeatStatus;
import com.example.adminbackend.entity.Theater;
import com.example.adminbackend.entity.Seat;
import com.example.adminbackend.repository.MovieRepository;
import com.example.adminbackend.repository.SeatRepository;
import com.example.adminbackend.repository.ShowRepository;
import com.example.adminbackend.repository.ShowSeatRepository;
import com.example.adminbackend.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ShowService {

    private static final Logger logger = LoggerFactory.getLogger(ShowService.class);

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private TheaterSeatService theaterSeatService;

    // Basic CRUD operations (for your frontend integration)
    public List<Show> findAll() {
        return showRepository.findAll();
    }

    public Optional<Show> findById(Long id) {
        return showRepository.findById(id);
    }

    public List<Show> findByMovieId(Long movieId) {
        return showRepository.findByMovieId(movieId);
    }

    public List<Show> findByTheaterId(Long theaterId) {
        return showRepository.findByTheaterId(theaterId);
    }

    // FIXED: Remove seat generation from save() to avoid duplicates
    @Transactional
    public Show save(Show show) {
        return showRepository.save(show);
    }

    public void deleteById(Long id) {
        // Delete show seats first, then the show
        showSeatRepository.deleteByShowId(id);
        showRepository.deleteById(id);
    }

    // Existing methods (keeping your original functionality)
    public List<Show> getShowsByMovie(Long movieId) {
        return showRepository.findByMovieId(movieId);
    }

    public List<Show> getShowsByTheater(Long theaterId) {
        return showRepository.findByTheaterId(theaterId);
    }

    public List<Show> getAllShows() {
        return showRepository.findAll();
    }

    public Show getShowById(Long id) {
        return showRepository.findById(id).orElse(null);
    }

    @Transactional
    public Show createShow(Show show) {
        // 1) Validate and load full Movie & Theater entities
        Movie movie = movieRepository.findById(show.getMovie().getId())
                .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + show.getMovie().getId()));
        Theater theater = theaterRepository.findById(show.getTheater().getId())
                .orElseThrow(() -> new IllegalArgumentException("Theater not found: " + show.getTheater().getId()));

        show.setMovie(movie);
        show.setTheater(theater);

        // 2) Default the ticketPrice to the movie's price if none provided
        if (show.getTicketPrice() == null && movie.getPrice() != null) {
            show.setTicketPrice(movie.getPrice());
        }

        // 3) Persist the Show
        Show savedShow = showRepository.save(show);
        logger.info("Created show with ID: {}", savedShow.getId());

        // 4) FIXED: Check if seats already exist before generating
        List<ShowSeat> existingSeats = showSeatRepository.findByShowId(savedShow.getId());
        if (existingSeats.isEmpty()) {
            logger.info("Generating seats for new show: {}", savedShow.getId());
            generateSeatsForShow(savedShow);
        } else {
            logger.info("Show {} already has {} seats, skipping generation",
                    savedShow.getId(), existingSeats.size());
        }

        return savedShow;
    }

    @Transactional
    private void generateSeatsForShow(Show show) {
        try {
            logger.info("Generating seats for show ID: {} in theater ID: {}", show.getId(), show.getTheater().getId());

            // FIXED: Double-check that seats don't already exist
            List<ShowSeat> existingSeats = showSeatRepository.findByShowId(show.getId());
            if (!existingSeats.isEmpty()) {
                logger.warn("Seats already exist for show {}. Skipping generation.", show.getId());
                return;
            }

            // Get all seats for this theater
            List<Seat> theaterSeats = seatRepository.findByTheaterId(show.getTheater().getId());
            logger.info("Found {} seats in theater {}", theaterSeats.size(), show.getTheater().getId());

            if (theaterSeats.isEmpty()) {
                logger.warn("No seats found for theater {}. Cannot create show seats.", show.getTheater().getId());
                return;
            }

            // Create ShowSeat for each theater seat
            List<ShowSeat> showSeats = new ArrayList<>();
            for (Seat seat : theaterSeats) {
                // FIXED: Check if this exact show-seat combination already exists
                boolean exists = showSeatRepository.existsByShowIdAndSeatId(show.getId(), seat.getId());
                if (!exists) {
                    ShowSeat showSeat = new ShowSeat();
                    showSeat.setShow(show);
                    showSeat.setSeat(seat);
                    showSeat.setStatus(SeatStatus.AVAILABLE);
                    showSeats.add(showSeat);
                } else {
                    logger.warn("ShowSeat already exists for show {} and seat {}", show.getId(), seat.getId());
                }
            }

            // Save all show seats in batch
            if (!showSeats.isEmpty()) {
                List<ShowSeat> savedShowSeats = showSeatRepository.saveAll(showSeats);
                logger.info("Successfully created {} show seats for show {}", savedShowSeats.size(), show.getId());
            } else {
                logger.info("No new show seats to create for show {}", show.getId());
            }

        } catch (Exception e) {
            logger.error("Failed to generate seats for show {}: {}", show.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to generate seats for show", e);
        }
    }

    @Transactional
    public Show updateShow(Long id, Show updatedShow) {
        Show existingShow = showRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Show not found: " + id));

        // Update fields
        if (updatedShow.getShowTime() != null) {
            existingShow.setShowTime(updatedShow.getShowTime());
        }
        if (updatedShow.getTicketPrice() != null) {
            existingShow.setTicketPrice(updatedShow.getTicketPrice());
        }
        if (updatedShow.getMovie() != null && updatedShow.getMovie().getId() != null) {
            Movie movie = movieRepository.findById(updatedShow.getMovie().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + updatedShow.getMovie().getId()));
            existingShow.setMovie(movie);
        }
        if (updatedShow.getTheater() != null && updatedShow.getTheater().getId() != null) {
            Theater theater = theaterRepository.findById(updatedShow.getTheater().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Theater not found: " + updatedShow.getTheater().getId()));
            existingShow.setTheater(theater);
        }

        return showRepository.save(existingShow);
    }

    @Transactional
    public boolean deleteShow(Long id) {
        if (showRepository.existsById(id)) {
            // First delete all show_seats for this show
            showSeatRepository.deleteByShowId(id);
            // Then delete the show
            showRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Get shows by movie and theater
     */
    public List<Show> getShowsByMovieAndTheater(Long movieId, Long theaterId) {
        return showRepository.findByMovieIdAndTheaterId(movieId, theaterId);
    }

    /**
     * Check if a show has any bookings
     */
    public boolean hasBookings(Long showId) {
        List<ShowSeat> showSeats = showSeatRepository.findByShowId(showId);
        return showSeats.stream().anyMatch(seat -> seat.getStatus() == SeatStatus.BOOKED);
    }

    /**
     * Fix existing shows that don't have seats
     */
    @Transactional
    public void fixShowsWithoutSeats() {
        logger.info("Checking for shows without seats...");

        List<Show> allShows = showRepository.findAll();
        int fixedShows = 0;

        for (Show show : allShows) {
            List<ShowSeat> existingSeats = showSeatRepository.findByShowId(show.getId());
            if (existingSeats.isEmpty()) {
                logger.info("Fixing show {} - generating seats", show.getId());
                generateSeatsForShow(show);
                fixedShows++;
            }
        }

        logger.info("Fixed {} shows without seats", fixedShows);
    }

    /**
     * ENHANCED: Make all seats available for all shows (except booked ones)
     */
    @Transactional
    public void makeAllShowSeatsAvailable() {
        logger.info("Making all seats AVAILABLE for all shows (except BOOKED seats)...");

        List<Show> allShows = showRepository.findAll();
        int fixedShows = 0;

        for (Show show : allShows) {
            try {
                // Get existing show seats
                List<ShowSeat> existingSeats = showSeatRepository.findByShowId(show.getId());

                if (existingSeats.isEmpty()) {
                    // No seats exist, create them
                    logger.info("Creating seats for show {}", show.getId());
                    generateSeatsForShow(show);
                    fixedShows++;
                } else {
                    // Make all non-booked seats available
                    List<ShowSeat> seatsToUpdate = new ArrayList<>();
                    for (ShowSeat showSeat : existingSeats) {
                        if (showSeat.getStatus() != SeatStatus.BOOKED) {
                            showSeat.setStatus(SeatStatus.AVAILABLE);
                            showSeat.setLockedByUser(null);
                            showSeat.setLockedAt(null);
                            showSeat.setExpiresAt(null);
                            seatsToUpdate.add(showSeat);
                        }
                    }

                    if (!seatsToUpdate.isEmpty()) {
                        showSeatRepository.saveAll(seatsToUpdate);
                        logger.info("Updated {} seats to AVAILABLE for show {}", seatsToUpdate.size(), show.getId());
                    }
                    fixedShows++;
                }
            } catch (Exception e) {
                logger.error("Failed to fix show {}: {}", show.getId(), e.getMessage());
            }
        }

        logger.info("Successfully processed {} shows", fixedShows);
    }

    /**
     * ADDED: Clean up duplicate show seats for a specific show
     */
    @Transactional
    public void cleanupDuplicateSeatsForShow(Long showId) {
        logger.info("Cleaning up duplicate seats for show: {}", showId);

        List<ShowSeat> allSeats = showSeatRepository.findByShowId(showId);
        List<ShowSeat> duplicatesToDelete = new ArrayList<>();
        List<String> processedSeatNumbers = new ArrayList<>();

        for (ShowSeat showSeat : allSeats) {
            String seatNumber = showSeat.getSeat().getSeatNumber();

            if (processedSeatNumbers.contains(seatNumber)) {
                // This is a duplicate, mark for deletion
                duplicatesToDelete.add(showSeat);
                logger.debug("Marking duplicate seat {} for deletion (ID: {})", seatNumber, showSeat.getId());
            } else {
                // First occurrence, keep it
                processedSeatNumbers.add(seatNumber);
            }
        }

        if (!duplicatesToDelete.isEmpty()) {
            showSeatRepository.deleteAll(duplicatesToDelete);
            logger.info("Deleted {} duplicate seats for show {}", duplicatesToDelete.size(), showId);
        } else {
            logger.info("No duplicate seats found for show {}", showId);
        }
    }

    /**
     * Get statistics about seat availability
     */
    public String getSeatsStatistics() {
        List<Show> allShows = showRepository.findAll();
        int totalShows = allShows.size();
        int showsWithSeats = 0;
        long totalSeats = 0;
        long availableSeats = 0;
        long bookedSeats = 0;
        long lockedSeats = 0;

        for (Show show : allShows) {
            List<ShowSeat> seats = showSeatRepository.findByShowId(show.getId());
            if (!seats.isEmpty()) {
                showsWithSeats++;
                totalSeats += seats.size();

                for (ShowSeat seat : seats) {
                    switch (seat.getStatus()) {
                        case AVAILABLE -> availableSeats++;
                        case BOOKED -> bookedSeats++;
                        case LOCKED -> lockedSeats++;
                    }
                }
            }
        }

        return String.format(
                "Shows: %d total, %d with seats. Seats: %d total, %d available, %d booked, %d locked",
                totalShows, showsWithSeats, totalSeats, availableSeats, bookedSeats, lockedSeats
        );
    }
}