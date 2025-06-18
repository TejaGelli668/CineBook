package com.example.adminbackend.repository;

import com.example.adminbackend.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    /**
     * Find admin by username
     */
    Optional<Admin> findByUsername(String username);

    /**
     * Find admin by email
     */
    Optional<Admin> findByEmail(String email);

    /**
     * Find admin by username or email
     */
    Optional<Admin> findByUsernameOrEmail(String username, String email);

    /**
     * Check if username exists
     */
    boolean existsByUsername(String username);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Find active admin by username
     */
    Optional<Admin> findByUsernameAndIsActiveTrue(String username);

    /**
     * Find active admin by email
     */
    Optional<Admin> findByEmailAndIsActiveTrue(String email);

    /**
     * Update last login time
     */
    @Modifying
    @Query("UPDATE Admin a SET a.lastLogin = :lastLogin WHERE a.id = :adminId")
    void updateLastLogin(@Param("adminId") Long adminId, @Param("lastLogin") LocalDateTime lastLogin);

    /**
     * Deactivate admin account
     */
    @Modifying
    @Query("UPDATE Admin a SET a.isActive = false WHERE a.id = :adminId")
    void deactivateAdmin(@Param("adminId") Long adminId);

    /**
     * Activate admin account
     */
    @Modifying
    @Query("UPDATE Admin a SET a.isActive = true WHERE a.id = :adminId")
    void activateAdmin(@Param("adminId") Long adminId);
}