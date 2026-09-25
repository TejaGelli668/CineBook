//package com.example.adminbackend.repository;
//
//import com.example.adminbackend.entity.Theater;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
//@Repository
//public interface TheaterRepository extends JpaRepository<Theater, Long> {
//
//    /**
//     * Find theaters by city (case insensitive)
//     */
//    List<Theater> findByCityIgnoreCase(String city);
//
//    /**
//     * Find theaters by status
//     */
//    List<Theater> findByStatus(Theater.Status status);
//
//    /**
//     * Check if theater exists by name and city (case insensitive)
//     */
//    boolean existsByNameAndCityIgnoreCase(String name, String city);
//
//    /**
//     * Find theaters by name containing (case insensitive)
//     */
//    List<Theater> findByNameContainingIgnoreCase(String name);
//
//    /**
//     * Find theaters by state (case insensitive)
//     */
//    List<Theater> findByStateIgnoreCase(String state);
//
//    /**
//     * Find theaters by city and status
//     */
//    List<Theater> findByCityIgnoreCaseAndStatus(String city, Theater.Status status);
//
//    /**
//     * Custom query to find theaters with minimum number of screens
//     */
//    @Query("SELECT t FROM Theater t WHERE t.numberOfScreens >= :minScreens")
//    List<Theater> findTheatersWithMinScreens(@Param("minScreens") Integer minScreens);
//
//    /**
//     * Custom query to find theaters with minimum seating capacity
//     */
//    @Query("SELECT t FROM Theater t WHERE t.totalSeats >= :minSeats")
//    List<Theater> findTheatersWithMinSeats(@Param("minSeats") Integer minSeats);
//
//    /**
//     * Find theaters by multiple cities
//     */
//    List<Theater> findByCityIgnoreCaseIn(List<String> cities);
//
//    /**
//     * Custom query to search theaters by multiple criteria
//     */
//    @Query("SELECT t FROM Theater t WHERE " +
//            "(:city IS NULL OR LOWER(t.city) = LOWER(:city)) AND " +
//            "(:state IS NULL OR LOWER(t.state) = LOWER(:state)) AND " +
//            "(:status IS NULL OR t.status = :status) AND " +
//            "(:minScreens IS NULL OR t.numberOfScreens >= :minScreens)")
//    List<Theater> findTheatersByCriteria(
//            @Param("city") String city,
//            @Param("state") String state,
//            @Param("status") Theater.Status status,
//            @Param("minScreens") Integer minScreens
//    );
//}
// src/main/java/com/example/adminbackend/repository/TheaterRepository.java
package com.example.adminbackend.repository;

import com.example.adminbackend.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TheaterRepository extends JpaRepository<Theater, Long> {

    // Find theaters by city (case insensitive)
    List<Theater> findByCityIgnoreCase(String city);

    // Find theaters by status
    List<Theater> findByStatus(Theater.Status status);

    // Find theaters by name containing (case insensitive search)
    List<Theater> findByNameContainingIgnoreCase(String name);

    // Check if theater exists by name and city (case insensitive)
    boolean existsByNameAndCityIgnoreCase(String name, String city);

    // Find theaters by state
    List<Theater> findByStateIgnoreCase(String state);

    // Find theaters by city and state
    List<Theater> findByCityIgnoreCaseAndStateIgnoreCase(String city, String state);

    // Find theaters with number of screens greater than or equal to
    @Query("SELECT t FROM Theater t WHERE t.numberOfScreens >= :minScreens")
    List<Theater> findByMinimumScreens(@Param("minScreens") Integer minScreens);

    // Find theaters with total seats greater than or equal to
    @Query("SELECT t FROM Theater t WHERE t.totalSeats >= :minSeats")
    List<Theater> findByMinimumSeats(@Param("minSeats") Integer minSeats);

    // Find active theaters by city
    @Query("SELECT t FROM Theater t WHERE t.city = :city AND t.status = 'ACTIVE'")
    List<Theater> findActiveByCityIgnoreCase(@Param("city") String city);

    // Search theaters by multiple criteria
    @Query("SELECT t FROM Theater t WHERE " +
            "(:city IS NULL OR LOWER(t.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
            "(:state IS NULL OR LOWER(t.state) LIKE LOWER(CONCAT('%', :state, '%'))) AND " +
            "(:status IS NULL OR t.status = :status)")
    List<Theater> findTheatersByCriteria(
            @Param("city") String city,
            @Param("state") String state,
            @Param("status") Theater.Status status
    );
}