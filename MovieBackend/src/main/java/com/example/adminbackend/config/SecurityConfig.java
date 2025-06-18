package com.example.adminbackend.config;

import com.example.adminbackend.security.JwtAuthenticationEntryPoint;
import com.example.adminbackend.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF
                .csrf(AbstractHttpConfigurer::disable)

                // Enable CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Set session management to stateless
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Configure authorization
                .authorizeHttpRequests(auth -> auth
                        // Allow static file access for profile pictures FIRST
                        .requestMatchers("/uploads/**").permitAll()

                        // Explicitly allow login endpoints - MOST IMPORTANT
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/auth/login").permitAll()

                        // Allow user registration and login - FIX: More specific patterns first
                        .requestMatchers("/api/user/register", "/api/user/login").permitAll()
                        .requestMatchers("/user/register", "/user/login").permitAll()

                        // Allow health check
                        .requestMatchers("/api/auth/health").permitAll()
                        .requestMatchers("/auth/health").permitAll()

                        // Allow test endpoints (remove in production)
                        .requestMatchers("/api/test/**").permitAll()
                        .requestMatchers("/test/**").permitAll()

                        // Allow setup endpoints (remove in production)
                        .requestMatchers("/api/setup/**").permitAll()
                        .requestMatchers("/setup/**").permitAll()

                        // User profile endpoints - require authentication
                        .requestMatchers("/api/user/me", "/api/user/profile", "/api/user/change-password",
                                "/api/user/upload-profile-picture", "/api/user/account").authenticated()
                        .requestMatchers("/user/me", "/user/profile", "/user/change-password",
                                "/user/upload-profile-picture", "/user/account").authenticated()

                        // Admin-only user management endpoints
                        .requestMatchers("/api/user/all", "/api/user/stats", "/api/user/{id}").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/user/all", "/user/stats", "/user/{id}").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // All other auth endpoints need authentication
                        .requestMatchers("/api/auth/**").authenticated()
                        .requestMatchers("/auth/**").authenticated()

                        // All other requests need authentication
                        .anyRequest().authenticated()
                )

                // Exception handling
                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))

                // Add authentication provider
                .authenticationProvider(authenticationProvider())

                // Add JWT filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}