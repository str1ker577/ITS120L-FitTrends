package com.fittrends.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Serves index.html for any non-API, non-static route so React Router
 * handles client-side navigation correctly when deployed as a SPA.
 */
@Controller
public class SpaController {

    /**
     * Catch all frontend routes (single and two-level deep) that are NOT
     * API calls and do NOT have a file extension (assets are handled by Spring's
     * static resource handler automatically).
     */
    @RequestMapping(value = {
            "/",
            "/{p1:[^\\.]*}",
            "/{p1:[^\\.]*}/{p2:[^\\.]*}",
            "/{p1:[^\\.]*}/{p2:[^\\.]*}/{p3:[^\\.]*}"
    })
    public String serveReact() {
        return "forward:/index.html";
    }
}
