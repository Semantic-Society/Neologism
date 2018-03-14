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
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { N3Codec } from '../mxgraph/N3Codec';

interface IStartResult {
    id: string;
    firstRecommendation: IRecommendationResult;
    expectedRecommendationCount: number;
}

interface IRecommendationResult {
    creator: string;
    recommendations: IReccomendation[];
}

interface IReccomendation {
    labels: string[];
    comments: string[];
    uri: string;
    ontology: string;
}

@Injectable()
export class RecommendationService {

    /** Neologism recommendation service endpoint base path */
    private baseUrl = 'http://neologism/recommender/';

    /** Singleton search pipeline ensures only one request is active at any time */
    private subject = new Subject<string>();

    /** Single point of contact for recommendation results */
    private recommendations: Observable<IRecommendationResult>;

    /**
     * Neologism Reccomendation Service Adapter
     * via Angular's observable http service
     */
    constructor(private _http: Http) {
        // First request to recommendation service's -start- endpoint
        const initialRequest = this.subject
            .distinctUntilChanged()
            .switchMap(
                (queryGraph) => this._http
                    .get(`${this.baseUrl}start?graph=${queryGraph}`)
                    .map((res) => res.json() as IStartResult));

        // Subsequent `expectedRecommendationCount - 1` many requests to -more- endpoint
        const nextRecommendations = initialRequest
            .switchMap( // execute requests in parallel
                (res) => Observable.range(1, res.expectedRecommendationCount - 1)
                    .map(
                        () => this._http
                            .get(`${this.baseUrl}more?id=${res.id}`)
                            .map((r) => r.json() as IRecommendationResult)))
            .mergeAll(); // and merge results as they come in

        // Provide single point of contact for any recommendation
        this.recommendations = initialRequest
            .map((res) => res.firstRecommendation)
            .merge(nextRecommendations);
    }

    /**
     * Generates optimization and completion recommendations for RDF vocabularies
     * @param queryGraph Turtle encoded context graph. May include (exactly one) neologism query term.
     * @param queryTerm Optional clear text query string.
     */
    classRecommendation(queryGraph: string, queryTerm?: string) {
        if (queryTerm) {
            queryTerm = N3Codec.neologismId(queryTerm);
            queryGraph += ` ${queryTerm} a http://www.w3.org/2000/01/rdf-schema#Class .`;
        }
        this.subject.next(queryGraph);
        return this.recommendations;
    }
}

}