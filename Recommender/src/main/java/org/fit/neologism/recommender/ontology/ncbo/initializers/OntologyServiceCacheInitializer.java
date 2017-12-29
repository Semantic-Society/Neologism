package org.fit.neologism.recommender.ontology.ncbo.initializers;

import org.fit.neologism.recommender.ontology.ncbo.services.OntologyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class OntologyServiceCacheInitializer implements ApplicationListener<ApplicationReadyEvent> {

    @Autowired
    private OntologyService ontologyService;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent applicationReadyEvent) {
        ontologyService.getAllOntologies();
    }
}
