package com.example.adminbackend.config;

import com.example.adminbackend.entity.Admin;
import com.example.adminbackend.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeDefaultAdmin();
    }

    private void initializeDefaultAdmin() {
        try {
            // Check if any admin exists
            if (adminRepository.count() == 0) {
                // Create default admin
                Admin defaultAdmin = new Admin();
                defaultAdmin.setUsername("admin");
                defaultAdmin.setEmail("admin@example.com");
                defaultAdmin.setPassword(passwordEncoder.encode("admin123"));
                defaultAdmin.setFirstName("System");
                defaultAdmin.setLastName("Administrator");
                defaultAdmin.setRole(Admin.Role.SUPER_ADMIN);
                defaultAdmin.setIsActive(true);

                adminRepository.save(defaultAdmin);

                logger.info("Default admin created successfully:");
                logger.info("Username: admin");
                logger.info("Password: admin123");
                logger.info("Email: admin@example.com");
                logger.info("Please change the default credentials after first login!");
            } else {
                logger.info("Admin users already exist in the database");
            }
        } catch (Exception e) {
            logger.error("Error initializing default admin: {}", e.getMessage());
        }
    }
}