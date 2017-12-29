package org.fit.neologism.recommender.ontology.ncbo.services;

import org.fit.neologism.recommender.ontology.ncbo.models.SearchTermResult;
import org.fit.neologism.recommender.ontology.ncbo.requests.SearchClassRequest;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface TermSearchService {
    String search(String searchTerm);

    List<List<SearchTermResult>> search(SearchClassRequest searchTerm);

    CompletableFuture<List<List<SearchTermResult>>> searchAsync(SearchClassRequest searchTerm);
}
