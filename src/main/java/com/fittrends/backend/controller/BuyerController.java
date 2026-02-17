package com.fittrends.backend.controller;

import com.fittrends.backend.model.Buyer;
import com.fittrends.backend.service.BuyerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/buyers")
@CrossOrigin(origins = "*")
public class BuyerController {

    private final BuyerService buyerService;

    public BuyerController(BuyerService buyerService) {
        this.buyerService = buyerService;
    }

    @PostMapping
    public Buyer saveBuyer(@RequestBody Buyer buyer) {
        return buyerService.saveBuyer(buyer);
    }

    @GetMapping
    public List<Buyer> getAllBuyers() {
        return buyerService.getAllBuyers();
    }

    @GetMapping("/{id}")
    public Optional<Buyer> getBuyerById(@PathVariable String id) {
        return buyerService.getBuyerById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteBuyer(@PathVariable String id) {
        buyerService.deleteBuyer(id);
    }
}