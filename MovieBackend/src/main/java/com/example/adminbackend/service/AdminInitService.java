package com.example.adminbackend.service;

import com.example.adminbackend.entity.Admin;
import com.example.adminbackend.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AdminInitService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitService.class);

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createDefaultAdminIfNotExists();
    }

    private void createDefaultAdminIfNotExists() {
        try {
            // Check if any admin exists
            if (adminRepository.count() == 0) {
                logger.info("No admin users found. Creating default admin...");
                createDefaultAdmin();
            } else {
                logger.info("Admin users already exist. Skipping default admin creation.");
            }
        } catch (Exception e) {
            logger.error("Error during admin initialization: {}", e.getMessage(), e);
        }
    }

    private void createDefaultAdmin() {
        try {
            Admin defaultAdmin = new Admin();
            defaultAdmin.setUsername("admin@cinebook.com");
            defaultAdmin.setEmail("admin@cinebook.com");
            defaultAdmin.setPassword(passwordEncoder.encode("admin123"));
            defaultAdmin.setFirstName("System");
            defaultAdmin.setLastName("Administrator");
            defaultAdmin.setRole(Admin.Role.SUPER_ADMIN);
            defaultAdmin.setIsActive(true);
            // Don't set createdAt - it's automatically set by @PrePersist
            // Don't set lastLogin - it should be null initially

            adminRepository.save(defaultAdmin);

            logger.info("Default admin created successfully:");
            logger.info("Username: admin@cinebook.com");
            logger.info("Password: admin123");
            logger.info("Please change the default password after first login!");

        } catch (Exception e) {
            logger.error("Failed to create default admin: {}", e.getMessage(), e);
        }
    }
}