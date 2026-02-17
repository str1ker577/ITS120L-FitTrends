package com.fittrends.backend.service;

import com.fittrends.backend.model.Buyer;
import com.fittrends.backend.repository.BuyerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BuyerService {

    private final BuyerRepository buyerRepository;

    public BuyerService(BuyerRepository buyerRepository) {
        this.buyerRepository = buyerRepository;
    }

    public Buyer saveBuyer(Buyer buyer) {
        return buyerRepository.save(buyer);
    }

    public List<Buyer> getAllBuyers() {
        return buyerRepository.findAll();
    }

    public Optional<Buyer> getBuyerById(String id) {
        return buyerRepository.findById(id);
    }

    public void deleteBuyer(String id) {
        buyerRepository.deleteById(id);
    }
}
