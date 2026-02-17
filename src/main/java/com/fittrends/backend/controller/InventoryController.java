package com.fittrends.backend.controller;

import com.fittrends.backend.model.Inventory;
import com.fittrends.backend.service.InventoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // Create or update inventory
    @PostMapping
    public Inventory saveInventory(@RequestBody Inventory inventory) {
        return inventoryService.saveInventory(inventory);
    }

    // Get all inventory
    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    // Get inventory by ID
    @GetMapping("/{id}")
    public Optional<Inventory> getInventoryById(@PathVariable String id) {
        return inventoryService.getInventoryById(id);
    }

    // Delete inventory
    @DeleteMapping("/{id}")
    public void deleteInventory(@PathVariable String id) {
        inventoryService.deleteInventory(id);
    }
}
