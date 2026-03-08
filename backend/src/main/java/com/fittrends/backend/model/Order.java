package com.fittrends.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Data
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String buyerId;
    private String platform; // "SHOPEE" or "LAZADA"

    private LocalDate orderDate;
    private LocalDate deliveryDate;

    private double grossAmount;
    private double platformDiscount;
    private double netSales;

    private List<OrderItem> items;

    public Order() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }

    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }

    public double getGrossAmount() { return grossAmount; }
    public void setGrossAmount(double grossAmount) { this.grossAmount = grossAmount; }

    public double getPlatformDiscount() { return platformDiscount; }
    public void setPlatformDiscount(double platformDiscount) { this.platformDiscount = platformDiscount; }

    public double getNetSales() { return netSales; }
    public void setNetSales(double netSales) { this.netSales = netSales; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
