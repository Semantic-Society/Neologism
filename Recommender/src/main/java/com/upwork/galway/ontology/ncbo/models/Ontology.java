package org.fit.neologism.recommender.ontology.ncbo.models;

public class Ontology {
    private String id;

    private String name;

    private String acronym;

    public Ontology () {}

    public Ontology(String id, String name, String acronym) {
        this.id = id;
        this.name = name;
        this.acronym = acronym;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAcronym() {
        return acronym;
    }

    public void setAcronym(String acronym) {
        this.acronym = acronym;
    }

    @Override
    public String toString() {
        return "Ontology{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", acronym='" + acronym + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Ontology ontology = (Ontology) o;

        if (id != null ? !id.equals(ontology.id) : ontology.id != null) return false;
        if (name != null ? !name.equals(ontology.name) : ontology.name != null) return false;
        return acronym != null ? acronym.equals(ontology.acronym) : ontology.acronym == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (name != null ? name.hashCode() : 0);
        result = 31 * result + (acronym != null ? acronym.hashCode() : 0);
        return result;
    }
}
