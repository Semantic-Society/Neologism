import {Injectable} from '@angular/core';
import {N3Codec} from '../mxgraph/N3Codec';

import {MeteorObservable, zoneOperator} from 'meteor-rxjs';
import {Observable} from 'rxjs/Observable';

import {Classes, Vocabularies} from '../../../api/collections';
import {Iclass} from '../../../api/models';

@Injectable()
export class VocabulariesService {
  
  constructor() {  }

  addClass(vocabularyId: string, name: string, description: string, URI: string) {
    MeteorObservable.call('class.create',
      {vocabularyId, name, description, URI}
    ).pipe(zoneOperator())
      .subscribe((response) => {
        // Handle success and response from server!
      }, (err) => {
        // Handle error
      });
  }
  getClasses(vocabularyId: string): Observable<Iclass[]> {
    const classes = Vocabularies.findOne({_id: vocabularyId}).classes;
    return Classes.find({_id: {$in: classes}}).pipe(zoneOperator()).map((x) => { console.log(x); return x; }) as any;
  }
}
