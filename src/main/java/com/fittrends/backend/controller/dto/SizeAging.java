package com.fittrends.backend.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class SizeAging {
    private String size;
    private Map<String, Integer> buckets;
    private double avgAgeDays;
    private int totalUnsold;
}