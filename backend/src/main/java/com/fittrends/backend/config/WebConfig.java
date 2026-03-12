package com.fittrends.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // ALLOWED_ORIGIN env var is set on Railway to the deployed frontend URL.
        // Falls back to localhost origins for local development.
        String allowedOrigin = System.getenv("ALLOWED_ORIGIN");
        String[] origins = (allowedOrigin != null && !allowedOrigin.isBlank())
                ? new String[] { allowedOrigin, "http://localhost:5173", "http://localhost:3000" }
                : new String[] { "http://localhost:5173", "http://localhost:3000" };

        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    // Serve the built React app (frontend/dist copied to resources/static) for all
    // non-API routes so React Router handles client-side navigation correctly.
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");
    }
}
