package com.fittrends.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "restock_logs")
public class RestockLog {

    @Id
    private String id;

    private String productId;
    private int quantity;
    private LocalDate receivedAt;
    private String reason;
    private LocalDateTime createdAt;
}