package com.fittrends.backend.controller;

import com.fittrends.backend.model.User;
import com.fittrends.backend.repository.UserRepository;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // In a real application, use a PasswordEncoder (e.g., BCrypt) here
            if (user.getPassword().equals(request.getPassword())) {
                return ResponseEntity.ok(new AuthResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getName(),
                        user.getRole(),
                        "mock-jwt-token-123" // Placeholder for an actual JWT
                ));
            }
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String id;
        private String email;
        private String name;
        private String role;
        private String token;

        public AuthResponse(String id, String email, String name, String role, String token) {
            this.id = id;
            this.email = email;
            this.name = name;
            this.role = role;
            this.token = token;
        }
    }
}
