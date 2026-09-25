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

        // Admin JWTs carry the admin's username (not email) as their subject
        Optional<Admin> adminByUsername = adminRepository.findByUsername(email);
        if (adminByUsername.isPresent()) {
            logger.info("Found ADMIN with username {}", email);
            return new Principal(adminByUsername.get(), email);
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
            this(admin, admin.getEmail());
        }

        /** principalName is what getUsername() returns; it must match the JWT subject. */
        public Principal(Admin admin, String principalName) {
            this.email      = principalName;
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
