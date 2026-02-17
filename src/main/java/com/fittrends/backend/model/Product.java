package com.fittrends.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String productName;
    private String collection;
    private String color;
    private List<String> sizes;
}
