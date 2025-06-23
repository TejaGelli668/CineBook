package com.example.adminbackend.service;

import com.example.adminbackend.entity.Theater;
import com.example.adminbackend.entity.Seat;
import com.example.adminbackend.repository.TheaterRepository;
import com.example.adminbackend.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class TheaterService {

    private static final Logger logger = LoggerFactory.getLogger(TheaterService.class);
    private static final Long MASTER_THEATER_ID = 2L; // Theater 2 is our template

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private TheaterSeatService theaterSeatService;

    @Autowired
    private SeatRepository seatRepository;

    /**
     * Get all theaters
     */
    public List<Theater> getAllTheaters() {
        return theaterRepository.findAll();
    }

    /**
     * Get theater by ID
     */
    public Theater getTheaterById(Long id) {
        Optional<Theater> theater = theaterRepository.findById(id);
        return theater.orElse(null);
    }

    /**
     * Create a new theater and copy master seat layout
     */
    @Transactional
    public Theater createTheater(Theater theater) {
        // Validate required fields
        if (theater.getName() == null || theater.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Theater name is required");
        }
        if (theater.getLocation() == null || theater.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Theater location is required");
        }
        if (theater.getCity() == null || theater.getCity().trim().isEmpty()) {
            throw new IllegalArgumentException("Theater city is required");
        }
        if (theater.getNumberOfScreens() == null || theater.getNumberOfScreens() <= 0) {
            throw new IllegalArgumentException("Valid number of screens is required");
        }
        if (theater.getTotalSeats() == null || theater.getTotalSeats() <= 0) {
            throw new IllegalArgumentException("Valid total seats number is required");
        }

        // Set default status if not provided
        if (theater.getStatus() == null) {
            theater.setStatus(Theater.Status.ACTIVE);
        }

        // Save the theater first
        Theater savedTheater = theaterRepository.save(theater);
        logger.info("Created new theater: {} (ID: {})", savedTheater.getName(), savedTheater.getId());

        // Copy seat layout from master theater (theater 2) to this new theater
        copyMasterSeatLayoutToTheater(savedTheater.getId());

        return savedTheater;
    }

    /**
     * Copy the master theater seat layout to a new theater
     */
    @Transactional
    public void copyMasterSeatLayoutToTheater(Long newTheaterId) {
        logger.info("Copying master seat layout from theater {} to theater {}", MASTER_THEATER_ID, newTheaterId);

        // Get all seats from master theater
        List<Seat> masterSeats = seatRepository.findByTheaterId(MASTER_THEATER_ID);

        if (masterSeats.isEmpty()) {
            logger.warn("No seats found in master theater (ID: {}). Cannot copy layout.", MASTER_THEATER_ID);
            return;
        }

        // Check if new theater already has seats
        List<Seat> existingSeats = seatRepository.findByTheaterId(newTheaterId);
        if (!existingSeats.isEmpty()) {
            logger.warn("Theater {} already has {} seats. Skipping seat copy.", newTheaterId, existingSeats.size());
            return;
        }

        // Create new seats for the new theater based on master layout
        List<Seat> newSeats = new ArrayList<>();
        Theater newTheater = new Theater();
        newTheater.setId(newTheaterId);

        for (Seat masterSeat : masterSeats) {
            Seat newSeat = new Seat();
            newSeat.setSeatNumber(masterSeat.getSeatNumber());
            newSeat.setRowLetter(masterSeat.getRowLetter());
            newSeat.setSeatPosition(masterSeat.getSeatPosition());
            newSeat.setCategory(masterSeat.getCategory());
            newSeat.setPrice(masterSeat.getPrice());
            newSeat.setWheelchairAccessible(masterSeat.isWheelchairAccessible());
            newSeat.setTheater(newTheater);

            newSeats.add(newSeat);
        }

        // Save all new seats
        List<Seat> savedSeats = seatRepository.saveAll(newSeats);
        logger.info("Copied {} seats from master theater to theater {}", savedSeats.size(), newTheaterId);

        // Generate show_seats for any existing shows in this theater
        theaterSeatService.generateShowSeatsForTheater(newTheaterId, savedSeats);
    }

    /**
     * Update an existing theater
     */
    public Theater updateTheater(Long id, Theater updatedTheater) {
        Optional<Theater> existingTheaterOpt = theaterRepository.findById(id);

        if (existingTheaterOpt.isPresent()) {
            Theater existingTheater = existingTheaterOpt.get();

            // Update fields
            existingTheater.setName(updatedTheater.getName());
            existingTheater.setLocation(updatedTheater.getLocation());
            existingTheater.setAddress(updatedTheater.getAddress());
            existingTheater.setCity(updatedTheater.getCity());
            existingTheater.setState(updatedTheater.getState());
            existingTheater.setPincode(updatedTheater.getPincode());
            existingTheater.setPhoneNumber(updatedTheater.getPhoneNumber());
            existingTheater.setEmail(updatedTheater.getEmail());
            existingTheater.setNumberOfScreens(updatedTheater.getNumberOfScreens());
            existingTheater.setTotalSeats(updatedTheater.getTotalSeats());
            existingTheater.setFacilities(updatedTheater.getFacilities());
            existingTheater.setShows(updatedTheater.getShows());
            existingTheater.setPricing(updatedTheater.getPricing());
            existingTheater.setStatus(updatedTheater.getStatus());

            return theaterRepository.save(existingTheater);
        }

        return null;
    }

    /**
     * Delete a theater
     */
    public boolean deleteTheater(Long id) {
        if (theaterRepository.existsById(id)) {
            theaterRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Get theaters by city
     */
    public List<Theater> getTheatersByCity(String city) {
        return theaterRepository.findByCityIgnoreCase(city);
    }

    /**
     * Get only active theaters
     */
    public List<Theater> getActiveTheaters() {
        return theaterRepository.findByStatus(Theater.Status.ACTIVE);
    }

    /**
     * Check if theater exists by name and city
     */
    public boolean existsByNameAndCity(String name, String city) {
        return theaterRepository.existsByNameAndCityIgnoreCase(name, city);
    }

    /**
     * Search theaters by name
     */
    public List<Theater> searchTheatersByName(String name) {
        return theaterRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Apply master seat layout to existing theaters that don't have seats
     */
    @Transactional
    public String applyMasterLayoutToExistingTheaters() {
        logger.info("Applying master seat layout to existing theaters without seats...");

        List<Theater> allTheaters = theaterRepository.findAll();
        int theatersUpdated = 0;

        for (Theater theater : allTheaters) {
            // Skip the master theater itself
            if (theater.getId().equals(MASTER_THEATER_ID)) {
                continue;
            }

            List<Seat> existingSeats = seatRepository.findByTheaterId(theater.getId());
            if (existingSeats.isEmpty()) {
                logger.info("Applying master layout to theater: {} (ID: {})", theater.getName(), theater.getId());
                copyMasterSeatLayoutToTheater(theater.getId());
                theatersUpdated++;
            } else {
                logger.info("Theater {} already has {} seats. Skipping.", theater.getName(), existingSeats.size());
            }
        }

        String result = String.format("Applied master seat layout to %d theaters", theatersUpdated);
        logger.info(result);
        return result;
    }
}