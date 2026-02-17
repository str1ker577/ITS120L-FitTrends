package com.fittrends.backend.controller;

import com.fittrends.backend.model.Platform;
import com.fittrends.backend.service.PlatformService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/platforms")
@CrossOrigin(origins = "*")
public class PlatformController {

    private final PlatformService platformService;

    public PlatformController(PlatformService platformService) {
        this.platformService = platformService;
    }

    @PostMapping
    public Platform savePlatform(@RequestBody Platform platform) {
        return platformService.savePlatform(platform);
    }

    @GetMapping
    public List<Platform> getAllPlatforms() {
        return platformService.getAllPlatforms();
    }

    @GetMapping("/{id}")
    public Optional<Platform> getPlatformById(@PathVariable String id) {
        return platformService.getPlatformById(id);
    }

    @DeleteMapping("/{id}")
    public void deletePlatform(@PathVariable String id) {
        platformService.deletePlatform(id);
    }
}
