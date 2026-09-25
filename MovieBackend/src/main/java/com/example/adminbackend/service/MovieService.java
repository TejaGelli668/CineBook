//// src/main/java/com/example/adminbackend/service/MovieService.java
//package com.example.adminbackend.service;
//
//import com.example.adminbackend.entity.Movie;
//import com.example.adminbackend.repository.MovieRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class MovieService {
//
//    @Autowired
//    private MovieRepository repo;
//
//    public List<Movie> findAll() {
//        return repo.findAll();
//    }
//
//    public Optional<Movie> findById(Long id) {
//        return repo.findById(id);
//    }
//
//    @Transactional
//    public Optional<Movie> findByIdWithShows(Long id) {
//        Optional<Movie> movieOpt = repo.findById(id);
//        if (movieOpt.isPresent()) {
//            Movie movie = movieOpt.get();
//            // Force loading of shows (since it's LAZY)
//            movie.getShows().size(); // This triggers the lazy loading
//        }
//        return movieOpt;
//    }
//
//    public Movie save(Movie movie) {
//        return repo.save(movie);
//    }
//
//    public void deleteById(Long id) {
//        repo.deleteById(id);
//    }
//}
package com.example.adminbackend.service;

import com.example.adminbackend.entity.Movie;
import com.example.adminbackend.entity.Show;
import com.example.adminbackend.repository.MovieRepository;
import com.example.adminbackend.repository.ShowRepository;
import com.example.adminbackend.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    @Autowired
    private MovieRepository repo;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public List<Movie> findAll() {
        return repo.findAll();
    }

    public Optional<Movie> findById(Long id) {
        return repo.findById(id);
    }

    @Transactional
    public Optional<Movie> findByIdWithShows(Long id) {
        Optional<Movie> movieOpt = repo.findById(id);
        if (movieOpt.isPresent()) {
            Movie movie = movieOpt.get();
            // Force loading of shows (since it's LAZY)
            movie.getShows().size(); // This triggers the lazy loading
        }
        return movieOpt;
    }

    public Movie save(Movie movie) {
        return repo.save(movie);
    }

    @Transactional
    public void deleteById(Long id) {
        // Check if movie exists
        if (!repo.existsById(id)) {
            throw new RuntimeException("Movie with id " + id + " not found");
        }

        // Delete everything in the correct order using bulk deletes:
        // 1. Delete all bookings for shows of this movie
        showRepository.deleteBookingsByMovieId(id);

        // 2. Delete all show_seats for shows of this movie
        showRepository.deleteShowSeatsByMovieId(id);

        // 3. Delete all shows for this movie
        showRepository.deleteByMovieId(id);

        // 4. Finally delete the movie (this will also handle movie_cast and movie_format via JPA)
        repo.deleteById(id);
    }

    // Alternative method: Check if movie can be deleted (has bookings)
    public boolean canDelete(Long id) {
        List<Show> shows = showRepository.findByMovieId(id);
        for (Show show : shows) {
            if (bookingRepository.existsByShowId(show.getId())) {
                return false;
            }
        }
        return true;
    }

    // Safe delete method that checks for bookings first
    @Transactional
    public void safeDeleteById(Long id) {
        if (!canDelete(id)) {
            throw new RuntimeException("Cannot delete movie - it has existing bookings");
        }
        deleteById(id);
    }

    // Get booking count for a movie
    public long getBookingCount(Long id) {
        return bookingRepository.countByMovieId(id);
    }
}