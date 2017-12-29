package org.fit.neologism.recommender.ontology.ncbo.services;

import org.fit.neologism.recommender.ontology.ncbo.models.RecommenderSearchResult;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface RecommenderService {
    CompletableFuture<List<RecommenderSearchResult>> getRecommendations(String keywords);
}
