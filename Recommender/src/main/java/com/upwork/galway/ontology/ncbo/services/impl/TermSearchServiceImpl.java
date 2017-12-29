package org.fit.neologism.recommender.ontology.ncbo.services.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import org.fit.neologism.recommender.ontology.ncbo.models.SearchTermResult;
import org.fit.neologism.recommender.ontology.ncbo.requests.SearchClassRequest;
import org.fit.neologism.recommender.ontology.ncbo.services.AbstractService;
import org.fit.neologism.recommender.ontology.ncbo.services.TermSearchService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class TermSearchServiceImpl extends AbstractService implements TermSearchService {

    private static final Log LOG = LogFactory.getLog(TermSearchServiceImpl.class);

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public String search(String searchTerm) {
        final JsonNode responseObject = restTemplate.getForObject(API_URL + "search?q=" + searchTerm, JsonNode.class);
        final JsonNode collection = responseObject.get("collection");

        final Iterator<JsonNode> iterator = collection.iterator();
        while(iterator.hasNext()) {
            final JsonNode result = iterator.next();
            result.get("prefLabel").asText("");
            result.get("obsolete").asBoolean();
            result.path("links").path("ontology").asText("");
            final ObjectReader reader = objectMapper.readerFor(new TypeReference<List<String>>() {});

            if (result.has("definition")) {
                try {
                    reader.readValue(result.get("definition"));
                } catch (IOException e) {
                    LOG.error(e.getMessage());
                }
            }
            if (result.has("semanticType")) {
                try {
                    reader.readValue(result.get("semanticType"));
                } catch (IOException e) {
                    LOG.error(e.getMessage());
                }
            }
            if (result.has("synonym")) {
                try {
                    reader.readValue(result.get("synonym"));
                } catch (IOException e) {
                    LOG.error(e.getMessage());
                }
            }

        }

        return "{}";
    }

    @Override
    public List<List<SearchTermResult>> search(SearchClassRequest searchTerm) {
        final String selectedOntologies = String.join(",", searchTerm.getOntologies());

        final List<List<SearchTermResult>> searchResults = searchTerm.getSearchTerms().parallelStream()
                .map(term -> restTemplate.getForObject(API_URL + "search?q=" + searchTerm.getSearchTerms() + "&ontologies=" + selectedOntologies, JsonNode.class))
                .map(responseJson -> responseJson.get("collection"))
                .map(collectionNode -> {
                    final List<SearchTermResult> searchTermResults = new ArrayList<>();
                    final Iterator<JsonNode> iterator = collectionNode.iterator();
                    while (iterator.hasNext()) {
                        final JsonNode result = iterator.next();
                        final String prefLabel = result.get("prefLabel").asText("");

                        final boolean obsolete = result.get("obsolete").asBoolean();

                        final String ontologyLink = result.path("links").path("ontology").asText("");
                        final String ontology = ontologyLink.substring(ontologyLink.lastIndexOf("/") + 1);
                        final String newOntologyLink = "https://bioportal.bioontology.org/ontologies/" + ontology;

                        final ObjectReader reader = objectMapper.readerFor(new TypeReference<List<String>>() {
                        });

                        List<String> definition = new ArrayList<>();
                        List<String> semanticType = new ArrayList<>();
                        List<String> synonym = new ArrayList<>();

                        if (result.has("definition")) {
                            try {
                                definition = reader.readValue(result.get("definition"));
                            } catch (IOException e) {
                                LOG.error(e.getMessage());
                            }
                        }
                        if (result.has("semanticType")) {
                            try {
                                semanticType = reader.readValue(result.get("semanticType"));
                            } catch (IOException e) {
                                LOG.error(e.getMessage());
                            }
                        }
                        if (result.has("synonym")) {
                            try {
                                synonym = reader.readValue(result.get("synonym"));
                            } catch (IOException e) {
                                LOG.error(e.getMessage());
                            }
                        }

                        final SearchTermResult searchTermResult = new SearchTermResult(prefLabel, obsolete, newOntologyLink, definition, semanticType, synonym);
                        searchTermResults.add(searchTermResult);
                    }

                    return searchTermResults;
                })
                .collect(Collectors.toList());

        return searchResults;
    }

    @Async("ncboWSExecutor")
    @Override
    public CompletableFuture<List<List<SearchTermResult>>> searchAsync(SearchClassRequest searchTerm) {
        final String selectedOntologies = String.join(",", searchTerm.getOntologies());
        final List<CompletableFuture<List<SearchTermResult>>> searchTermsleFutureStream = searchTerm.getSearchTerms().stream()
                .map(term -> CompletableFuture.supplyAsync(() -> restTemplate.getForObject(API_URL + "search?q=" + term + "&ontologies=" + selectedOntologies, JsonNode.class)))
                .map(searchResponseFuture -> searchResponseFuture.thenApply(responseJson -> responseJson.get("collection")))
                .map(collectionNodeFuture -> collectionNodeFuture.thenApply(collectionNode -> {
                    final List<SearchTermResult> searchTermResults = new ArrayList<>();
                    final Iterator<JsonNode> iterator = collectionNode.iterator();
                    while (iterator.hasNext()) {
                        final JsonNode result = iterator.next();
                        final String prefLabel = result.get("prefLabel").asText("");

                        final boolean obsolete = result.get("obsolete").asBoolean();

                        final String ontologyLink = result.path("links").path("ontology").asText("");
                        final String ontology = ontologyLink.substring(ontologyLink.lastIndexOf("/") + 1);
                        final String newOntologyLink = "https://bioportal.bioontology.org/ontologies/" + ontology;

                        final ObjectReader reader = objectMapper.readerFor(new TypeReference<List<String>>() {});

                        List<String> definition = new ArrayList<>();
                        List<String> semanticType = new ArrayList<>();
                        List<String> synonym = new ArrayList<>();

                        if (result.has("definition")) {
                            try {
                                definition = reader.readValue(result.get("definition"));
                            } catch (IOException e) {
                                LOG.error(e.getMessage());
                            }
                        }
                        if (result.has("semanticType")) {
                            try {
                                semanticType = reader.readValue(result.get("semanticType"));
                            } catch (IOException e) {
                                LOG.error(e.getMessage());
                            }
                        }
                        if (result.has("synonym")) {
                            try {
                                synonym = reader.readValue(result.get("synonym"));
                            } catch (IOException e) {
                                LOG.error(e.getMessage());
                            }
                        }

                        final SearchTermResult searchTermResult = new SearchTermResult(prefLabel, obsolete, newOntologyLink, definition, semanticType, synonym);
                        searchTermResults.add(searchTermResult);
                    }

                    return searchTermResults;
                }))
                .collect(Collectors.toList());

        final List<List<SearchTermResult>> searchResults = searchTermsleFutureStream.stream().map(CompletableFuture::join).collect(Collectors.toList());

        return CompletableFuture.completedFuture(searchResults);
    }
}
