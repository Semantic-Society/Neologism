import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, ConnectableObservable, Observable, range, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, merge, mergeAll, multicast, scan, startWith, switchMap } from 'rxjs/operators';
import { N3Codec } from '../mxgraph/N3Codec';
import { VocabulariesService } from './vocabularies.service';
import { environment } from '../../environments/environment';
import { BatchQuery } from './BatchQuery';
import { BatchRecommendations } from './BatchRecommendations';

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
     static baseUrl = `${environment.recommender.base}`+((environment.recommender.port=="")? "/recommender/" :`:${environment.recommender.port}/recommender/`);     

     //static batchBaseUrl = "http://localhost:8080/recommender/batchRecommender";
        
     classReq: Subject<{ queryGraph: string, queryTerm: string }>;
     classResp: Subject<Array<{
        comment: string;
        label: string;
        uri: string;
    }>>;

     propsReq: Subject<{ url: IRI }>;
     propsResp: Subject<Array<{
        comment: string;
        label: string;
        uri: string;
        range: string;
    }>>;

     static strip(html: string) { return html.replace(/<(?:.|\n)*?>/gm, ''); }

    /**
     * Neologism Reccomendation Service Adapter
     * via Angular's observable http service
     */
    constructor( private _http: HttpClient) {
        this.classReq = new Subject();
        this.classResp = new BehaviorSubject([]);
        this.classReq.pipe(
            debounceTime(100),
            switchMap(({ queryGraph, queryTerm }) => {
                // First request to recommendation service's -start- endpoint
                console.log(RecommendationService.baseUrl);
                const initialRequest = VocabulariesService.wrapFunkyObservables(
                    this._http.post(`${RecommendationService.baseUrl}startForNewClass?keyword=${queryTerm}`, queryGraph)
                ).pipe(
                    multicast(new Subject<IRestResponse>()),
                ) as ConnectableObservable<IRestResponse>;

                // Subsequent `expectedRecommendationCount - 1` many requests to -more- endpoint
                const nextRecommendations = initialRequest.pipe(
                    switchMap( // execute requests in parallel
                        (res) => range(1, res.expected - 1).pipe(
                            map(() => VocabulariesService.wrapFunkyObservables(
                                this._http.get(`${RecommendationService.baseUrl}more?ID=${res.ID}`) as Observable<IRestResponse>)
                            )
                        )
                    ),
                    mergeAll()
                ); // and merge results as they come in

                // Provide single point of contact for any recommendation
                const r = initialRequest.pipe(
                    merge(nextRecommendations),
                    map((res) => res.recommendation),
                    map((resp: IRecommendationMetadata) => 
                        Array.isArray(resp && resp.list)
                            ? resp.list.map((rec) => {
                                return {
                                    comment: RecommendationService.strip(rec.comments[0] && rec.comments[0].label || rec.labels[0].label),
                                    label: RecommendationService.strip(rec.labels[0].label),
                                    uri: rec.URI,
                                };
                            })
                            : []
                    ),
                    map((recs) => recs.slice(0, 3)), // Take only first three per recommender
                    scan((acc, curr) => [...acc, ...curr], []),
                );
                initialRequest.connect();
                return r.pipe(startWith([]));
            })
        )
            .subscribe(this.classResp);

        this.propsReq = new Subject();
        this.propsResp = new BehaviorSubject([]);
        this.propsReq.pipe(
            debounceTime(100),
            switchMap(({ url }) => VocabulariesService.wrapFunkyObservables(
                this._http.get(url) as Observable<{ properties: IPropertyRecommendation[] }>
            ).pipe(
                map((r) =>
                    Array.isArray(r && r.properties)
                        ? r.properties.map((rec) => {
                            return {
                                comment: RecommendationService.strip(rec.comments[0] && rec.comments[0].label || rec.labels[0].label),
                                // comment: RecommendationService.strip(rec.comments[0].label),
                                label: RecommendationService.strip(rec.labels[0].label),
                                uri: rec.propertyIRI,
                                range: rec.rangeClassIRI,
                            };
                        })
                        : []
                ),
                startWith([]),
            )
            )
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

    propertyRecommendation(classUri: IRI) {
        classUri = encodeURIComponent(classUri);

        const url = `${RecommendationService.baseUrl}properties?class=${classUri}`;

        this.propsReq.next({ url });
        return this.propsResp.asObservable();
    }

    batchRecommendationsForClasses(batchQuery: BatchQuery):Observable<BatchRecommendations>{


return VocabulariesService.wrapFunkyObservables(this._http.post(RecommendationService.baseUrl+"batchRecommender",
            {
"properties":batchQuery.properties,
"domain":batchQuery.domain,
"classes":batchQuery.classes

            }))
    }
}
