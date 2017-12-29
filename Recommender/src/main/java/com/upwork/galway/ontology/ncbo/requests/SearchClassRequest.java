package org.fit.neologism.recommender.ontology.ncbo.requests;

import java.util.List;

public class SearchClassRequest {
    private List<String> searchTerms;

    private List<String> ontologies;

    public List<String> getSearchTerms() {
        return searchTerms;
    }

    public void setSearchTerms(List<String> searchTerms) {
        this.searchTerms = searchTerms;
    }

    public List<String> getOntologies() {
        return ontologies;
    }

    public void setOntologies(List<String> ontologies) {
        this.ontologies = ontologies;
    }

    @Override
    public String toString() {
        return "SearchClassRequest{" +
                "searchTerms='" + searchTerms + '\'' +
                ", ontologies=" + ontologies +
                '}';
    }
}
