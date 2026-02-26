package com.fittrends.backend.service;

import com.fittrends.backend.model.Inventory;
import com.fittrends.backend.model.InventorySnapshot;
import com.fittrends.backend.repository.InventoryRepository;
import com.fittrends.backend.repository.InventorySnapshotRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class InventorySnapshotService {

    private final InventorySnapshotRepository snapshotRepository;
    private final InventoryRepository inventoryRepository;

    public InventorySnapshotService(InventorySnapshotRepository snapshotRepository,
            InventoryRepository inventoryRepository) {
        this.snapshotRepository = snapshotRepository;
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Take a snapshot of all inventory records for today.
     * On the 1st of the month (restocking day), this creates or updates snapshots
     * by copying runningInventory from each Inventory record.
     * After the 1st, snapshots remain fixed as the basis for ML forecasting.
     */
    public List<InventorySnapshot> takeSnapshot() {
        LocalDate today = LocalDate.now();

        List<Inventory> allInventory = inventoryRepository.findAll();

        for (Inventory inventory : allInventory) {
            Optional<InventorySnapshot> existing = snapshotRepository
                    .findBySnapshotDateAndInventoryId(today, inventory.getId());

            if (existing.isPresent()) {
                // Update existing snapshot for today
                InventorySnapshot snapshot = existing.get();
                snapshot.setQuantityOnHand(inventory.getRunningInventory());
                snapshotRepository.save(snapshot);
            } else {
                // Create new snapshot
                InventorySnapshot snapshot = new InventorySnapshot();
                snapshot.setSnapshotDate(today);
                snapshot.setInventoryId(inventory.getId());
                snapshot.setProductId(inventory.getProductId());
                snapshot.setQuantityOnHand(inventory.getRunningInventory());
                snapshotRepository.save(snapshot);
            }
        }

        return snapshotRepository.findBySnapshotDate(today);
    }

    // Get all snapshots
    public List<InventorySnapshot> getAllSnapshots() {
        return snapshotRepository.findAll();
    }

    // Get snapshots by date
    public List<InventorySnapshot> getSnapshotsByDate(LocalDate date) {
        return snapshotRepository.findBySnapshotDate(date);
    }

    // Get snapshots by inventory ID
    public List<InventorySnapshot> getSnapshotsByInventoryId(String inventoryId) {
        return snapshotRepository.findByInventoryId(inventoryId);
    }

    // Get snapshot by ID
    public Optional<InventorySnapshot> getSnapshotById(String id) {
        return snapshotRepository.findById(id);
    }
}
