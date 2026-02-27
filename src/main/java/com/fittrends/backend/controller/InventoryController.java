package com.fittrends.backend.controller;

import com.fittrends.backend.controller.dto.InventoryAgingResponse;
import com.fittrends.backend.controller.dto.RestockRequest;
import com.fittrends.backend.model.Inventory;
import com.fittrends.backend.service.InventoryAgingService;
import com.fittrends.backend.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryAgingService inventoryAgingService;

    public InventoryController(InventoryService inventoryService,
                               InventoryAgingService inventoryAgingService) {
        this.inventoryService = inventoryService;
        this.inventoryAgingService = inventoryAgingService;
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
    public ResponseEntity<Inventory> getInventoryById(@PathVariable String id) {
        return inventoryService.getInventoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get inventory by product ID
    @GetMapping("/product/{productId}")
    public ResponseEntity<Inventory> getInventoryByProductId(@PathVariable String productId) {
        return inventoryService.getInventoryByProductId(productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete inventory
    @DeleteMapping("/{id}")
    public void deleteInventory(@PathVariable String id) {
        inventoryService.deleteInventory(id);
    }

    // Get low stock items (running inventory at or below threshold)
    @GetMapping("/low-stock")
    public List<Inventory> getLowStockInventory(@RequestParam(defaultValue = "10") int threshold) {
        return inventoryService.getLowStockInventory(threshold);
    }

    /**
     * Restock inventory by productId and log it (for ageing).
     */
    @PostMapping("/restock")
    public ResponseEntity<Inventory> restock(@RequestBody RestockRequest request) {
        Inventory updated = inventoryService.restockByProductId(
                request.getProductId(),
                request.getQuantity(),
                request.getReceivedAt(),
                request.getReason()
        );
        return ResponseEntity.ok(updated);
    }

    /*
     * Inventory ageing breakdown for graphs.
     */
    @GetMapping("/ageing")
    public ResponseEntity<InventoryAgingResponse> getInventoryAgeing(
            @RequestParam(required = false) String asOf
    ) {
        LocalDate date = (asOf == null || asOf.isBlank()) ? null : LocalDate.parse(asOf);
        return ResponseEntity.ok(inventoryAgingService.getAging(date));
    }
}