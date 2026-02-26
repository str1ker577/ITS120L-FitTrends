package com.fittrends.backend.service;

import com.fittrends.backend.model.Product;
import com.fittrends.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Create or update product
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    // Get all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Get product by ID
    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    // Delete product
    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    // Search products by name (partial, case-insensitive)
    public List<Product> searchProducts(String name) {
        return productRepository.findByProductNameContainingIgnoreCase(name);
    }

    // Filter products by size
    public List<Product> getProductsBySize(String size) {
        return productRepository.findBySize(size);
    }

    // Filter products by collection
    public List<Product> getProductsByCollection(String collection) {
        return productRepository.findByCollection(collection);
    }

    // Search products by name and filter by size
    public List<Product> searchProductsByNameAndSize(String name, String size) {
        return productRepository.findByProductNameContainingIgnoreCaseAndSize(name, size);
    }
}
