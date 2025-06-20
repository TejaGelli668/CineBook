package com.example.adminbackend.config;

import com.example.adminbackend.security.JwtAuthenticationEntryPoint;
import com.example.adminbackend.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
import java.util.List;

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
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // disable CSRF
                .csrf(AbstractHttpConfigurer::disable)
                // enable CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // stateless session
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // 1) PUBLIC AUTH ENDPOINTS - MUST BE FIRST!
                        .requestMatchers(HttpMethod.POST,
                                "/auth/login",           // Admin login
                                "/api/auth/login"        // Admin login with /api prefix
                        ).permitAll()

                        // 2) Public health and setup endpoints (MUST BE PERMITALL!)
                        .requestMatchers(
                                "/auth/health",
                                "/api/auth/health",
                                "/setup/**",
                                "/api/setup/**",
                                "/setup/create-admin",
                                "/setup/admin-exists",
                                "/setup/health"
                        ).permitAll()

                        // 3) static uploads
                        .requestMatchers("/uploads/**").permitAll()

                        // 4) public movie endpoints
                        .requestMatchers(HttpMethod.GET,
                                "/movies", "/movies/**",
                                "/api/movies", "/api/movies/**"
                        ).permitAll()

                        // 5) public user login & registration
                        .requestMatchers(HttpMethod.POST,
                                "/user/login",
                                "/user/register",
                                "/api/user/login",
                                "/api/user/register"
                        ).permitAll()

                        // 6) test endpoints
                        .requestMatchers(
                                "/test/**",
                                "/api/test/**"
                        ).permitAll()

                        // 7a) authenticated GET /api/user/me
                        .requestMatchers(HttpMethod.GET,
                                "/user/me",
                                "/api/user/me"
                        ).authenticated()

                        // 7b) authenticated PUT profile routes
                        .requestMatchers(HttpMethod.PUT,
                                "/user/profile",
                                "/user/change-password",
                                "/user/upload-profile-picture",
                                "/api/user/profile",
                                "/api/user/change-password",
                                "/api/user/upload-profile-picture"
                        ).authenticated()

                        // 8) admin-only endpoints
                        .requestMatchers(HttpMethod.GET,
                                "/auth/me",
                                "/auth/validate",
                                "/api/auth/me",
                                "/api/auth/validate"
                        ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                        .requestMatchers(HttpMethod.POST,
                                "/auth/logout",
                                "/api/auth/logout"
                        ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // 9) admin-only user management
                        .requestMatchers(HttpMethod.GET,
                                "/user/all",
                                "/user/stats",
                                "/api/user/all",
                                "/api/user/stats"
                        ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                        .requestMatchers(HttpMethod.DELETE,
                                "/user/{id}",
                                "/api/user/{id}"
                        ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // 10) everything else requires authentication
                        .anyRequest().authenticated()
                )

                // exception handling & JWT filter
                .exceptionHandling(e -> e.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of("*"));
        cfg.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}