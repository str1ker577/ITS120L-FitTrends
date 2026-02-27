package com.fittrends.backend.service;

import com.fittrends.backend.model.Inventory;
import com.fittrends.backend.model.RestockLog;
import com.fittrends.backend.repository.InventoryRepository;
import com.fittrends.backend.repository.RestockLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final RestockLogRepository restockLogRepository;

    public InventoryService(InventoryRepository inventoryRepository,
                            RestockLogRepository restockLogRepository) {
        this.inventoryRepository = inventoryRepository;
        this.restockLogRepository = restockLogRepository;
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

    // Increase stock (restocking) - existing behavior kept the same (NO logging here)
    public void increaseStock(String inventoryId, int quantity) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory not found: " + inventoryId));

        inventory.setRunningInventory(inventory.getRunningInventory() + quantity);
        inventoryRepository.save(inventory);
    }

    /*
     New: Restock by productId and log it for inventory ageing.
    */
    public Inventory restockByProductId(String productId, int quantity, LocalDate receivedAt, String reason) {
        if (productId == null || productId.isBlank()) {
            throw new RuntimeException("productId is required");
        }
        if (quantity <= 0) {
            throw new RuntimeException("quantity must be > 0");
        }

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for productId: " + productId));

        // 1) update running inventory
        inventory.setRunningInventory(inventory.getRunningInventory() + quantity);
        Inventory saved = inventoryRepository.save(inventory);

        // 2) log restock
        RestockLog log = new RestockLog();
        log.setProductId(productId);
        log.setQuantity(quantity);
        log.setReceivedAt(receivedAt != null ? receivedAt : LocalDate.now());
        log.setReason((reason != null && !reason.isBlank()) ? reason : "RESTOCK");
        log.setCreatedAt(LocalDateTime.now());
        restockLogRepository.save(log);

        return saved;
    }
}