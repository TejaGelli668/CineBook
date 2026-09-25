package com.example.adminbackend.repository;

import com.example.adminbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Map "username" back to the email column, so Spring Data
     * doesn't try to derive a username property.
     */
    @Query("SELECT u FROM User u WHERE u.email = :username")
    Optional<User> findByUsername(@Param("username") String username);

    long countByIsActiveTrue();

    @Query("SELECT COUNT(u) FROM User u WHERE cast(u.createdAt as date) = CURRENT_DATE")
    long countUsersRegisteredToday();

    @Query("SELECT COUNT(u) FROM User u WHERE extract(year from u.createdAt) = extract(year from CURRENT_DATE) AND extract(month from u.createdAt) = extract(month from CURRENT_DATE)")
    long countUsersRegisteredThisMonth();

    @Query("SELECT u FROM User u WHERE u.createdAt >= :startDate")
    List<User> findUsersCreatedAfter(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT u FROM User u WHERE u.lastLogin >= :startDate")
    List<User> findUsersActiveAfter(@Param("startDate") LocalDateTime startDate);

    /**
     * A convenience method so you can call either by username or email.
     */
    default Optional<User> findByUsernameOrEmail(String username) {
        return findByEmail(username);
    }
}
