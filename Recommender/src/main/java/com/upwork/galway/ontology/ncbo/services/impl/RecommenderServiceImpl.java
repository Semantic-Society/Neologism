package org.fit.neologism.recommender.ontology.ncbo.services.impl;

import com.fasterxml.jackson.databind.JsonNode;
import org.fit.neologism.recommender.ontology.ncbo.models.RecommenderSearchResult;
import org.fit.neologism.recommender.ontology.ncbo.services.AbstractService;
import org.fit.neologism.recommender.ontology.ncbo.services.RecommenderService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import static org.fit.neologism.recommender.ontology.ncbo.utils.MathUtils.round;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class RecommenderServiceImpl extends AbstractService implements RecommenderService {

    private static final Log LOG = LogFactory.getLog(RecommenderServiceImpl.class);

    @Async("ncboWSExecutor")
    @Override
    public CompletableFuture<List<RecommenderSearchResult>> getRecommendations(String keywords) {
        final CompletableFuture<List<RecommenderSearchResult>> recommendations = CompletableFuture.supplyAsync(() -> restTemplate.getForObject(API_URL + "recommender?input=" + keywords + "&input_type=2", JsonNode.class))
                .thenApply(recommendationsResponseNode -> {
                    final List<RecommenderSearchResult> recommendationsList = new ArrayList<>();

                    final Iterator<JsonNode> iterator = recommendationsResponseNode.iterator();
                    while (iterator.hasNext()) {
                        final JsonNode result = iterator.next();
                        final double finalScore = round(result.get("evaluationScore").asDouble() * 100, 2);
                        final double coverageScore = round(result.path("coverageResult").path("normalizedScore").asDouble() * 100, 2);
                        final long annotations = result.path("coverageResult").get("annotations").size();
                        final double specializationScore = round(result.path("specializationResult").path("normalizedScore").asDouble() * 100, 2);
                        final double acceptanceScore = round(result.path("acceptanceResult").path("normalizedScore").asDouble() * 100, 2);
                        final double detailScore = round(result.path("detailResult").path("normalizedScore").asDouble() * 100, 2);

                        String ontologyName = "";
                        String ontologyLink = "";

                        final Iterator<JsonNode> ontologies = result.get("ontologies").iterator();
                        while(ontologies.hasNext()) {
                            final JsonNode ontology = ontologies.next();
                            ontologyName = ontology.get("acronym").asText();
                            ontologyLink = ontology.path("links").path("ui").asText();
                        }

                        final RecommenderSearchResult recommenderSearchResult = new RecommenderSearchResult(ontologyName, ontologyLink,
                                finalScore,
                                coverageScore,
                                specializationScore,
                                acceptanceScore,
                                detailScore,
                                annotations);

                        recommendationsList.add(recommenderSearchResult);
                    }

                    return recommendationsList;
                });

        return recommendations;
    }
}
