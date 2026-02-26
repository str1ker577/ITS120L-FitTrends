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
}
