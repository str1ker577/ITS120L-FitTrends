package com.fittrends.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "inventory_snapshots")
public class InventorySnapshot {

    @Id
    private String id;

    private LocalDate snapshotDate; // The date of the snapshot (1st of the month)
    private String inventoryId; // FK → Inventory
    private String productId; // FK → Product
    private int quantityOnHand; // Copied from Inventory.runningInventory on 1st of month

    public InventorySnapshot() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public LocalDate getSnapshotDate() { return snapshotDate; }
    public void setSnapshotDate(LocalDate snapshotDate) { this.snapshotDate = snapshotDate; }

    public String getInventoryId() { return inventoryId; }
    public void setInventoryId(String inventoryId) { this.inventoryId = inventoryId; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public int getQuantityOnHand() { return quantityOnHand; }
    public void setQuantityOnHand(int quantityOnHand) { this.quantityOnHand = quantityOnHand; }
}
