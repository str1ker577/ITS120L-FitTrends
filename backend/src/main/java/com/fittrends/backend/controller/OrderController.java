package com.fittrends.backend.controller;

import com.fittrends.backend.model.Order;
import com.fittrends.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")

public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Create order (validates stock, deducts inventory — immutable once created)
    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return orderService.createOrder(order);
    }

    // Get all orders (sorted newest first)
    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Filter orders by platform, year, month (all optional)
    @GetMapping("/filter")
    public List<Order> filterOrders(
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        if (platform != null && year != null && month != null) {
            return orderService.getOrdersByPlatformAndMonth(platform, year, month);
        }
        if (platform != null) {
            return orderService.getOrdersByPlatform(platform);
        }
        if (year != null && month != null) {
            return orderService.getOrdersByMonth(year, month);
        }
        return orderService.getAllOrders();
    }

    // No PUT or DELETE — orders are immutable
}
