package com.fittrends.backend.repository;

import com.fittrends.backend.model.Buyer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuyerRepository extends MongoRepository<Buyer, String> {

}
