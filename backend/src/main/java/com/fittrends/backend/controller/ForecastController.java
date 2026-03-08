package com.fittrends.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {

    private static final String ML_SERVER_URL = "http://localhost:5000/forecast";

    private final RestTemplate restTemplate;

    public ForecastController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Proxies the forecast request to the Python Flask ML server.
     * The Flask server reads live data from MongoDB, runs the VotingRegressor
     * ensemble model, and returns per-SKU demand forecasts as JSON.
     *
     * GET /api/forecast
     */
    @GetMapping
    public ResponseEntity<String> getForecast() {
        try {
            String result = restTemplate.getForObject(ML_SERVER_URL, String.class);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(result);
        } catch (ResourceAccessException e) {
            return ResponseEntity.status(503).body(
                "{\"error\": \"ML server is not running. Please start forecast.py on port 5000.\"}"
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                "{\"error\": \"" + e.getMessage().replace("\"", "'") + "\"}"
            );
        }
    }
}
