package org.fit.neologism.recommender.ontology.ncbo.services;

import org.fit.neologism.recommender.ontology.ncbo.models.Ontology;

import java.util.List;

public interface OntologyService {

    List<Ontology> getAllOntologies();
}