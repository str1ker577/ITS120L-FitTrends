package com.fittrends.backend.controller;

import com.fittrends.backend.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/export")

public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    // Export products CSV
    @GetMapping("/products")
    public ResponseEntity<byte[]> exportProducts() {
        byte[] csv = exportService.exportProductsCsv();
        return buildCsvResponse(csv, "products.csv");
    }

    // Export inventory CSV
    @GetMapping("/inventory")
    public ResponseEntity<byte[]> exportInventory() {
        byte[] csv = exportService.exportInventoryCsv();
        return buildCsvResponse(csv, "inventory.csv");
    }

    // Export orders CSV
    @GetMapping("/orders")
    public ResponseEntity<byte[]> exportOrders() {
        byte[] csv = exportService.exportOrdersCsv();
        return buildCsvResponse(csv, "orders.csv");
    }

    // Export order items CSV
    @GetMapping("/order-items")
    public ResponseEntity<byte[]> exportOrderItems() {
        byte[] csv = exportService.exportOrderItemsCsv();
        return buildCsvResponse(csv, "order_items.csv");
    }

    // Export buyers CSV
    @GetMapping("/buyers")
    public ResponseEntity<byte[]> exportBuyers() {
        byte[] csv = exportService.exportBuyersCsv();
        return buildCsvResponse(csv, "buyers.csv");
    }

    // Export inventory snapshots CSV
    @GetMapping("/inventory-snapshots")
    public ResponseEntity<byte[]> exportInventorySnapshots() {
        byte[] csv = exportService.exportInventorySnapshotsCsv();
        return buildCsvResponse(csv, "inventory_snapshots.csv");
    }

    // Export ALL entities as a ZIP of CSVs
    @GetMapping("/all")
    public ResponseEntity<byte[]> exportAll() throws IOException {
        byte[] zip = exportService.exportAllCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=fittrends_export.zip")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(zip);
    }

    // Helper to build CSV download response
    private ResponseEntity<byte[]> buildCsvResponse(byte[] data, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }
}
