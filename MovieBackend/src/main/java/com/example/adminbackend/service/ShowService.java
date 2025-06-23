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
//import java.util.ArrayList;
//import java.util.List;
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
//    public List<Show> getShowsByMovie(Long movieId) {
//        return showRepository.findByMovieId(movieId);
//    }
//
//    public List<Show> getShowsByTheater(Long theaterId) {
//        return showRepository.findByTheaterId(theaterId);
//    }
//
//    @Transactional
//    public Show createShow(Show show) {
//        // 1) Load full Movie & Theater
//        Movie movie = movieRepository.findById(show.getMovie().getId())
//                .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + show.getMovie().getId()));
//        Theater theater = theaterRepository.findById(show.getTheater().getId())
//                .orElseThrow(() -> new IllegalArgumentException("Theater not found: " + show.getTheater().getId()));
//        show.setMovie(movie);
//        show.setTheater(theater);
//
//        // 2) Default the ticketPrice to the movie’s price if none provided
//        if (show.getTicketPrice() == null && movie.getPrice() != null) {
//            show.setTicketPrice(movie.getPrice().doubleValue());
//        }
//
//        // 3) Persist the Show row
//        Show savedShow = showRepository.save(show);
//
//        // 4) Create ShowSeat rows for every Seat in that Theater
//        List<ShowSeat> seats = new ArrayList<>();
//        seatRepository.findByTheaterId(theater.getId()).forEach(seat -> {
//            ShowSeat ss = new ShowSeat();
//            ss.setShow(savedShow);
//            ss.setSeat(seat);
//            ss.setStatus(SeatStatus.AVAILABLE);
//            seats.add(ss);
//        });
//        showSeatRepository.saveAll(seats);
//
//        // 5) Reload & return the fully populated Show
//        return showRepository.findById(savedShow.getId())
//                .orElseThrow(() -> new RuntimeException("Failed to reload show after creation"));
//    }
//}
package com.example.adminbackend.service;

import com.example.adminbackend.entity.Movie;
import com.example.adminbackend.entity.Show;
import com.example.adminbackend.entity.ShowSeat;
import com.example.adminbackend.entity.SeatStatus;
import com.example.adminbackend.entity.Theater;
import com.example.adminbackend.repository.MovieRepository;
import com.example.adminbackend.repository.SeatRepository;
import com.example.adminbackend.repository.ShowRepository;
import com.example.adminbackend.repository.ShowSeatRepository;
import com.example.adminbackend.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ShowService {

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
            show.setTicketPrice(movie.getPrice().doubleValue());
        }

        // 3) Persist the Show
        Show savedShow = showRepository.save(show);

        // 4) Generate show_seats using the theater's own seats (which should already have the master layout)
        theaterSeatService.generateShowSeatsForNewShow(savedShow.getId(), theater.getId());

        return savedShow;
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
}