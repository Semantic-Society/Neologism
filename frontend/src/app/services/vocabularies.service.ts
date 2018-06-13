import { Injectable } from '@angular/core';
import { N3Codec } from '../mxgraph/N3Codec';

import { MeteorObservable, zoneOperator } from 'meteor-rxjs';
import { Observable } from 'rxjs/Observable';

import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { Classes, Vocabularies } from '../../../api/collections';
import { Iclass, Ivocabulary } from '../../../api/models';

@Injectable()
export class VocabulariesService {

  constructor() { }

  addClass(vocabularyId: string, name: string, description: string, URI: string) {
    MeteorObservable.call('class.create',
      { vocabId: vocabularyId, name, description, URI }
    ).pipe(zoneOperator())
      .subscribe((response) => {
        // Handle success and response from server!
      }, (err) => {
        console.log(err);
      });
  }
  getClasses(vocabularyId: string): Observable<Iclass[]> {
    if (vocabularyId === undefined || vocabularyId === '') {
      throw new Error('Oh no');
    }

    const thevocabO = Vocabularies.find({ _id: vocabularyId });
    const res: Observable<Iclass[]> = thevocabO.flatMap(
      (theVocab, test) => {
        if (theVocab.length > 1) {
          // return Observable.Throw<string>(new Exception());
          // TODO return observable
          throw new ErrorObservable(new Error('More than 1 vocab returned for id'));
        } else if (theVocab.length === 0) {
          return new EmptyObservable();
        } else {
          const classes = theVocab[0].classes;
          return Classes.find({ _id: { $in: classes } }).pipe(zoneOperator()).map((x) => { // console.log(x);
            return x; }) as any;
        }
      }
    );
    return res;

    // Subject s = new Subject();

    // const all = Vocabularies.find({});
    // all.subscribe(
    //   {
    //     next: (res) => {
    //       console.log('vocabs ', res);
    //     },
    //     error: (e) => {
    //       console.log('ERROR' + e)
    //     }
    //   }
    // );

    // const theOne = Vocabularies.findOne({ _id: vocabularyId });
    // if (theOne === undefined) {
    //   throw new Error('Could not find a vocabulary with the given ID ' + vocabularyId);
    // }
    // // console.log(theOne);
    // const classes = theOne.classes;
    // return Classes.find({ _id: { $in: classes } }).pipe(zoneOperator()).map((x) => { console.log(x); return x; }) as any;
  }
}
