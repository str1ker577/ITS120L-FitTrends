package com.fittrends.backend.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class InventoryAgingResponse {
    private String asOf;
    private List<ProductAging> byProduct;
    private List<SizeAging> bySize;
}