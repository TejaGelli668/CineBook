//package com.example.adminbackend.service;
//
//import com.example.adminbackend.entity.Admin;
//import com.example.adminbackend.repository.AdminRepository;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//import java.util.Optional;
//
//@Service
//public class CustomUserDetailsService implements UserDetailsService {
//
//    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);
//
//    @Autowired
//    private AdminRepository adminRepository;
//
//    /**
//     * Load user by username for Spring Security
//     */
//    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        Optional<Admin> adminOpt = adminRepository.findByUsernameOrEmail(username, username);
//
//        if (adminOpt.isEmpty()) {
//            logger.warn("Admin not found with username or email: {}", username);
//            throw new UsernameNotFoundException("Admin not found with username or email: " + username);
//        }
//
//        Admin admin = adminOpt.get();
//
//        if (!admin.getIsActive()) {
//            logger.warn("Admin account is deactivated: {}", username);
//            throw new UsernameNotFoundException("Admin account is deactivated");
//        }
//
//        return admin;
//    }
//}

package com.example.adminbackend.service;

import com.example.adminbackend.entity.Admin;
import com.example.adminbackend.entity.User;
import com.example.adminbackend.repository.AdminRepository;
import com.example.adminbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Load user by username for Spring Security
     * This method handles both Admin and User authentication
     */
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.debug("Attempting to load user by username: {}", username);

        // First, try to find admin by username or email
        try {
            Optional<Admin> adminOpt = adminRepository.findByUsernameOrEmail(username, username);

            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();

                if (!admin.getIsActive()) {
                    logger.warn("Admin account is deactivated: {}", username);
                    throw new UsernameNotFoundException("Admin account is deactivated");
                }

                logger.info("Admin found and authenticated: {}", admin.getUsername());
                return admin;
            }
        } catch (Exception e) {
            logger.debug("Admin not found or error occurred, trying user lookup: {}", e.getMessage());
        }

        // If admin not found, try to find user by email
        try {
            Optional<User> userOpt = userRepository.findByEmail(username);

            if (userOpt.isPresent()) {
                User user = userOpt.get();

                if (!user.getIsActive()) {
                    logger.warn("User account is deactivated: {}", username);
                    throw new UsernameNotFoundException("User account is deactivated");
                }

                logger.info("User found and authenticated: {}", user.getEmail());
                return user;
            }
        } catch (Exception e) {
            logger.debug("User not found or error occurred: {}", e.getMessage());
        }

        // If neither admin nor user found
        logger.warn("No admin or user found with username/email: {}", username);
        throw new UsernameNotFoundException("No user found with username or email: " + username);
    }

    /**
     * Helper method to find admin by username or email
     */
    public Optional<Admin> findAdminByUsernameOrEmail(String identifier) {
        try {
            return adminRepository.findByUsernameOrEmail(identifier, identifier);
        } catch (Exception e) {
            logger.error("Error finding admin by username or email: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Helper method to find user by email
     */
    public Optional<User> findUserByEmail(String email) {
        try {
            return userRepository.findByEmail(email);
        } catch (Exception e) {
            logger.error("Error finding user by email: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Check if identifier belongs to an admin
     */
    public boolean isAdmin(String identifier) {
        return findAdminByUsernameOrEmail(identifier).isPresent();
    }

    /**
     * Check if identifier belongs to a user
     */
    public boolean isUser(String identifier) {
        return findUserByEmail(identifier).isPresent();
    }

    /**
     * Get user type for logging/debugging purposes
     */
    public String getUserType(String identifier) {
        if (isAdmin(identifier)) {
            return "ADMIN";
        } else if (isUser(identifier)) {
            return "USER";
        } else {
            return "UNKNOWN";
        }
    }
}
