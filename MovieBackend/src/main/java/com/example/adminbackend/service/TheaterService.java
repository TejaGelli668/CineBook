package com.example.adminbackend.service;

import com.example.adminbackend.entity.Theater;
import com.example.adminbackend.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TheaterService {

    @Autowired
    private TheaterRepository theaterRepository;

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
     * Create a new theater
     */
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

        return theaterRepository.save(theater);
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
}