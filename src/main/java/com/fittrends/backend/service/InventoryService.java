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

    // Delete inventory
    public void deleteInventory(String id) {
        inventoryRepository.deleteById(id);
    }
}
