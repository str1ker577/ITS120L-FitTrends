package com.fittrends.backend.config;

import com.fittrends.backend.model.User;
import com.fittrends.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private final UserRepository userRepository;

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            logger.info("No users found in database. Initializing default owner account...");
            
            User owner = User.builder()
                    .email("owner@fittrends.com")
                    // Note: In a production app, this should be encoded via PasswordEncoder
                    .password("admin123")
                    .name("Store Owner")
                    .role("SUPER_ADMIN")
                    .build();
                    
            userRepository.save(owner);
            logger.info("Default owner account created (email: owner@fittrends.com)");
        }
    }
}
