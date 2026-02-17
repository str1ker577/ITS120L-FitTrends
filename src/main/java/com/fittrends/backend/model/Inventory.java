package com.fittrends.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Data
@Document(collection = "inventory")
public class Inventory {

    @Id
    private String id;

    private String productId; // Reference to Product

    private int startingInventory;
    private int totalSold;
    private int runningInventory;
    private String size;
    private LocalDate lastUpdated;

    // Embedded platform inventory (Shopee, Lazada)
    private List<PlatformInventory> platformInventories;
}
