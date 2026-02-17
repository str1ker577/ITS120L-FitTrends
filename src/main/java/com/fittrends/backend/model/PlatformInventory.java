package com.fittrends.backend.model;

import lombok.Data;

@Data
public class PlatformInventory {

    private String platformName; // Shopee or Lazada
    private int soldQuantity;
    private int runningInventoryOnSite;
}
