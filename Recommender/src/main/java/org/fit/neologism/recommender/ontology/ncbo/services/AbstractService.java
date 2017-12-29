package org.fit.neologism.recommender.ontology.ncbo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

public abstract class AbstractService {
    @Autowired
    protected RestTemplate restTemplate;

    @Value("${bioontology.url}")
    protected String API_URL;
}
