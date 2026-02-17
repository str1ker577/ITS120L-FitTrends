package com.fittrends.backend.service;

import com.fittrends.backend.model.Platform;
import com.fittrends.backend.repository.PlatformRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlatformService {

    private final PlatformRepository platformRepository;

    public PlatformService(PlatformRepository platformRepository) {
        this.platformRepository = platformRepository;
    }

    public Platform savePlatform(Platform platform) {
        return platformRepository.save(platform);
    }

    public List<Platform> getAllPlatforms() {
        return platformRepository.findAll();
    }

    public Optional<Platform> getPlatformById(String id) {
        return platformRepository.findById(id);
    }

    public void deletePlatform(String id) {
        platformRepository.deleteById(id);
    }
}
