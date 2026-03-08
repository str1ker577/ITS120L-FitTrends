package com.fittrends.backend.controller;

import com.fittrends.backend.model.User;
import com.fittrends.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        // Strip out passwords before returning to client!
        List<User> users = userRepository.findAll();
        users.forEach(user -> user.setPassword(null));
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        // Prevent duplicate emails
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email is already registered.");
        }
        
        // In reality, hash the password here.
        User savedUser = userRepository.save(user);
        savedUser.setPassword(null); // Don't return password
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Prevent deleting the main owner account
            if ("SUPER_ADMIN".equals(user.getRole()) || "owner@fittrends.com".equals(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cannot delete the master owner account.");
            }
            userRepository.deleteById(id);
            return ResponseEntity.ok("User deleted successfully.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
    }
}
