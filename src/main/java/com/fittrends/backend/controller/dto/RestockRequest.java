package com.fittrends.backend.controller.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RestockRequest {
    private String productId;
    private int quantity;
    private LocalDate receivedAt; 
    private String reason;       
}