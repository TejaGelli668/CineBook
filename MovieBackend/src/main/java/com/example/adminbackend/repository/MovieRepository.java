// src/main/java/com/example/adminbackend/repository/MovieRepository.java
package com.example.adminbackend.repository;

import com.example.adminbackend.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    // Find movies by status
    List<Movie> findByStatus(String status);

    // Find movies by genre (case insensitive)
    List<Movie> findByGenreIgnoreCase(String genre);

    // Find movies by language (case insensitive)
    List<Movie> findByLanguageIgnoreCase(String language);

    // Find movies by title containing (case insensitive search)
    List<Movie> findByTitleContainingIgnoreCase(String title);

    // Find movies by director (case insensitive)
    List<Movie> findByDirectorIgnoreCase(String director);

    // Find movies by certificate
    List<Movie> findByCertificate(String certificate);

    // Find movies by release date range
    @Query("SELECT m FROM Movie m WHERE m.releaseDate BETWEEN :startDate AND :endDate")
    List<Movie> findByReleaseDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Find movies with rating greater than or equal to
    @Query("SELECT m FROM Movie m WHERE m.rating >= :minRating")
    List<Movie> findByMinRating(@Param("minRating") Double minRating);

    // Find movies with duration containing (e.g., "2h", "3h")
    List<Movie> findByDurationContaining(String duration);

    // Find active movies
    @Query("SELECT m FROM Movie m WHERE m.status = 'Active'")
    List<Movie> findActiveMovies();

    // Find movies by multiple criteria
    @Query("SELECT m FROM Movie m WHERE " +
            "(:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:genre IS NULL OR LOWER(m.genre) LIKE LOWER(CONCAT('%', :genre, '%'))) AND " +
            "(:language IS NULL OR LOWER(m.language) LIKE LOWER(CONCAT('%', :language, '%'))) AND " +
            "(:status IS NULL OR m.status = :status)")
    List<Movie> findMoviesByCriteria(
            @Param("title") String title,
            @Param("genre") String genre,
            @Param("language") String language,
            @Param("status") String status
    );

    // Find movies released this year
    @Query("SELECT m FROM Movie m WHERE YEAR(m.releaseDate) = YEAR(CURRENT_DATE)")
    List<Movie> findMoviesReleasedThisYear();

    // Find top rated movies
    @Query("SELECT m FROM Movie m WHERE m.status = 'Active' ORDER BY m.rating DESC")
    List<Movie> findTopRatedMovies();

    // Find recent movies (released in last 30 days)
    @Query("SELECT m FROM Movie m WHERE m.releaseDate >= :thirtyDaysAgo ORDER BY m.releaseDate DESC")
    List<Movie> findRecentMovies(@Param("thirtyDaysAgo") LocalDate thirtyDaysAgo);
}