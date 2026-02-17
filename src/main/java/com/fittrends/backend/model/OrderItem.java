package com.fittrends.backend.model;

import lombok.Data;

@Data
public class OrderItem {

    private String productId;
    private String size;
    private int quantity;
}
