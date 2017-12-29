package org.fit.neologism.recommender.ontology.ncbo.controllers;

import org.fit.neologism.recommender.ontology.ncbo.forms.RecommenderForm;
import org.fit.neologism.recommender.ontology.ncbo.services.RecommenderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.validation.Valid;
import java.util.concurrent.CompletableFuture;

@Controller
@RequestMapping("/recommender")
public class RecommenderController {

    @Autowired
    private RecommenderService recommenderService;

    @GetMapping
    public String searchForm(final Model model) {
        model.addAttribute("recommenderForm", new RecommenderForm());

        return "recommenderSearchForm";
    }

    @PostMapping
    public CompletableFuture<String> getRecommendations(final Model model, @Valid final RecommenderForm recommenderForm, final BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return CompletableFuture.completedFuture("recommenderSearchForm");
        }

        return recommenderService.getRecommendations(recommenderForm.getKeywords()).thenApply(recommendations -> {
            model.addAttribute("recommendations", recommendations);

            return "recommenderSearchForm";
        });
    }

}
