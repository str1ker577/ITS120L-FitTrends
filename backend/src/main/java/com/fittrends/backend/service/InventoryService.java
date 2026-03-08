package com.fittrends.backend.service;

import com.fittrends.backend.model.Inventory;
import com.fittrends.backend.repository.InventoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    // Create or update inventory
    public Inventory saveInventory(Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    // Get all inventory records
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    // Get inventory by ID
    public Optional<Inventory> getInventoryById(String id) {
        return inventoryRepository.findById(id);
    }

    // Get inventory by product ID
    public Optional<Inventory> getInventoryByProductId(String productId) {
        return inventoryRepository.findByProductId(productId);
    }

    // Delete inventory
    public void deleteInventory(String id) {
        inventoryRepository.deleteById(id);
    }

    // Get low stock inventory (running inventory at or below threshold)
    public List<Inventory> getLowStockInventory(int threshold) {
        return inventoryRepository.findByRunningInventoryLessThanEqual(threshold);
    }

    // Reduce stock when an order is placed
    public void reduceStock(String inventoryId, int quantity) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory not found: " + inventoryId));

        if (inventory.getRunningInventory() < quantity) {
            throw new RuntimeException("Insufficient stock for inventory " + inventoryId
                    + ". Available: " + inventory.getRunningInventory() + ", Requested: " + quantity);
        }

        inventory.setRunningInventory(inventory.getRunningInventory() - quantity);
        inventory.setTotalSold(inventory.getTotalSold() + quantity);
        inventoryRepository.save(inventory);
    }

    // Increase stock (restocking)
    public void increaseStock(String inventoryId, int quantity) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory not found: " + inventoryId));

        inventory.setRunningInventory(inventory.getRunningInventory() + quantity);
        inventoryRepository.save(inventory);
    }
}
