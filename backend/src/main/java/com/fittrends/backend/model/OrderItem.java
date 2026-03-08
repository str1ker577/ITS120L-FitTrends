package com.fittrends.backend.model;

import lombok.Data;

@Data
public class OrderItem {

    private String productId; // References a specific Product (which already has a size)
    private int quantity;

    public OrderItem() {}

    public OrderItem(String productId, int quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
