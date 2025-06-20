//package com.example.adminbackend.service;
//
//import com.example.adminbackend.entity.User;
//import com.example.adminbackend.repository.UserRepository;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//import java.util.Collection;
//import java.util.Collections;
//import java.util.Optional;
//
//@Service
//public class CustomUserDetailsService implements UserDetailsService {
//
//    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Override
//    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
//        logger.info("Loading user by email: {}", email);
//
//        Optional<User> userOpt = userRepository.findByEmail(email);
//        if (userOpt.isEmpty()) {
//            logger.error("User not found with email: {}", email);
//            throw new UsernameNotFoundException("User not found with email: " + email);
//        }
//
//        User user = userOpt.get();
//        logger.info("User found: {}", user.getEmail());
//
//        // Convert our User entity to Spring Security UserDetails
//        return new CustomUserPrincipal(user);
//    }
//
//    /**
//     * Custom UserDetails implementation
//     */
//    public static class CustomUserPrincipal implements UserDetails {
//        private final User user;
//
//        public CustomUserPrincipal(User user) {
//            this.user = user;
//        }
//
//        @Override
//        public Collection<? extends GrantedAuthority> getAuthorities() {
//            // Convert user role to Spring Security authority
//            String roleName = "ROLE_" + user.getRole().name();
//            return Collections.singletonList(new SimpleGrantedAuthority(roleName));
//        }
//
//        @Override
//        public String getPassword() {
//            return user.getPassword();
//        }
//
//        @Override
//        public String getUsername() {
//            return user.getEmail();
//        }
//
//        @Override
//        public boolean isAccountNonExpired() {
//            return true;
//        }
//
//        @Override
//        public boolean isAccountNonLocked() {
//            return true;
//        }
//
//        @Override
//        public boolean isCredentialsNonExpired() {
//            return true;
//        }
//
//        @Override
//        public boolean isEnabled() {
//            return user.getIsActive();
//        }
//
//        // Method to get the original User entity
//        public User getUser() {
//            return user;
//        }
//
//        // Helper methods
//        public Long getId() {
//            return user.getId();
//        }
//
//        public String getEmail() {
//            return user.getEmail();
//        }
//
//        public String getFirstName() {
//            return user.getFirstName();
//        }
//
//        public String getLastName() {
//            return user.getLastName();
//        }
//
//        public User.Role getRole() {
//            return user.getRole();
//        }
//    }
//}
//package com.example.adminbackend.service;
//
//import com.example.adminbackend.entity.User;
//import com.example.adminbackend.entity.Admin;
//import com.example.adminbackend.repository.UserRepository;
//import com.example.adminbackend.repository.AdminRepository;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//import java.util.Collection;
//import java.util.Collections;
//import java.util.Optional;
//
//@Service
//public class CustomUserDetailsService implements UserDetailsService {
//
//    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private AdminRepository adminRepository;
//
//    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        logger.info("Authenticating principal: {}", username);
//
//        // 1) Try regular users by email
//        Optional<User> userOpt = userRepository.findByEmail(username);
//        if (userOpt.isPresent()) {
//            logger.info("Found USER with email {}", username);
//            return new CustomUserPrincipal(userOpt.get());
//        }
//
//        // 2) Otherwise try admins by username
//        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
//        if (adminOpt.isPresent()) {
//            logger.info("Found ADMIN with username {}", username);
//            return new CustomUserPrincipal(adminOpt.get());
//        }
//
//        logger.error("No user or admin found with identifier: {}", username);
//        throw new UsernameNotFoundException("No account found for: " + username);
//    }
//
//    /**
//     * Wraps either a User *or* an Admin as a Spring‐Security principal.
//     */
//    public static class CustomUserPrincipal implements UserDetails {
//        private final User user;
//        private final Admin admin;
//
//        public CustomUserPrincipal(User user) {
//            this.user = user;
//            this.admin = null;
//        }
//
//        public CustomUserPrincipal(Admin admin) {
//            this.admin = admin;
//            this.user = null;
//        }
//
//        @Override
//        public Collection<? extends GrantedAuthority> getAuthorities() {
//            String roleName;
//            if (user != null) {
//                roleName = "ROLE_" + user.getRole().name();
//            } else {
//                roleName = "ROLE_" + admin.getRole().name();
//            }
//            return Collections.singletonList(new SimpleGrantedAuthority(roleName));
//        }
//
//        @Override
//        public String getPassword() {
//            return (user != null) ? user.getPassword() : admin.getPassword();
//        }
//
//        @Override
//        public String getUsername() {
//            // Users log in by email, admins by their username field
//            return (user != null) ? user.getEmail() : admin.getUsername();
//        }
//
//        @Override
//        public boolean isAccountNonExpired() {
//            return true;
//        }
//
//        @Override
//        public boolean isAccountNonLocked() {
//            return true;
//        }
//
//        @Override
//        public boolean isCredentialsNonExpired() {
//            return true;
//        }
//
//        @Override
//        public boolean isEnabled() {
//            return (user != null) ? user.getIsActive() : admin.getIsActive();
//        }
//
//        // Optionally expose the wrapped entity:
//        public User getUser() { return user; }
//        public Admin getAdmin() { return admin; }
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
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.info("Attempting to load principal for email: {}", email);

        // First try Admins
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            logger.info("Found ADMIN with email {}", email);
            return new Principal(admin);
        }

        // Then try regular Users
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            logger.info("Found USER with email {}", email);
            return new Principal(user);
        }

        logger.error("No user or admin found with email {}", email);
        throw new UsernameNotFoundException("No account found for " + email);
    }

    /**
     * A single Principal class that can wrap either an Admin or a User.
     */
    public static class Principal implements UserDetails {
        private final String email, password;
        private final String roleName;
        private final boolean active;

        public Principal(Admin admin) {
            this.email      = admin.getEmail();
            this.password   = admin.getPassword();
            this.roleName   = "ROLE_" + admin.getRole().name();
            this.active     = admin.getIsActive();
        }

        public Principal(User user) {
            this.email      = user.getEmail();
            this.password   = user.getPassword();
            this.roleName   = "ROLE_" + user.getRole().name();
            this.active     = user.getIsActive();
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return Collections.singletonList(new SimpleGrantedAuthority(roleName));
        }

        @Override
        public String getPassword() {
            return password;
        }

        @Override
        public String getUsername() {
            return email;
        }

        @Override
        public boolean isAccountNonExpired() {
            return true;
        }

        @Override
        public boolean isAccountNonLocked() {
            return true;
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }

        @Override
        public boolean isEnabled() {
            return active;
        }
    }
}
