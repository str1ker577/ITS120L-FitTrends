package com.fittrends.backend.repository;

import com.fittrends.backend.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    List<Product> findByProductNameContainingIgnoreCase(String name);

    List<Product> findBySize(String size);

    List<Product> findByCollection(String collection);

    List<Product> findByProductNameContainingIgnoreCaseAndSize(String name, String size);
}
