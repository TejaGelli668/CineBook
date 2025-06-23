// src/main/java/com/example/adminbackend/service/MovieService.java
package com.example.adminbackend.service;

import com.example.adminbackend.entity.Movie;
import com.example.adminbackend.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    @Autowired
    private MovieRepository repo;

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

    public void deleteById(Long id) {
        repo.deleteById(id);
    }
}