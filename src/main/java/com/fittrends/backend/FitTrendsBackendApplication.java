package com.fittrends.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FitTrendsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(FitTrendsBackendApplication.class, args);
	}

}
