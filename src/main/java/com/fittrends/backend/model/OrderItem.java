package com.fittrends.backend.model;

import lombok.Data;

@Data
public class OrderItem {

    private String productId; // References a specific Product (which already has a size)
    private int quantity;
}
