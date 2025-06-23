package com.example.adminbackend.service;

import com.example.adminbackend.config.TheaterSeatConfig;
import com.example.adminbackend.entity.*;
import com.example.adminbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TheaterSeatService {

    private static final Logger logger = LoggerFactory.getLogger(TheaterSeatService.class);

    // Theater 2 is your master seat layout that should be available for all shows
    private static final Long MASTER_THEATER_ID = 2L;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private TheaterSeatConfig theaterSeatConfig;

    /**
     * Generate default seat layout for a theater
     */
    @Transactional
    public void generateSeatsForTheater(Long theaterId) {
        logger.info("Generating default seat layout for theater ID: {}", theaterId);

        // Check if seats already exist
        List<Seat> existingSeats = seatRepository.findByTheaterId(theaterId);
        if (!existingSeats.isEmpty()) {
            logger.warn("Theater {} already has {} seats. Skipping seat generation.",
                    theaterId, existingSeats.size());
            return;
        }

        List<TheaterSeatConfig.SeatCategory> layout = theaterSeatConfig.getDefaultTheaterLayout();
        Set<String> wheelchairSeats = theaterSeatConfig.getDefaultWheelchairSeats();
        List<Seat> seatsToCreate = new ArrayList<>();

        for (TheaterSeatConfig.SeatCategory category : layout) {
            for (TheaterSeatConfig.RowConfig row : category.getRows()) {
                for (Integer seatNumber : row.getSeatNumbers()) {
                    String seatId = row.getRowLetter() + seatNumber;

                    Seat seat = new Seat();
                    seat.setSeatNumber(seatId);
                    seat.setRowLetter(row.getRowLetter());
                    seat.setSeatPosition(seatNumber);
                    seat.setCategory(category.getName());
                    seat.setPrice(category.getPrice());
                    seat.setWheelchairAccessible(wheelchairSeats.contains(seatId));

                    // Set theater reference
                    Theater theater = new Theater();
                    theater.setId(theaterId);
                    seat.setTheater(theater);

                    seatsToCreate.add(seat);
                }
            }
        }

        // Batch save all seats
        List<Seat> savedSeats = seatRepository.saveAll(seatsToCreate);
        logger.info("Created {} seats for theater ID: {}", savedSeats.size(), theaterId);

        // Generate show_seats for all existing shows in this theater
        generateShowSeatsForTheater(theaterId, savedSeats);
    }

    /**
     * Generate show_seats for all shows in a theater
     */
    @Transactional
    public void generateShowSeatsForTheater(Long theaterId, List<Seat> seats) {
        List<Show> shows = showRepository.findByTheaterId(theaterId);
        logger.info("Generating show_seats for {} shows in theater {}", shows.size(), theaterId);

        List<ShowSeat> showSeatsToCreate = new ArrayList<>();

        for (Show show : shows) {
            for (Seat seat : seats) {
                ShowSeat showSeat = new ShowSeat();
                showSeat.setShow(show);
                showSeat.setSeat(seat);
                showSeat.setStatus(SeatStatus.AVAILABLE);
                showSeatsToCreate.add(showSeat);
            }
        }

        if (!showSeatsToCreate.isEmpty()) {
            showSeatRepository.saveAll(showSeatsToCreate);
            logger.info("Created {} show_seat records", showSeatsToCreate.size());
        }
    }

    /**
     * Generate show_seats for a new show - uses theater's own seats
     */
    @Transactional
    public void generateShowSeatsForNewShow(Long showId, Long theaterId) {
        logger.info("Generating show_seats for show ID: {} in theater ID: {}", showId, theaterId);

        // Get all seats from the show's theater
        List<Seat> theaterSeats = seatRepository.findByTheaterId(theaterId);

        if (theaterSeats.isEmpty()) {
            logger.warn("No seats found for theater {}. This theater needs seat layout setup.", theaterId);
            return;
        }

        List<ShowSeat> showSeatsToCreate = new ArrayList<>();
        Show show = new Show();
        show.setId(showId);

        for (Seat seat : theaterSeats) {
            ShowSeat showSeat = new ShowSeat();
            showSeat.setShow(show);
            showSeat.setSeat(seat);
            showSeat.setStatus(SeatStatus.AVAILABLE);
            showSeatsToCreate.add(showSeat);
        }

        showSeatRepository.saveAll(showSeatsToCreate);
        logger.info("Created {} show_seat records for show ID: {}", showSeatsToCreate.size(), showId);
    }

    /**
     * Add master theater seats to ALL existing shows that don't have them
     */
    @Transactional
    public void addMasterTheaterSeatsToAllShows() {
        logger.info("Adding master theater (ID: {}) seats to all existing shows...", MASTER_THEATER_ID);

        List<Seat> masterSeats = seatRepository.findByTheaterId(MASTER_THEATER_ID);
        if (masterSeats.isEmpty()) {
            logger.warn("No seats found in master theater (ID: {}). Cannot proceed.", MASTER_THEATER_ID);
            return;
        }

        List<Show> allShows = showRepository.findAll();
        List<ShowSeat> showSeatsToCreate = new ArrayList<>();

        for (Show show : allShows) {
            for (Seat seat : masterSeats) {
                // Check if this SPECIFIC show-seat ID combination already exists
                boolean exists = showSeatRepository.existsByShowIdAndSeatId(show.getId(), seat.getId());

                if (!exists) {
                    ShowSeat showSeat = new ShowSeat();
                    showSeat.setShow(show);
                    showSeat.setSeat(seat);
                    showSeat.setStatus(SeatStatus.AVAILABLE);
                    showSeatsToCreate.add(showSeat);
                }
            }
        }

        if (!showSeatsToCreate.isEmpty()) {
            showSeatRepository.saveAll(showSeatsToCreate);
            logger.info("Added {} master theater seat records to existing shows", showSeatsToCreate.size());
        } else {
            logger.info("All shows already have master theater seats");
        }
    }

    /**
     * Generate seats for all existing theaters that don't have seats
     */
    @Transactional
    public void generateSeatsForAllTheaters() {
        logger.info("Generating seats for all theaters without seats...");

        List<Theater> allTheaters = theaterRepository.findAll();

        for (Theater theater : allTheaters) {
            List<Seat> existingSeats = seatRepository.findByTheaterId(theater.getId());
            if (existingSeats.isEmpty()) {
                logger.info("Generating seats for theater: {} (ID: {})", theater.getName(), theater.getId());
                generateSeatsForTheater(theater.getId());
            } else {
                logger.info("Theater {} already has {} seats. Skipping.", theater.getName(), existingSeats.size());
            }
        }
    }

    /**
     * Get seat statistics for a theater
     */
    public Map<String, Object> getTheaterSeatStats(Long theaterId) {
        List<Seat> seats = seatRepository.findByTheaterId(theaterId);
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalSeats", seats.size());
        stats.put("wheelchairAccessibleSeats", seats.stream().mapToInt(s -> s.isWheelchairAccessible() ? 1 : 0).sum());

        // Group by category
        Map<String, Long> seatsByCategory = new HashMap<>();
        for (Seat seat : seats) {
            seatsByCategory.merge(seat.getCategory(), 1L, Long::sum);
        }
        stats.put("seatsByCategory", seatsByCategory);

        return stats;
    }

    /**
     * One-time method to fix existing shows - adds master theater seats to all shows
     */
    @Transactional
    public String fixExistingShows() {
        try {
            addMasterTheaterSeatsToAllShows();
            return "Successfully added master theater seats to all existing shows";
        } catch (Exception e) {
            logger.error("Error fixing existing shows: ", e);
            return "Error: " + e.getMessage();
        }
    }
}