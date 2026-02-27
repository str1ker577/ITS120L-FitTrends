package com.fittrends.backend.repository;

import com.fittrends.backend.model.RestockLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RestockLogRepository extends MongoRepository<RestockLog, String> {

    List<RestockLog> findByProductIdAndReceivedAtLessThanEqualOrderByReceivedAtAsc(String productId, LocalDate asOf);

    List<RestockLog> findByReceivedAtLessThanEqual(LocalDate asOf);
}