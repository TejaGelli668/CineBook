package com.example.adminbackend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * Supabase publishes every table in the public schema through its REST API.
 * The migrations enable Row Level Security on CineBook's tables; this does the
 * same for Flyway's history table, which can't be altered while Flyway is using it.
 */
@Component
public class SupabaseLockdown implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(SupabaseLockdown.class);

    private final DataSource dataSource;

    public SupabaseLockdown(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        try (Connection c = dataSource.getConnection()) {
            if (!"PostgreSQL".equalsIgnoreCase(c.getMetaData().getDatabaseProductName())) return;
        } catch (Exception e) {
            return;
        }
        try {
            new JdbcTemplate(dataSource).execute(
                    "alter table if exists flyway_schema_history enable row level security");
            logger.info("Row Level Security enabled on flyway_schema_history");
        } catch (Exception e) {
            logger.warn("Could not lock down flyway_schema_history: {}", e.getMessage());
        }
    }
}
