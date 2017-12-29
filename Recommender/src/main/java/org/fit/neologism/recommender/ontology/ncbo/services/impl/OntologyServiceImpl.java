package org.fit.neologism.recommender.ontology.ncbo.services.impl;

import com.fasterxml.jackson.databind.JsonNode;
import org.fit.neologism.recommender.ontology.ncbo.models.Ontology;
import org.fit.neologism.recommender.ontology.ncbo.services.AbstractService;
import org.fit.neologism.recommender.ontology.ncbo.services.OntologyService;
import org.fit.neologism.recommender.ontology.ncbo.utils.JsonUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@CacheConfig(cacheNames = "ontologies")
public class OntologyServiceImpl extends AbstractService implements OntologyService {
    private static final Logger log = LoggerFactory.getLogger(OntologyServiceImpl.class);

    @Cacheable
    @Override
    public List<Ontology> getAllOntologies() {
        final List<Ontology> ontologies = new ArrayList<>();

        final String resourcesString = restTemplate.getForObject(API_URL, String.class);
        final JsonNode resources = JsonUtils.jsonToNode(resourcesString);

        // Follow the ontologies link by looking for the media type in the list of links
        final String link = resources.get("links").findValue("ontologies").asText();

        // Get the ontologies from the link we found
        final String ontologiesAsString = restTemplate.getForObject(link, String.class);
        JsonNode ontologiesNode = JsonUtils.jsonToNode(ontologiesAsString);

        // Get the name and ontology id from the returned list
        for (JsonNode ontology : ontologiesNode) {
            ontologies.add(new Ontology(ontology.get("@id").asText(), ontology.get("name").asText(), ontology.get("acronym").asText()));
        }

        return ontologies;
    }
}
