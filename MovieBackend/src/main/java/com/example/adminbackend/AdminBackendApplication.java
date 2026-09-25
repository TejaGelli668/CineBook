package com.example.adminbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class AdminBackendApplication {

	/**
	 * All times in CineBook are Hyderabad times (show times, seat holds, "today",
	 * refund cut-offs, the nightly cleanup), whatever zone the server runs in.
	 * Keep in step with app.time-zone in application.properties.
	 */
	public static final String CINEMA_TIME_ZONE = "Asia/Kolkata";

	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone(CINEMA_TIME_ZONE));
		SpringApplication.run(AdminBackendApplication.class, args);
	}

}
