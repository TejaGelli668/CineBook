package com.example.adminbackend.service;

import com.example.adminbackend.entity.User;
import com.example.adminbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/** The signed-in customer for the current request (from the JWT). */
@Service
public class CurrentUserService {

    @Autowired
    private UserRepository userRepository;

    public User require() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new IllegalStateException("Sign in to continue");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Sign in with a customer account to book"));
    }
}
