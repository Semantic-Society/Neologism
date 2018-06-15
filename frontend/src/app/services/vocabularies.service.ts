import { Injectable } from '@angular/core';

import { MeteorObservable, zoneOperator } from 'meteor-rxjs';
import { Observable } from 'rxjs/Observable';

import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import 'rxjs/add/observable/combineLatest';

import { Classes, Properties, Vocabularies } from '../../../api/collections';
import { Iclass, Iproperty, Ivocabulary, meteorID } from '../../../api/models';

import 'rxjs/add/operator/filter';

export interface IClassWithProperties {
  _id: string; // Mongo generated ID
  name: string;
  description: string;
  URI: string;

  properties: Array<{
    _id: string; // Mongo generated ID
    name: string;
    description: string;
    URI: string;
    range: IClassWithProperties; // these MUST be in the same vocabulary!
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
    ).subscribe((response) => {
      // Handle success and response from server!
    }, (err) => {
      console.log(err);
    });
  }

  addProperty(toClass: meteorID, name: string, description: string, URI: string, range: meteorID) {
    MeteorObservable.call('property.create',
      { classId: toClass, name, description, URI, range }
    ).subscribe((response) => {
      // Handle success and response from server!
    }, (err) => {
      console.log(err);
    });
  }

  getClasses(vocabularyId: string) /*: Observable<Iclass[]> */ {
    if (vocabularyId === undefined || vocabularyId === '') {
      throw new Error('Oh no');
    }

    const thevocabO = Vocabularies.find({ _id: vocabularyId });
    const res /*: Observable<Iclass[]>*/ = thevocabO.flatMap(
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

  translateClasses(ids: meteorID[], dx: number, dy: number) {
    MeteorObservable.call('classes.translate', ids, dx, dy)
      .subscribe((response) => {
        // Handle success and response from server!
      }, (err) => {
        console.log(err);
      });
  }

  /**
   *  TODO: In the current implmentation, ANY update will cause all information to be requeried.
   *  This can be improved by listening to specific updates instead.
   *
   * @param vocabularyId
   */
  getClassesWithProperties(vocabularyId: string) /*: Observable<IClassWithProperties[]>*/ {
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
      ) as any;

    const filledClasses /*: Observable<IClassWithProperties[]>*/ = classes.map((cs) => {
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

  /**
   * Currently this still needs the vocab ID. A future improved version should not need that.
   * @param vocabID
   * @param selectedClassID
   */
  getClassWithProperties(vocabID: string, selectedClassID: Observable<string>)/* Observable<IClassWithProperties> */ {
    // TODO: this following steps are overkill. We can use something more granular later.
    const theClassO: Observable<IClassWithProperties> = selectedClassID.switchMap((classID) => {
      const allClassesO: Observable<IClassWithProperties[]> = this.getClassesWithProperties(vocabID);
      return allClassesO.map((allClasses) => {
        console.log(allClasses);
        const potentiallyTheClass = allClasses.filter((clazz) => clazz._id === classID);
        if (potentiallyTheClass.length !== 1) {
          // throw new Error('zero or more than 1 class found, while there should only be 1');
          // This can happen when the result for that class is not yet in the result, but still coming.
          // return null now, filter our below.
          return null;
          // Still not as filter does not work :-S so now returning some empty thing
          // return {
          //   _id: '', name: 'waiting...', description: 'waiting...', URI: '', properties: [], position: {
          //     x: 0, y: 0
          //   },
          //   skos: {
          //     closeMatch: [],
          //     exactMatch: []
          //   }
          // };
        }
        const theClass = potentiallyTheClass[0];
        return theClass;
      });
    }).filter((cl) => cl !== null);
    return theClassO;
  }

}
