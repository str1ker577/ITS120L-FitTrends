package com.fittrends.backend.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class ProductAging {
    private String productId;
    private String size;                 // from Product
    private Map<String, Integer> buckets;
    private double avgAgeDays;
    private int totalUnsold;
}