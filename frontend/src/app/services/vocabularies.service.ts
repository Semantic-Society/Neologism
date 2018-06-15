import { Injectable } from '@angular/core';

import { MeteorObservable, zoneOperator } from 'meteor-rxjs';
import { combineLatest, empty, Observable, throwError } from 'rxjs';
import { catchError, filter, flatMap, map, switchMap } from 'rxjs/operators';

import { Classes, Properties, Vocabularies } from '../../../api/collections';
import { Iclass, Iproperty, Ivocabulary, meteorID } from '../../../api/models';

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

  public static wrapFunkyObservables(observable): Observable<any> {
    return new Observable((observer) => {
      const subscription = observable.subscribe(
        (x) => observer.next(x),
        (e) => observer.error(e),
        () => observer.complete()
      );
      return () => subscription.unsubscribe();
    });
  }

  constructor() { }

  getVocabularies(): Observable<Ivocabulary[]> {
    return VocabulariesService.wrapFunkyObservables(
      Vocabularies.find()
        .pipe(zoneOperator())
    );
  }

  getVocabulary(id: string): Observable<Ivocabulary> { // TODO: Breaks upon deletion
    return VocabulariesService.wrapFunkyObservables(
      Vocabularies.find({ _id: id }).pipe(
        filter((arr: any[]) => arr.length > 0),
        map((arr) => arr[0]),
      )
    );
  }
  createVocabulary(name: string, authors: string[], description: string, uriPrefix: string) {
    MeteorObservable.call('vocabulary.create', name, authors, description, uriPrefix)
      .pipe(zoneOperator())
      .subscribe((response) => {
        console.log(response);
        // Handle success and response from server!
      }, (err) => {
        // Handle error
      });
  }
  deleteVocabulary(id: string) {
    MeteorObservable.call('vocabulary.remove', id)
      .pipe(zoneOperator())
      .subscribe((response) => {
        // Handle success and response from server!
      }, (err) => {
        // Handle error
      });
  }

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

  getClasses(vocabularyId: string): Observable<Iclass[]> {
    if (vocabularyId === undefined || vocabularyId === '') {
      throw new Error('Oh no');
    }

    const thevocabO = VocabulariesService.wrapFunkyObservables(
      Vocabularies.find({ _id: vocabularyId })
    );
    const res /*: Observable<Iclass[]>*/ = thevocabO.pipe(
      flatMap(
        (theVocab, _ignored) => {
          if (theVocab.length > 1) {
            return throwError(new Error('More than 1 vocab returned for id'));
          } else if (theVocab.length === 0) {
            return empty();
          } else {
            const classes = theVocab[0].classes;
            return Classes.find({ _id: { $in: classes } });
          }
        }
      )
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
  getClassesWithProperties(vocabularyId: string): Observable<IClassWithProperties[]> {
    const classes = this.getClasses(vocabularyId)
      .pipe(
        switchMap((cs) =>
          combineLatest(
            cs.map((c) =>
              VocabulariesService.wrapFunkyObservables(
                Properties.find({ _id: { $in: c.properties } })
              ).pipe(
                map((ps: Iproperty[]) => {
                  return { ...c, properties: ps };
                })
              )
            )
          )
        )
      );

    const filledClasses: Observable<IClassWithProperties[]> = classes.pipe(
      map((cs) => {
        const newClassesWithoutRangeFilledLater = cs.map((c) => {
          const filledProps = c.properties.map((p) => {
            if (!p._id) throw new Error(p + 'is missing an ID!');
            return { ...p, _id: p._id, range: null };
          });
          if (!c._id) throw new Error(c + 'is missing an ID!');
          return { ...c, _id: c._id, properties: filledProps };
        });

        newClassesWithoutRangeFilledLater.forEach((c, i) =>
          c.properties.forEach((p, j) => {
            p.range = newClassesWithoutRangeFilledLater.find((cr) => cr._id === cs[i].properties[j].range);
            if (!p.range) {
              return null; // not all required classes returned yet
            }
          })
        );

        return newClassesWithoutRangeFilledLater;
      }),
      filter ((x) => !!x),
    );

    return filledClasses;
  }

  /**
   * Currently this still needs the vocab ID. A future improved version should not need that.
   * @param vocabID
   * @param selectedClassID
   */
  getClassWithProperties(vocabID: string, selectedClassID: Observable<string>)/* Observable<IClassWithProperties> */ {
    // TODO: this following steps are overkill. We can use something more granular later.
    const theClassO: Observable<IClassWithProperties> = selectedClassID.pipe(
      switchMap((classID) => {
        const allClassesO: Observable<IClassWithProperties[]> = this.getClassesWithProperties(vocabID);
        return allClassesO.pipe(
          map((allClasses) => {
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
          })
        );
      }),
      filter((cl) => cl !== null)
    );
    return theClassO;
  }

}
