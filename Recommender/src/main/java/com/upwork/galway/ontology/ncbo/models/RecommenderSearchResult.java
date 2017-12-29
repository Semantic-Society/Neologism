package org.fit.neologism.recommender.ontology.ncbo.models;

public class RecommenderSearchResult {

    public RecommenderSearchResult() {}

    public RecommenderSearchResult(String ontology, String ontologyLink, double finalScore, double coverageScore, double acceptanceScore, double detailScore, double specializationScore, long annotations) {
        this.ontology = ontology;
        this.ontologyLink = ontologyLink;
        this.finalScore = finalScore;
        this.coverageScore = coverageScore;
        this.acceptanceScore = acceptanceScore;
        this.detailScore = detailScore;
        this.specializationScore = specializationScore;
        this.annotations = annotations;
    }

    private String ontology;

    private String ontologyLink;

    private double finalScore;

    private double coverageScore;

    private double acceptanceScore;

    private double detailScore;

    private double specializationScore;

    private long annotations;

    public String getOntology() {
        return ontology;
    }

    public void setOntology(String ontology) {
        this.ontology = ontology;
    }

    public String getOntologyLink() {
        return ontologyLink;
    }

    public void setOntologyLink(String ontologyLink) {
        this.ontologyLink = ontologyLink;
    }

    public double getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(double finalScore) {
        this.finalScore = finalScore;
    }

    public double getCoverageScore() {
        return coverageScore;
    }

    public void setCoverageScore(double coverageScore) {
        this.coverageScore = coverageScore;
    }

    public double getAcceptanceScore() {
        return acceptanceScore;
    }

    public void setAcceptanceScore(double acceptanceScore) {
        this.acceptanceScore = acceptanceScore;
    }

    public double getDetailScore() {
        return detailScore;
    }

    public void setDetailScore(double detailScore) {
        this.detailScore = detailScore;
    }

    public double getSpecializationScore() {
        return specializationScore;
    }

    public void setSpecializationScore(double specializationScore) {
        this.specializationScore = specializationScore;
    }

    public long getAnnotations() {
        return annotations;
    }

    public void setAnnotations(long annotations) {
        this.annotations = annotations;
    }

    @Override
    public String toString() {
        return "RecommenderSearchResult{" +
                "ontology='" + ontology + '\'' +
                ", ontologyLink='" + ontologyLink + '\'' +
                ", finalScore=" + finalScore +
                ", coverageScore=" + coverageScore +
                ", acceptanceScore=" + acceptanceScore +
                ", detailScore=" + detailScore +
                ", specializationScore=" + specializationScore +
                ", annotations=" + annotations +
                '}';
    }
}
