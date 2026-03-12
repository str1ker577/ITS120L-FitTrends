package com.fittrends.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/retrain")
public class RetrainController {

    @Value("${ml.server.url:http://localhost:5000}")
    private String mlServerUrl;

    private final RestTemplate restTemplate;

    public RetrainController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Proxies the retrain request to the Python Flask ML server.
     * The Flask server retrains the VotingRegressor on all available data
     * and returns MAE + records processed.
     *
     * POST /api/retrain
     */
    @PostMapping
    public ResponseEntity<String> retrain() {
        try {
            String url = mlServerUrl + "/retrain";

            // Send an empty POST body
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>("{}", headers);

            ResponseEntity<String> mlResponse = restTemplate.postForEntity(url, entity, String.class);

            return ResponseEntity.status(mlResponse.getStatusCode())
                    .header("Content-Type", "application/json")
                    .body(mlResponse.getBody());

        } catch (ResourceAccessException e) {
            return ResponseEntity.status(503).body(
                    "{\"error\": \"ML server is not running. Please start forecast.py on port 5000.\"}");
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage().replace("\"", "'") : "Unknown error";
            return ResponseEntity.status(500).body(
                    "{\"error\": \"" + msg + "\"}");
        }
    }
}
