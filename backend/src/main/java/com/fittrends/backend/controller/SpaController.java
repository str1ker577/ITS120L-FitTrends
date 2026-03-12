package com.fittrends.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Serves index.html for any non-API, non-static route so React Router
 * handles client-side navigation correctly when deployed as a SPA.
 */
@Controller
public class SpaController {

    // Match everything that does NOT contain a period (so it ignores .js, .css,
    // etc)
    // and does NOT start with /api (so backend endpoints still work)
    @RequestMapping(value = { "/", "/{x:[\\w\\-]+}", "/{x:^(?!api$).*$}/**/{y:[\\w\\-]+}" })
    public String serveReact() {
        // Automatically forward to the embedded static index.html
        return "forward:/index.html";
    }
}
