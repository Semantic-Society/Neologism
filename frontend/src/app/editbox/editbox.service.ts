import { Injectable } from "@angular/core";
import { RecommendationService } from '../services/recommendation.service';
import { IClassInfo, IClassProperties, IClassProperty } from '../models/editbox.model';
import { VocabulariesService, IClassWithProperties } from '../services/vocabularies.service';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { map, startWith, combineLatest, switchMap, tap, take, withLatestFrom, filter } from 'rxjs/operators';

@Injectable()
export class EditboxService {
    private alreadyThere2: Observable<any>
    private property_recommendations: BehaviorSubject<Array<any>> = new BehaviorSubject([])

    constructor(
        private recommender: RecommendationService,
        private vocabService:VocabulariesService) {

    }

    get property_recommendations$ ():Observable<any> {
        return this.property_recommendations.asObservable()
    }

    getClass$(vocabID: string, classID:string): Observable<IClassWithProperties> {
        const classId$ = of(classID)
        return this.vocabService.getClassWithProperties(vocabID, classId$)
    }

    createClassInfoObj(vocabID: string, classID:string): Observable<IClassInfo> {
        return this.getClass$(vocabID, classID)
            .pipe(
                map((theClass) => this.extractClassInfo(theClass)),
                startWith({label: '', description: '', url: ''}),
            )
    }

    getClassProperties(vocabID: string, classID:string): Observable<Array<IClassProperties>> {
        return this.getClass$(vocabID, classID)
            .pipe(
                map(theClass => this.extractClassProperties(theClass)),
                startWith([])
            );
    }

    getUndefinedClass() {
        return {
            name: undefined,
            URI: undefined,
            description: undefined,
        }; 
    }

    getPropertyRecommendations(vocabID: string, classID:string) {
        let existing_properties = [];
        return this.getClass$(vocabID, classID)
                .pipe(
                    tap(theClass => {existing_properties = this.extractClassProperties(theClass)}),
                    switchMap((theClass) => this.recommender.propertyRecommendation(theClass.URI)),
                    // props_reco are the new property recommendation and xting_props are the existing ones
                    map(reommendations => this.mergeOldandNewRecommendations(reommendations, existing_properties)),
                    take(1),
                    filter(Boolean),
                    tap(recommendations => this.property_recommendations.next(recommendations))
                )
            
    }

    private mergeOldandNewRecommendations(recommended_properties: Array<any>, existing_properties: Array<any>): Array<any>{
        console.log(recommended_properties, existing_properties, 'properties to check on')
        return recommended_properties
            .filter(property => {
                const propertyURI = property.uri;
                const exists_on_property = existing_properties
                    .find(x_property => x_property.uri === propertyURI)
                
                return exists_on_property === undefined ? true : false;
            })
    }

    addRecommendedProperyToGraph(rec: IClassProperty, selectedClassID:string, vocabID: string) {
    
        // this is currently rather weirdly working.
        // When the rangeID is not found, the class is added, after which the rangeID is found and the property can be added.
        // TODO: is this a good way to do this?
        this.vocabService.getClassIDFromVocabForURI(vocabID, rec.range)
            .pipe(
                take(1),
                tap(rangeID => this.handleRangeID(rec, rangeID, selectedClassID, vocabID))
            ).subscribe()

      }

    private handleRangeID(rec: IClassProperty, rangeID: string, selectedClassID:string, vocabID: string ) {


        if(rangeID){
            this.vocabService.addProperty(selectedClassID, rec.label, rec.comment, rec.uri, rangeID);
        } else {
            
            let className = 'no name yet'
            const parts = rec.range.split('#')
            const condition = parts.length === 2 && parts[1].length > 0

            if(condition) {
                className = parts[1]
            } else {

                const partsSlash = rec.range.split('/')
                const condition2 = partsSlash.length > 2 && partsSlash[partsSlash.length - 1].length > 0

                if(condition2){
                    className = partsSlash[partsSlash.length - 1];
                }
            }

            this.vocabService.addClass(vocabID, className, 'no description yet', rec.range);
        }
    }

    private extractClassProperties(theClass: IClassWithProperties) {
        return theClass.properties
            .map(proberties => {
                return {
                    comment: proberties.description,
                    label: proberties.name,
                    uri: proberties.URI,
                    range: proberties.range.name
                }
            });
    }

    private extractClassInfo(theClass: IClassWithProperties): IClassInfo {
        return {
            label: theClass.name,
            description: theClass.description,
            url: theClass.URI
        }
    }


}