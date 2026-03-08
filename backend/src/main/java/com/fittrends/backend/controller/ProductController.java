package com.fittrends.backend.controller;

import com.fittrends.backend.model.Product;
import com.fittrends.backend.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")

public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Create or update product
    @PostMapping
    public Product saveProduct(@RequestBody Product product) {
        return productService.saveProduct(product);
    }

    // Get all products
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete product
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
    }

    // Search products by name (partial, case-insensitive)
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String name) {
        return productService.searchProducts(name);
    }

    // Filter products by size and/or collection
    @GetMapping("/filter")
    public List<Product> filterProducts(
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String collection,
            @RequestParam(required = false) String name) {

        if (name != null && size != null) {
            return productService.searchProductsByNameAndSize(name, size);
        }
        if (size != null) {
            return productService.getProductsBySize(size);
        }
        if (collection != null) {
            return productService.getProductsByCollection(collection);
        }
        if (name != null) {
            return productService.searchProducts(name);
        }
        return productService.getAllProducts();
    }
}
