package org.fit.neologism.recommender.ontology.ncbo.models;

import java.util.List;

public class SearchTermResult {
    public SearchTermResult() {}

    public SearchTermResult(String prefLabel, boolean obsolete, String ontology, List<String> definition, List<String> semanticType, List<String> synonym) {
        this.prefLabel = prefLabel;
        this.obsolete = obsolete;
        this.ontology = ontology;
        this.definition = definition;
        this.semanticType = semanticType;
        this.synonym = synonym;
    }

    private String prefLabel;

    private boolean obsolete;

    private String ontology;

    private List<String> definition;

    private List<String> semanticType;

    private List<String> synonym;

    public String getPrefLabel() {
        return prefLabel;
    }

    public void setPrefLabel(String prefLabel) {
        this.prefLabel = prefLabel;
    }

    public boolean isObsolete() {
        return obsolete;
    }

    public void setObsolete(boolean obsolete) {
        this.obsolete = obsolete;
    }

    public String getOntology() {
        return ontology;
    }

    public void setOntology(String ontology) {
        this.ontology = ontology;
    }

    public List<String> getDefinition() {
        return definition;
    }

    public void setDefinition(List<String> definition) {
        this.definition = definition;
    }

    public List<String> getSemanticType() {
        return semanticType;
    }

    public void setSemanticType(List<String> semanticType) {
        this.semanticType = semanticType;
    }

    public List<String> getSynonym() {
        return synonym;
    }

    public void setSynonym(List<String> synonym) {
        this.synonym = synonym;
    }

    @Override
    public String toString() {
        return "SearchTermResult{" +
                "prefLabel='" + prefLabel + '\'' +
                ", obsolete='" + obsolete + '\'' +
                ", ontology='" + ontology + '\'' +
                ", definition=" + definition +
                ", semanticType=" + semanticType +
                ", synonym=" + synonym +
                '}';
    }
}
