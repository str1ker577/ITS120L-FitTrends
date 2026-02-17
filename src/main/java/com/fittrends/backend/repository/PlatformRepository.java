package com.fittrends.backend.repository;

import com.fittrends.backend.model.Platform;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformRepository extends MongoRepository<Platform, String> {

}

