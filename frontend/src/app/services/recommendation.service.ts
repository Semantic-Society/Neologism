import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/range';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { N3Codec } from '../mxgraph/N3Codec';

type IRI = string;

// REST Response Format
interface IRestResponse {
    ID?: string;
    recommendation: IRecommendationMetadata;
    expected?: number;   // total number of recommendation engines, i.e. make expected-1 calls to more endpoint
    more: boolean;
}

// Recommendation Meta Schema
interface IRecommendationMetadata {
    creator: string;
    list: IClassReccomendation[];
}

// Actual Recommendation Schemata
interface IClassReccomendation {
    uri: IRI;
    ontology: string;
    labels: IDetails[];
    comments: IDetails[];
}
interface IPropertyRecommendation {
    propertyIRI: IRI;
    rangeClassIRI: IRI;
    labels: IDetails[];
    comments: IDetails[];
}
interface IDetails {
    language: { languageCode: string };
    label: string;
}

@Injectable()
export class RecommendationService {

    /** Neologism recommendation service endpoint base path */
    private baseUrl = 'http://cloud33.dbis.rwth-aachen.de:8080/recommender/';

    /**
     * Neologism Reccomendation Service Adapter
     * via Angular's observable http service
     */
    constructor(private _http: Http) { }

    /**
     * Generates optimization and completion recommendations for RDF vocabularies
     * @param queryGraph Turtle encoded context graph. May include (exactly one) neologism query term.
     * @param queryTerm Optional clear text query string. Appended as neo query iri to graph.
     */
    classRecommendation(queryGraph: string, queryTerm?: string) {
        if (queryTerm)
            queryGraph += ` <neo://query/${queryTerm}> a <http://www.w3.org/2000/01/rdf-schema#Class> .`;

        queryGraph = encodeURIComponent(queryGraph);

        // First request to recommendation service's -start- endpoint
        const initialRequest = this._http
            .get(`${this.baseUrl}start?model=${queryGraph}`)
            .map((res) => res.json() as IRestResponse);

        // Subsequent `expectedRecommendationCount - 1` many requests to -more- endpoint
        const nextRecommendations = initialRequest
            .switchMap( // execute requests in parallel
                (res) => Observable.range(1, res.expected - 1)
                    .map(
                        () => this._http
                            .get(`${this.baseUrl}more?ID=${res.ID}`)
                            .map((r) => r.json() as IRestResponse)))
            .mergeAll(); // and merge results as they come in

        // Provide single point of contact for any recommendation
        return initialRequest
            .merge(nextRecommendations)
            .map((res) => res.recommendation)
            .scan((acc, curr) => [...acc, curr], []);
    }

    propertyRecommendation(classUri: IRI, creator: string) {
        classUri = encodeURIComponent(classUri);
        creator = encodeURIComponent(creator);

        return this._http
            .get(`${this.baseUrl}properties?class=${classUri}&creator=${creator}`)
            .map((r) => r.json() as { properties: IPropertyRecommendation[] });
    }
}
