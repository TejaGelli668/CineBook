// src/main/java/com/example/adminbackend/service/MovieService.java
package com.example.adminbackend.service;

import com.example.adminbackend.entity.Movie;
import com.example.adminbackend.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public Movie save(Movie movie) {
        return repo.save(movie);
    }

    public void deleteById(Long id) {
        repo.deleteById(id);
    }
}
