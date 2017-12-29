package org.fit.neologism.recommender.ontology.ncbo.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ErrorController {
    @GetMapping("/403")
    public String error403() {
        return "error/403";
    }
}