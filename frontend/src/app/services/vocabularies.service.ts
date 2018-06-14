import { Injectable } from '@angular/core';
import { N3Codec } from '../mxgraph/N3Codec';

import { MeteorObservable, zoneOperator } from 'meteor-rxjs';
import { Observable } from 'rxjs/Observable';

import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import 'rxjs/add/observable/combineLatest';
import { Classes, Properties, Vocabularies } from '../../../api/collections';
import { Iclass, Iproperty, Ivocabulary, meteorID } from '../../../api/models';

export interface IClassWithProperties {
  _id?: string; // Mongo generated ID
  name: string;
  description: string;
  URI: string;

  properties: Array<{
    _id?: string; // Mongo generated ID
    name: string;
    description: string;
    URI: string;
    range: IClassWithProperties;
  }>;
  position: {
    x: number;
    y: number;
  };
  skos: {
    closeMatch: string[];
    exactMatch: string[];
  };
}

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
  addProperty(toClass: meteorID, name: string, description: string, URI: string, range: meteorID) {
    MeteorObservable.call('property.create',
      { classId: toClass, name, description, URI, range }
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
      (theVocab, _ignored) => {
        if (theVocab.length > 1) {
          return new ErrorObservable(new Error('More than 1 vocab returned for id'));
        } else if (theVocab.length === 0) {
          return new EmptyObservable();
        } else {
          const classes = theVocab[0].classes;
          return Classes.find({ _id: { $in: classes } });
        }
      }
    );
    return res;
  }

  /**
   *  TODO: In the current implmentation, ANY update will cause all information to be requeried.
   *  This can be improved by listening to specific updates instead.
   *
   * @param vocabularyId
   */
  getClassesWithProperties(vocabularyId: string): Observable<IClassWithProperties[]> {
    const classes = this.getClasses(vocabularyId)
      .switchMap((cs) =>
        Observable.combineLatest(
          cs.map((c) =>
            Properties.find({ _id: { $in: c.properties } })
              .map((ps: Iproperty[]) => {
                return { ...c, properties: ps };
              })
          )
        )
      );

    const filledClasses: Observable<IClassWithProperties[]> = classes.map((cs) => {
      const newClassesWithoutRangeFilledLater = cs.map((c) => {
        const filledProps = c.properties.map((p) => {
          return { ...p, range: null };
        });
        return { ...c, properties: filledProps };
      });

      newClassesWithoutRangeFilledLater.forEach((c, i) =>
        c.properties.forEach((p, j) =>
          p.range = newClassesWithoutRangeFilledLater.find((cr) => cr._id === cs[i].properties[j].range)
        )
      );

      return newClassesWithoutRangeFilledLater;
    });

    return filledClasses;
  }

}
