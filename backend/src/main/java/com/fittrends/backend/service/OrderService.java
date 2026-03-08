package com.fittrends.backend.service;

import com.fittrends.backend.model.Inventory;
import com.fittrends.backend.model.Order;
import com.fittrends.backend.model.OrderItem;
import com.fittrends.backend.repository.InventoryRepository;
import com.fittrends.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;

    public OrderService(OrderRepository orderRepository, InventoryRepository inventoryRepository) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Create a new order. Validates stock availability for each item,
     * deducts runningInventory, and increments totalSold.
     * Orders are immutable once created — no update or delete.
     */
    public Order createOrder(Order order) {
        // Validate stock for each order item before saving
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Inventory inventory = inventoryRepository.findByProductId(item.getProductId())
                        .orElseThrow(() -> new RuntimeException(
                                "No inventory found for product: " + item.getProductId()));

                if (inventory.getRunningInventory() < item.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for product " + item.getProductId()
                            + ". Available: " + inventory.getRunningInventory()
                            + ", Requested: " + item.getQuantity());
                }
            }

            // All validations passed — now deduct stock
            for (OrderItem item : order.getItems()) {
                Inventory inventory = inventoryRepository.findByProductId(item.getProductId()).get();
                inventory.setRunningInventory(inventory.getRunningInventory() - item.getQuantity());
                inventory.setTotalSold(inventory.getTotalSold() + item.getQuantity());
                inventoryRepository.save(inventory);
            }
        }

        return orderRepository.save(order);
    }

    // Get all orders (sorted newest first)
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    // Get order by ID
    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    // Filter by platform
    public List<Order> getOrdersByPlatform(String platform) {
        return orderRepository.findByPlatformOrderByOrderDateDesc(platform);
    }

    // Filter by month and year
    public List<Order> getOrdersByMonth(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return orderRepository.findByOrderDateBetween(start, end);
    }

    // Filter by platform + month/year
    public List<Order> getOrdersByPlatformAndMonth(String platform, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return orderRepository.findByPlatformAndOrderDateBetween(platform, start, end);
    }

    // No deleteOrder — orders are immutable
}
