import { Injectable } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable, of } from 'rxjs';
import { map, startWith} from 'rxjs/operators';
import { IClassWithProperties, PropertyType } from '../../../api/models';
import { IClassInfo, IClassProperties, IClassProperty } from '../models/editbox.model';
import { RecommendationService } from '../services/recommendation.service';
import { VocabulariesService } from '../services/vocabularies.service';
@Injectable()
export class EditboxService {
  constructor(
        private recommender: RecommendationService,
        private vocabService: VocabulariesService) {

    }
  getClass$(vocabID: string, classID: string): Observable<IClassWithProperties> {
        const classId$ = of(classID);
        return this.vocabService.getClassWithProperties(vocabID, classId$);
    }

    createClassInfoObj(vocabID: string, classID: string): Observable<IClassInfo> {
        return this.getClass$(vocabID, classID)
            .pipe(
                map((theClass) => this.extractClassInfo(theClass)),
                startWith({ label: '', description: '', url: '' }),
            );
    }
  getUndefinedClass() {
        return {
            name: undefined,
            URI: undefined,
            description: undefined,
        };
    }
  private extractClassInfo(theClass: IClassWithProperties): IClassInfo {
        return {
            label: theClass.name,
            description: theClass.description,
            url: theClass.URI
        };
    }

    updateProperty(rec: IClassProperties) {
        MeteorObservable.call('property.update', rec.id, rec.name, rec.comment, rec.uri, rec.rangeId)
            .subscribe((response) => {
                // Handle success and response from server!
            }, (err) => {
                console.log(err);
            });
    }

    deleteClass(id: string) {
        this.vocabService.deleteClass(id);
    }
}
