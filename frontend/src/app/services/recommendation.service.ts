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
import 'rxjs/add/operator/multicast';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
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
    URI: IRI;
    ontology: string;
    labels: IDetails[];
    comments: IDetails[];
}
export interface IPropertyRecommendation {
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
    private static baseUrl = 'https://datalab.rwth-aachen.de/recommender/';

    private classReq: Subject<{ queryGraph: string, queryTerm: string }>;
    private classResp: Subject<Array<{
        comment: string;
        label: string;
        uri: string;
        creator: string;
    }>>;

    private propsReq: Subject<{ url: IRI, creator: string }>;
    private propsResp: Subject<Array<{
        comment: string;
        label: string;
        uri: string;
        range: string;
        creator: string;
    }>>;

    private static strip(html: string) { return html.replace(/<(?:.|\n)*?>/gm, ''); }

    /**
     * Neologism Reccomendation Service Adapter
     * via Angular's observable http service
     */
    constructor(private _http: Http) {
        this.classReq = new Subject();
        this.classResp = new BehaviorSubject([]);
        this.classReq.debounceTime(100)
            .switchMap(({ queryGraph, queryTerm }) => {
                // First request to recommendation service's -start- endpoint
                const initialRequest = this._http
                    .post(`${RecommendationService.baseUrl}startForNewClass?keyword=${queryTerm}`, queryGraph)
                    .map((res) => res.json())
                    .multicast(new Subject<IRestResponse>());

                // Subsequent `expectedRecommendationCount - 1` many requests to -more- endpoint
                const nextRecommendations = initialRequest
                    .switchMap( // execute requests in parallel
                        (res) => Observable.range(1, res.expected - 1)
                            .map(
                                () => this._http
                                    .get(`${RecommendationService.baseUrl}more?ID=${res.ID}`)
                                    .map((resp) => resp.json() as IRestResponse)))
                    .mergeAll(); // and merge results as they come in

                // Provide single point of contact for any recommendation
                const r = initialRequest
                    .merge(nextRecommendations)
                    .map((res) => res.recommendation)
                    .map((resp: IRecommendationMetadata) =>
                        Array.isArray(resp && resp.list)
                            ? resp.list.map((rec) => {
                                return {
                                    comment: RecommendationService.strip(rec.comments[0] && rec.comments[0].label || rec.labels[0].label),
                                    label: RecommendationService.strip(rec.labels[0].label),
                                    uri: rec.URI,
                                    creator: resp.creator,
                                };
                            })
                            : []
                    )
                    .map((recs) => recs.slice(0, 3)) // Take only first three per recommender
                    .scan((acc, curr) => [...acc, ...curr], []);
                initialRequest.connect();
                return r.startWith([]);
            }).subscribe(this.classResp);



        this.propsReq = new Subject();
        this.propsResp = new BehaviorSubject([]);
        this.propsReq.debounceTime(100)
            .switchMap(({ url, creator }) => this._http
                .get(url)
                .map((r) => r.json() as { properties: IPropertyRecommendation[] })
                .map((r) =>
                    Array.isArray(r && r.properties)
                        ? r.properties.map((rec) => {
                            return {
                                comment: RecommendationService.strip(rec.comments[0] && rec.comments[0].label || rec.labels[0].label),
                                // comment: RecommendationService.strip(rec.comments[0].label),
                                label: RecommendationService.strip(rec.labels[0].label),
                                uri: rec.propertyIRI,
                                range: rec.rangeClassIRI,
                                creator
                            };
                        })
                        : []
                ).startWith([])
            ).subscribe(this.propsResp);
    }

    // /**
    //  * Generates optimization and completion recommendations for RDF vocabularies
    //  * @param queryGraph Turtle encoded context graph. May include (exactly one) neologism query term.
    //  * @param queryTerm Optional clear text query string. Appended as neo query iri to graph.
    //  */
    // classRecommendation(queryGraph: string, queryTerm?: string) {
    //     if (queryTerm)
    //         queryGraph += ` <neo://query/${queryTerm}> a <http://www.w3.org/2000/01/rdf-schema#Class> .`;

    //     queryGraph = encodeURIComponent(queryGraph);

    //     this.classReq.next({ queryGraph, queryTerm });
    //     return this.classResp.asObservable();
    // }

    /**
     * Generates optimization and completion recommendations for RDF vocabularies
     * @param queryGraph Turtle encoded context graph. Neologism query terms included are ignored for the rerurn value, but might be used in the recommender.
     * @param queryTerm Clear text non-empty query string.
     */
    classRecommendationforNewClass(queryGraph: string, queryTerm: string) {
        if (queryTerm === '') throw new Error('No recommendations for empty search queryTerm');
        // queryGraph += ` <neo://query/${queryTerm}> a <http://www.w3.org/2000/01/rdf-schema#Class> .`;
        // queryGraph = encodeURIComponent(queryGraph);

        this.classReq.next({ queryGraph, queryTerm });
        return this.classResp.asObservable();
    }

    propertyRecommendation(classUri: IRI, creator: string) {
        classUri = encodeURIComponent(classUri);
        creator = encodeURIComponent(creator);

        const url = `${RecommendationService.baseUrl}properties?class=${classUri}&creator=${creator}`;

        this.propsReq.next({ url, creator });
        return this.propsResp.asObservable();
    }
}
