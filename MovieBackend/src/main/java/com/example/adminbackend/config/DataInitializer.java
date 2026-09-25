package com.example.adminbackend.config;

import com.example.adminbackend.entity.Admin;
import com.example.adminbackend.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the first manager account from configuration (ADMIN_USERNAME / ADMIN_PASSWORD
 * in .env) when no admin exists yet. There is no built-in default password.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:admin}")
    private String username;

    @Value("${app.admin.email:admin@cinebook.local}")
    private String email;

    @Value("${app.admin.password:}")
    private String password;

    @Override
    public void run(String... args) {
        if (adminRepository.count() > 0) {
            logger.info("Admin account already exists");
            return;
        }
        if (password == null || password.length() < 12) {
            logger.warn("No admin account created: set ADMIN_PASSWORD (12+ characters) in .env and restart");
            return;
        }
        Admin admin = new Admin();
        admin.setUsername(username);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setFirstName("Cinema");
        admin.setLastName("Manager");
        admin.setRole(Admin.Role.SUPER_ADMIN);
        admin.setIsActive(true);
        adminRepository.save(admin);
        logger.info("Admin account '{}' created from configuration", username);
    }
}
