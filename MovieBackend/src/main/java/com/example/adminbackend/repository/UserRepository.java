package com.example.adminbackend.repository;

import com.example.adminbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByIsActiveTrue();

    @Query("SELECT COUNT(u) FROM User u WHERE DATE(u.createdAt) = CURRENT_DATE")
    long countUsersRegisteredToday();

    @Query("SELECT COUNT(u) FROM User u WHERE YEAR(u.createdAt) = YEAR(CURRENT_DATE) AND MONTH(u.createdAt) = MONTH(CURRENT_DATE)")
    long countUsersRegisteredThisMonth();

    @Query("SELECT u FROM User u WHERE u.createdAt >= :startDate")
    java.util.List<User> findUsersCreatedAfter(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT u FROM User u WHERE u.lastLogin >= :startDate")
    java.util.List<User> findUsersActiveAfter(@Param("startDate") LocalDateTime startDate);
}