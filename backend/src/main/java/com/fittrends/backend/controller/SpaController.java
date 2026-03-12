package com.fittrends.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

/**
 * Serves index.html for any non-API, non-static route so React Router
 * handles client-side navigation correctly when deployed as a SPA.
 */
@RestController
public class SpaController {

    @GetMapping(value = { "/", "/{path:[^\\.]*}", "/{path:[^\\.]*}/**" })
    public ResponseEntity<Resource> serveReact(HttpServletRequest request) throws IOException {
        String uri = request.getRequestURI();
        // Don't intercept API calls or static assets
        if (uri.startsWith("/api/") || uri.contains(".")) {
            return ResponseEntity.notFound().build();
        }
        Resource index = new ClassPathResource("static/index.html");
        if (!index.exists()) {
            // If frontend hasn't been built yet, return 404 gracefully
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(index);
    }
}
