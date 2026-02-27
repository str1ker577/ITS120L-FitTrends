package com.fittrends.backend.service;

import com.fittrends.backend.controller.dto.InventoryAgingResponse;
import com.fittrends.backend.controller.dto.ProductAging;
import com.fittrends.backend.controller.dto.SizeAging;
import com.fittrends.backend.model.Inventory;
import com.fittrends.backend.model.Order;
import com.fittrends.backend.model.OrderItem;
import com.fittrends.backend.model.Product;
import com.fittrends.backend.model.RestockLog;
import com.fittrends.backend.repository.InventoryRepository;
import com.fittrends.backend.repository.OrderRepository;
import com.fittrends.backend.repository.ProductRepository;
import com.fittrends.backend.repository.RestockLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class InventoryAgingService {

    private final InventoryRepository inventoryRepository;
    private final RestockLogRepository restockLogRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public InventoryAgingService(
            InventoryRepository inventoryRepository,
            RestockLogRepository restockLogRepository,
            OrderRepository orderRepository,
            ProductRepository productRepository
    ) {
        this.inventoryRepository = inventoryRepository;
        this.restockLogRepository = restockLogRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    private static class Batch {
        LocalDate receivedAt;
        int remainingQty;

        Batch(LocalDate receivedAt, int remainingQty) {
            this.receivedAt = receivedAt;
            this.remainingQty = remainingQty;
        }
    }

    private Map<String, Integer> emptyBuckets() {
        Map<String, Integer> m = new LinkedHashMap<>();
        m.put("0-7", 0);
        m.put("8-30", 0);
        m.put("31-60", 0);
        m.put("61-90", 0);
        m.put("91+", 0);
        return m;
    }

    private String bucketFor(int ageDays) {
        if (ageDays <= 7) return "0-7";
        if (ageDays <= 30) return "8-30";
        if (ageDays <= 60) return "31-60";
        if (ageDays <= 90) return "61-90";
        return "91+";
    }

    public InventoryAgingResponse getAging(LocalDate asOf) {
        LocalDate effectiveAsOf = (asOf != null) ? asOf : LocalDate.now();

        List<Inventory> allInventory = inventoryRepository.findAll();
        List<ProductAging> byProduct = new ArrayList<>();

        // For aggregating by size
        Map<String, Map<String, Integer>> sizeBuckets = new HashMap<>();
        Map<String, Long> sizeWeightedAgeSum = new HashMap<>();
        Map<String, Long> sizeUnsoldTotal = new HashMap<>();

        for (Inventory inv : allInventory) {
            String productId = inv.getProductId();

            // Get size from Product 
            String size = productRepository.findById(productId)
                    .map(Product::getSize)
                    .orElse("UNKNOWN");

            ProductAging result = computeForProduct(productId, size, inv.getRunningInventory(), effectiveAsOf);
            byProduct.add(result);

            // Aggregate by size
            sizeBuckets.putIfAbsent(size, emptyBuckets());
            for (Map.Entry<String, Integer> e : result.getBuckets().entrySet()) {
                sizeBuckets.get(size).put(e.getKey(), sizeBuckets.get(size).get(e.getKey()) + e.getValue());
            }

            long w = Math.round(result.getAvgAgeDays() * result.getTotalUnsold());
            sizeWeightedAgeSum.put(size, sizeWeightedAgeSum.getOrDefault(size, 0L) + w);
            sizeUnsoldTotal.put(size, sizeUnsoldTotal.getOrDefault(size, 0L) + result.getTotalUnsold());
        }

        List<SizeAging> bySize = new ArrayList<>();
        for (String size : sizeBuckets.keySet()) {
            long total = sizeUnsoldTotal.getOrDefault(size, 0L);
            double avg = total == 0 ? 0.0 : (double) sizeWeightedAgeSum.getOrDefault(size, 0L) / total;
            bySize.add(new SizeAging(size, sizeBuckets.get(size), avg, (int) total));
        }

        byProduct.sort(Comparator.comparing(ProductAging::getProductId));
        bySize.sort(Comparator.comparing(SizeAging::getSize));

        return new InventoryAgingResponse(effectiveAsOf.toString(), byProduct, bySize);
    }

    private ProductAging computeForProduct(String productId, String size, int currentRunningInventory, LocalDate asOf) {
        // inbound batches
        List<RestockLog> restocks = restockLogRepository
                .findByProductIdAndReceivedAtLessThanEqualOrderByReceivedAtAsc(productId, asOf);

        // outbound orders (only those containing productId)
        List<Order> orders = orderRepository.findByOrderDateLessThanEqualAndItemsProductId(asOf, productId);

        int soldQty = 0;
        for (Order o : orders) {
            if (o.getItems() == null) continue;
            for (OrderItem it : o.getItems()) {
                if (productId.equals(it.getProductId())) {
                    soldQty += it.getQuantity();
                }
            }
        }

        // Build FIFO batches
        List<Batch> batches = new ArrayList<>();
        for (RestockLog r : restocks) {
            if (r.getQuantity() > 0) {
                batches.add(new Batch(r.getReceivedAt(), r.getQuantity()));
            }
        }

        if (batches.isEmpty() && currentRunningInventory > 0) {
            batches.add(new Batch(asOf, currentRunningInventory));
        }

        int remainingToConsume = soldQty;
        for (Batch b : batches) {
            if (remainingToConsume <= 0) break;
            int take = Math.min(b.remainingQty, remainingToConsume);
            b.remainingQty -= take;
            remainingToConsume -= take;
        }

        Map<String, Integer> buckets = emptyBuckets();
        long weightedAgeSum = 0;
        long unsoldTotal = 0;

        for (Batch b : batches) {
            if (b.remainingQty <= 0) continue;

            int ageDays = (int) ChronoUnit.DAYS.between(b.receivedAt, asOf);
            if (ageDays < 0) ageDays = 0;

            buckets.put(bucketFor(ageDays), buckets.get(bucketFor(ageDays)) + b.remainingQty);

            weightedAgeSum += (long) ageDays * b.remainingQty;
            unsoldTotal += b.remainingQty;
        }

        double avgAge = unsoldTotal == 0 ? 0.0 : (double) weightedAgeSum / unsoldTotal;

        return new ProductAging(productId, size, buckets, avgAge, (int) unsoldTotal);
    }
}