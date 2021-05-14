export interface Recommendation{
    labels:label[]
    comments:comment[]
    URI:string
    ontology:string
    score:number
}

export interface comment{
    label:string
    language:string
}

export interface label{
    label:string
    language:string
}