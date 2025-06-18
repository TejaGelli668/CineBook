// src/main/java/com/example/adminbackend/repository/MovieRepository.java
package com.example.adminbackend.repository;

import com.example.adminbackend.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieRepository extends JpaRepository<Movie, Long> { }
