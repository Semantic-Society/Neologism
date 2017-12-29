package org.fit.neologism.recommender.ontology.ncbo.controllers;

import org.fit.neologism.recommender.ontology.ncbo.models.SearchTermResult;
import org.fit.neologism.recommender.ontology.ncbo.requests.SearchClassRequest;
import org.fit.neologism.recommender.ontology.ncbo.services.OntologyService;
import org.fit.neologism.recommender.ontology.ncbo.services.TermSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Controller
@RequestMapping("/class")
public class ClassController {

    @Value("${bioontology.url}")
    private String API_URL;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private OntologyService ontologyService;

    @Autowired
    private TermSearchService termSearchService;

    @PostMapping(value = "/searchSync", produces = "application/json")
    public @ResponseBody
    List<List<SearchTermResult>> searchClassesSync(final @RequestBody SearchClassRequest searchClassRequest) {
        if (null == searchClassRequest.getSearchTerms() || searchClassRequest.getSearchTerms().isEmpty())
            return new ArrayList<>();
        return termSearchService.search(searchClassRequest);
    }

    @PostMapping(value = "/search", produces = "application/json")
    public @ResponseBody
    CompletableFuture<List<List<SearchTermResult>>> searchClassesAsync(final @RequestBody SearchClassRequest searchClassRequest) {
        if (null == searchClassRequest.getSearchTerms() || searchClassRequest.getSearchTerms().isEmpty())
            return CompletableFuture.completedFuture(new ArrayList<>());
        return termSearchService.searchAsync(searchClassRequest);
    }

    @GetMapping
    public String searchForm(final Model model) {
        model.addAttribute("ontologies", ontologyService.getAllOntologies());

        return "classSearchForm";
    }
}
