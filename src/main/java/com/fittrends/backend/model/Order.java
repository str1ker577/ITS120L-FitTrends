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
    private String platformId;

    private LocalDate orderDate;
    private LocalDate deliveryDate;

    private double grossAmount;
    private double platformDiscount;
    private double netSales;

    private List<OrderItem> items;
}
