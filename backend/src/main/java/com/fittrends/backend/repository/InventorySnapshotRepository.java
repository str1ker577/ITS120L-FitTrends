package com.fittrends.backend.repository;

import com.fittrends.backend.model.InventorySnapshot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventorySnapshotRepository extends MongoRepository<InventorySnapshot, String> {

    List<InventorySnapshot> findBySnapshotDate(LocalDate snapshotDate);

    List<InventorySnapshot> findByInventoryId(String inventoryId);

    Optional<InventorySnapshot> findBySnapshotDateAndInventoryId(LocalDate snapshotDate, String inventoryId);
}
