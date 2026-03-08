package com.fittrends.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "inventory")
public class Inventory {

    @Id
    private String id;

    private String productId; // Reference to Product

    private int totalSold;
    private int runningInventory;

    public Inventory() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public int getTotalSold() { return totalSold; }
    public void setTotalSold(int totalSold) { this.totalSold = totalSold; }

    public int getRunningInventory() { return runningInventory; }
    public void setRunningInventory(int runningInventory) { this.runningInventory = runningInventory; }
}
