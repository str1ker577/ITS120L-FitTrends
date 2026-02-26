package com.fittrends.backend.service;

import com.fittrends.backend.model.*;
import com.fittrends.backend.repository.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class ExportService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderRepository orderRepository;
    private final BuyerRepository buyerRepository;
    private final InventorySnapshotRepository snapshotRepository;

    public ExportService(ProductRepository productRepository,
            InventoryRepository inventoryRepository,
            OrderRepository orderRepository,
            BuyerRepository buyerRepository,
            InventorySnapshotRepository snapshotRepository) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.orderRepository = orderRepository;
        this.buyerRepository = buyerRepository;
        this.snapshotRepository = snapshotRepository;
    }

    // ── Products CSV ──────────────────────────────────────────────────

    public byte[] exportProductsCsv() {
        List<Product> products = productRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("product_id,product_name,collection,color,size\n");
        for (Product p : products) {
            sb.append(escapeCsv(p.getId())).append(",");
            sb.append(escapeCsv(p.getProductName())).append(",");
            sb.append(escapeCsv(p.getCollection())).append(",");
            sb.append(escapeCsv(p.getColor())).append(",");
            sb.append(escapeCsv(p.getSize())).append("\n");
        }
        return sb.toString().getBytes();
    }

    // ── Inventory CSV ─────────────────────────────────────────────────

    public byte[] exportInventoryCsv() {
        List<Inventory> inventories = inventoryRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("inventory_id,product_id,total_sold,running_inventory\n");
        for (Inventory inv : inventories) {
            sb.append(escapeCsv(inv.getId())).append(",");
            sb.append(escapeCsv(inv.getProductId())).append(",");
            sb.append(inv.getTotalSold()).append(",");
            sb.append(inv.getRunningInventory()).append("\n");
        }
        return sb.toString().getBytes();
    }

    // ── Orders CSV (flattened: one row per order item) ────────────────

    public byte[] exportOrdersCsv() {
        List<Order> orders = orderRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("order_id,order_date,delivery_date,buyer_id,platform,");
        sb.append("gross_amount,platform_discount,net_sales,");
        sb.append("item_product_id,item_quantity\n");

        for (Order o : orders) {
            if (o.getItems() != null && !o.getItems().isEmpty()) {
                for (OrderItem item : o.getItems()) {
                    appendOrderRow(sb, o);
                    sb.append(escapeCsv(item.getProductId())).append(",");
                    sb.append(item.getQuantity()).append("\n");
                }
            } else {
                // Order with no items
                appendOrderRow(sb, o);
                sb.append(",").append("\n");
            }
        }
        return sb.toString().getBytes();
    }

    private void appendOrderRow(StringBuilder sb, Order o) {
        sb.append(escapeCsv(o.getId())).append(",");
        sb.append(o.getOrderDate()).append(",");
        sb.append(o.getDeliveryDate()).append(",");
        sb.append(escapeCsv(o.getBuyerId())).append(",");
        sb.append(escapeCsv(o.getPlatform())).append(",");
        sb.append(o.getGrossAmount()).append(",");
        sb.append(o.getPlatformDiscount()).append(",");
        sb.append(o.getNetSales()).append(",");
    }

    // ── Buyers CSV ────────────────────────────────────────────────────

    public byte[] exportBuyersCsv() {
        List<Buyer> buyers = buyerRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("buyer_id,buyer_name,town,province\n");
        for (Buyer b : buyers) {
            sb.append(escapeCsv(b.getId())).append(",");
            sb.append(escapeCsv(b.getBuyerName())).append(",");
            sb.append(escapeCsv(b.getTown())).append(",");
            sb.append(escapeCsv(b.getProvince())).append("\n");
        }
        return sb.toString().getBytes();
    }

    // ── Inventory Snapshots CSV ───────────────────────────────────────

    public byte[] exportInventorySnapshotsCsv() {
        List<InventorySnapshot> snapshots = snapshotRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("snapshot_id,snapshot_date,inventory_id,product_id,quantity_on_hand\n");
        for (InventorySnapshot s : snapshots) {
            sb.append(escapeCsv(s.getId())).append(",");
            sb.append(s.getSnapshotDate()).append(",");
            sb.append(escapeCsv(s.getInventoryId())).append(",");
            sb.append(escapeCsv(s.getProductId())).append(",");
            sb.append(s.getQuantityOnHand()).append("\n");
        }
        return sb.toString().getBytes();
    }

    // ── Order Items CSV (dedicated, flat table) ───────────────────────

    public byte[] exportOrderItemsCsv() {
        List<Order> orders = orderRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("order_id,product_id,quantity\n");
        for (Order o : orders) {
            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    sb.append(escapeCsv(o.getId())).append(",");
                    sb.append(escapeCsv(item.getProductId())).append(",");
                    sb.append(item.getQuantity()).append("\n");
                }
            }
        }
        return sb.toString().getBytes();
    }

    // ── Export All as ZIP ─────────────────────────────────────────────

    public byte[] exportAllCsv() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            addZipEntry(zos, "products.csv", exportProductsCsv());
            addZipEntry(zos, "inventory.csv", exportInventoryCsv());
            addZipEntry(zos, "orders.csv", exportOrdersCsv());
            addZipEntry(zos, "order_items.csv", exportOrderItemsCsv());
            addZipEntry(zos, "buyers.csv", exportBuyersCsv());
            addZipEntry(zos, "inventory_snapshots.csv", exportInventorySnapshotsCsv());
        }
        return baos.toByteArray();
    }

    private void addZipEntry(ZipOutputStream zos, String filename, byte[] data) throws IOException {
        ZipEntry entry = new ZipEntry(filename);
        zos.putNextEntry(entry);
        zos.write(data);
        zos.closeEntry();
    }

    // ── CSV Helper ────────────────────────────────────────────────────

    private String escapeCsv(String value) {
        if (value == null)
            return "";
        // If value contains comma, quote, or newline — wrap in quotes and escape quotes
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
