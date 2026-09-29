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
    public UserDetails loadUserByUsername(String name) throws UsernameNotFoundException {
        // Staff sign in by username, customers by email. An email is never looked up
        // among staff, so a customer can't become an admin by reusing an admin's email.
        Optional<Admin> admin = adminRepository.findByUsername(name);
        if (admin.isPresent()) return new Principal(admin.get(), name);
        return loadCustomer(name);
    }

    /** A manager, by the username in a staff token. */
    public UserDetails loadStaff(String username) throws UsernameNotFoundException {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("No staff account " + username));
        return new Principal(admin, username);
    }

    /** A customer, by the email in a customer token. */
    public UserDetails loadCustomer(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("No customer account " + email));
        return new Principal(user);
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
