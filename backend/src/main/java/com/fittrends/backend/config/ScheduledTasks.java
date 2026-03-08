package com.fittrends.backend.config;

import com.fittrends.backend.service.InventorySnapshotService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {

    private final InventorySnapshotService snapshotService;

    public ScheduledTasks(InventorySnapshotService snapshotService) {
        this.snapshotService = snapshotService;
    }

    /**
     * Runs every hour on the 1st day of every month.
     * Creates/updates inventory snapshots by copying runningInventory.
     * The snapshot continues to be updated throughout the 1st (restocking day).
     * After the 1st, the snapshot stays fixed as the basis for ML forecasting.
     */
    @Scheduled(cron = "0 0 * 1 * *")
    public void takeMonthlySnapshot() {
        snapshotService.takeSnapshot();
    }
}
