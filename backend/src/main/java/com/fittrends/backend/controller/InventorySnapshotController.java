package com.fittrends.backend.controller;

import com.fittrends.backend.model.InventorySnapshot;
import com.fittrends.backend.service.InventorySnapshotService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/inventory-snapshots")

public class InventorySnapshotController {

    private final InventorySnapshotService snapshotService;

    public InventorySnapshotController(InventorySnapshotService snapshotService) {
        this.snapshotService = snapshotService;
    }

    // Get all snapshots
    @GetMapping
    public List<InventorySnapshot> getAllSnapshots() {
        return snapshotService.getAllSnapshots();
    }

    // Get snapshot by ID
    @GetMapping("/{id}")
    public ResponseEntity<InventorySnapshot> getSnapshotById(@PathVariable String id) {
        return snapshotService.getSnapshotById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get snapshots by date
    @GetMapping("/date/{date}")
    public List<InventorySnapshot> getSnapshotsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return snapshotService.getSnapshotsByDate(date);
    }

    // Manually trigger snapshot (takes snapshot of current inventory)
    @PostMapping("/take")
    public List<InventorySnapshot> takeSnapshot() {
        return snapshotService.takeSnapshot();
    }
}
