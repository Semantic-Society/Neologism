import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Random } from 'meteor/random';
import { MeteorObservable, zoneOperator } from 'meteor-rxjs';
import { combineLatest, empty, Observable, of, throwError, timer } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, flatMap, map, switchMap, take, tap } from 'rxjs/operators';

import { Classes, Properties, Users, Vocabularies } from '../../../api/collections';
import { Iclass, Iproperty, Ivocabulary, PropertyType, meteorID, IClassWithProperties } from '../../../api/models';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SideBarNodeCreatorComponent } from '../core/node-creator.component';
import { N3Codec } from '../mxgraph/N3Codec';
import { environment } from './../../environments/environment';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { CreateVocabModalComponent } from '../home-dashboard/create-vocab-modal/create-vocab-modal.component';


const callWithPromise = (method, ...myParameters) => new Promise((resolve, reject) => {
    Meteor.call(method, ...myParameters, (err, res) => {
        if (err) reject(err);
        resolve(res);
    });
});

@Injectable()
export class VocabulariesService {


  public viewCenter: { x: number; y: number } = { x: 0, y: 0 };
  private env = environment;
  private _vocabCount = 0;
  public get vocabCount() {
      return this._vocabCount;
  }
  public set vocabCount(value) {
      this._vocabCount = value;
  }

  /**
   * func for wrapping minimongo query observable for
   * one time execution and unsubscribing
   *
   * @param observable
   * @returns
   */
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

  constructor(
    private messageService: NzMessageService,
    private modalService: NzModalService,
    private fb: FormBuilder,
  ) { }

  getVocabularies(): Observable<Ivocabulary[]> {
      // Opening Meteor feed for vocabularies publication
      const handle = Meteor.subscribe('vocabularies');

      // wrapping mini mongo query
      // in an observable
      const localQuery = VocabulariesService.wrapFunkyObservables(
          Vocabularies.find()
              .pipe(zoneOperator())
      );

      return new Observable((observer: any) => {
          const subscription = localQuery.subscribe(observer);

          // Now let's return a tear-down/unsubscribe function
          return () => {
              subscription.unsubscribe();
              handle.stop();
          };
      });
  }

  getVocabulary(id: string): Observable<Ivocabulary> { 
      return VocabulariesService.wrapFunkyObservables(
          Vocabularies.find({ _id: id }).pipe(
              filter((arr: any[]) => arr.length > 0),
              map((arr) => arr[0]),
          )
      );
  }

  createVocabulary(name: string, description: string, uriPrefix: string) {
      const _id = new Mongo.ObjectID().toHexString();
      return MeteorObservable.call('vocabulary.create', _id, name, description, uriPrefix)
          .pipe(
              zoneOperator(),
              map(result => ({ ...result, vocabId: _id }))
          );
  }

  deleteVocabulary(id: string) {
      MeteorObservable.call('vocabulary.remove', id)
          .pipe(zoneOperator())
          .subscribe((_response) => {
              // Handle success and response from server!
          }, (err) => {
              console.log(err);
              // Handle error
          });

  }

  addClass(vocabularyId: string, name: string, description: string, URI: string, position: { x: number; y: number } = this.viewCenter, vertexType = false) {
      const id = this.createMeteorNewId();
      return MeteorObservable.call('class.create', vocabularyId, vertexType, name, description, URI, position, id)
          .pipe(
              take(1),
              tap((response) => this.messageService.success(SideBarNodeCreatorComponent.CLASS_ADD_MESSAGE))
              , map(resp => id)
          );
  }

  updateClass(classID: string, URI: string, name: string, description: string) {
      MeteorObservable.call('class.update', classID, URI, description, name).subscribe((_response) => {
      // Handle success and response from server!
      }, (err) => {
          console.log(err);
      });
  }

  updateClassName(classID: string, name: string) {
      MeteorObservable.call('class.update.name', classID, name).subscribe((_response) => {
      // Handle success and response from server!
      }, (err) => {
          console.log(err);
      });
  }

  updateClassDescription(classID: string, description: string) {
      MeteorObservable.call('class.update.description', classID, description).subscribe((_response) => {
      // Handle success and response from server!
      }, (err) => {
          console.log(err);
      });
  }

  updateClassURI(classID: string, URI: string) {
      MeteorObservable.call('class.update.URI', classID, URI).subscribe((_response) => {
      // Handle success and response from server!
      }, (err) => {
          console.log(err);
      });
  }

  addProperty(toClass: meteorID, name: string, description: string, URI: string, range: string,
      type: string, vocabID: string) {
      if (type == PropertyType.Data) {
          this.addClass(vocabID, range, description = PropertyType.Data, URI, undefined, true).subscribe(classId => {
              MeteorObservable.call('property.create', toClass, { name, description, URI, range, type, _id: classId })
                  .subscribe((_response) => {
                      // Handle success and response from server!
                  }, (err) => {
                      console.log(err);
                  });
          });

      } else {
          MeteorObservable.call('property.create', toClass, { name, description, URI, range, type })
              .subscribe((_response) => {
                  // Handle success and response from server!
              }, (err) => {
                  console.log(err);
              });
      }


  }

  /**
   * Gets the list of class IDs for the given vocabulary
   *
   * @param vocabularyId
   */
  getClassIDsForVocabID(vocabularyId: string): Observable<meteorID[]> {
      const thevocabO: Observable<{ classes: meteorID[] }[]> = VocabulariesService.wrapFunkyObservables(
          Vocabularies.find({ _id: vocabularyId }, { fields: { classes: 1 }, limit: 1 })
      );

      return thevocabO.pipe(
          debounceTime(10),
          switchMap((theVocab, _ignored) => {
              if (theVocab.length > 1) {
                  return throwError(new Error('More than 1 vocab returned for id'));
              } else if (theVocab.length === 0) {
                  return empty();
              } else {
                  return of(theVocab[0].classes);
              }
          }),
      );
  }

  getClasses(vocabularyId: string): Observable<Iclass[]> {
      if (vocabularyId === undefined || vocabularyId === '') {
          throw new Error('vocabularyID not correctly specified. Got "' + vocabularyId + '"');
      }
      const thevocabO: Observable<meteorID[]> = this.getClassIDsForVocabID(vocabularyId);
      const res: Observable<Iclass[]> = thevocabO.pipe(
          flatMap((classes, _ignored) => VocabulariesService.wrapFunkyObservables(Classes.find({ _id: { $in: classes } })))
      );
      return res;
  }

  translateClasses(ids: meteorID[], dx: number, dy: number) {
      MeteorObservable.call('classes.translate', ids, dx, dy)
          .subscribe((_response) => {
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
      console.log('in vocab service ');
      // Ask Meteor Server to send a feed of accessible documents
      const handle = Meteor.subscribe('vocabDetails', vocabularyId);

      const classes$ = this.getClasses(vocabularyId)
          .pipe(
              switchMap((cs) =>
                  combineLatest(
                      cs.map((c) =>
                          VocabulariesService.wrapFunkyObservables(
                              Properties.find({ _id: { $in: c.properties } })
                          ).pipe(
                              map((ps: Iproperty[]) => ({ ...c, properties: ps }))
                          )
                      )
                  )
              )
          );

      const filledClasses: Observable<IClassWithProperties[]> = classes$.pipe(
          map((cs) => {
              const newClassesWithoutRangeFilledLater = cs.map((c) => {
                  const filledProps = c.properties.map((p) => {
                      if (!p._id) throw new Error(p + 'is missing an ID!');
                      return { ...p, _id: p._id, range: null };
                  });
                  if (!c._id) throw new Error(c + 'is missing an ID!');
                  return { ...c, _id: c._id, properties: filledProps };
              });

              let failed = false;
              newClassesWithoutRangeFilledLater.forEach((c, i) =>
                  c.properties.forEach((p, j) => {
                      p.range = newClassesWithoutRangeFilledLater.find((resource) => resource._id === cs[i].properties[j].range);
                      if (!p.range && p.type == PropertyType.Data) {
                          p.range = cs[i].properties[j].range;
                      } else if (!p.range) {
                          // return null; // not all required classes returned yet
                          failed = true;
                      }
                  })
              );
              if (failed) {
                  return null;
              }
              return newClassesWithoutRangeFilledLater;
          }),
          filter((x) => !!x),
      );

      // automatic unsubscription handling
      return new Observable((observer: any) => {
          const subscription = filledClasses.subscribe(observer);

          // Now let's return a tear-down/unsubscribe function
          return () => {
              subscription.unsubscribe();
              handle.stop();
          };
      });
  }

  /**
   * Currently this still needs the vocab ID. A future improved version should not need that.
   *
   * @param vocabID
   * @param selectedClassID
   */
  getClassWithProperties(vocabID: string, selectedClassID: Observable<string>): Observable<IClassWithProperties> {
      //TODO (184): this following steps are overkill. We can use something more granular later.
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

  /**
   * Get the meteorID for the class in the given vocabulary, which has that URI
   *
   * @param vocabID
   * @param URI
   */
  getClassIDFromVocabForURI(vocabularyId: string, URI: string): Observable<string> {
      const res = this.getClassIDsForVocabID(vocabularyId).pipe(
          flatMap((classes, _ignored) => {
              const classqueryRes: Observable<{ _id: meteorID }[]> = VocabulariesService.wrapFunkyObservables(Classes.find({ _id: { $in: classes }, URI }, { fields: { _id: 1 }, limit: 1 }));
              return classqueryRes;
          }),
          map((classes) => {
              if (classes[0]) {
                  return classes[0]._id;
              } else {
                  return null;
              }
          }),
          // ideally last would be used, but does not seem to work. Perhaps never completed
          debounceTime(30),
          distinctUntilChanged()
      );
      return res;
  }

  searchVocabByName(searchString: string, id: string): any {

      return Vocabularies.find({
          name: { $regex: searchString, $options: 'i' },
          authors: id,
      },
      {
          limit: 10
      }).fetch();
  }

  // gets first email address for the user if any
  getEmailAddress(userId: string): string {
      try {
          const user = Users.findOne({
              _id: userId
          });

          return (user?.emails[0]?.address) ? user.emails[0].address : '';
      } catch (error) {
          console.log(error);
      }

  }

  isURITaken(URI: string, type: 'class' | 'property') {
      try {
          if (type === 'class') {
              return of((Classes.findOne({ URI }) != null));
          } else {
              return of((Properties.findOne({ URI }) != null));
          }
      } catch (error) {
          console.log(error);
      }
  }

  deleteClass(id: meteorID) {
      MeteorObservable.call('classes.delete', id)
          .subscribe((_response) => {
          }, (err) => {
              console.log(err);
          });
  }

  uriValidator(): AsyncValidatorFn {
      return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => timer(500).pipe(
          switchMap(_ => this.isURITaken(control.value, "class")),
          map(isTaken => (isTaken ? { invalidURI: true } : null)),
          catchError(() => of(null)));

  }

  uriPropValidator(): AsyncValidatorFn {
      return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => timer(500).pipe(
          switchMap(_ => this.isURITaken(control.value, "property")),
          map(isTaken => (isTaken ? { invalidURI: true } : null)),
          catchError(() => of(null)));

  }

  publishVocab(vocabID) {
      this.getClassesWithProperties(vocabID).pipe(take(1)).subscribe(
          (classesWithProps) => {
              N3Codec.serialize(vocabID, classesWithProps, (content) => {
                  MeteorObservable.call('vocabulary.publish', content, vocabID).subscribe((_response) => {
                      // Handle success and response from server!
                      const vocabName = Vocabularies.findOne({ _id: vocabID }).name;
                      const fileUrl = `${window.location.protocol}//${window.location.hostname}/vocabularies/${vocabName}.ttl`;
                      this.messageService.success(`Vocabulary has been published <br>at <a href="${fileUrl}" target="_blank">${fileUrl}</a>`);

                  }, (err) => {
                      console.log(err);
                      this.messageService.error('Vocabulary cannot be publish, try later');
                  });
              });

          }
      );
  }
  /**
   * Imposing configurable vocabularies limit
   * Targeted to guest users only
   *
   * @returns boolean
   */
  isEligibleForCreatingVocab(): Boolean {
      return (Meteor.user().emails[0].address === this.env.guestUserName && this.vocabCount < this.env.gMaxVocab);
  }

  /**
   * Creates and initializes modal form
   * for new vocabulary instance
   */
  openNewVocabForm(): NzModalRef {
      return this.modalService.create({
          nzTitle: 'Create new vocabulary',
          nzContent: CreateVocabModalComponent,
          nzComponentParams: {
              validateForm: this.fb.group({
                  description: [''],
                  uri: ['http://w3id.org/neologism/{vocabname-in-lowercase}#', [Validators.required]],
                  name: [null, [Validators.required]],
                  access: ['public', [Validators.required]],

              })
          },
          nzFooter: null
      });
  }


  /**
   * Creates and initializes modal form
   * for new vocabulary instance on Import
   */
  openImportVocabForm({ name, uri, desc }): NzModalRef {
      return this.modalService.create({
          nzTitle: 'Create new vocabulary',
          nzContent: CreateVocabModalComponent,
          nzComponentParams: {
              validateForm: this.fb.group({
                  description: [desc],
                  uri: [{ value: uri, disabled: false }],
                  name: [{ value: `${name}`, disabled: false }, [Validators.required]],

              })
          },
          nzFooter: null
      });
  }

  /**
   * Fills newly created vocabulary
   * with processed and transformed
   * imported rdf file
   */
  fillVocabularyWithData(data: any, id: string) {
      const tasks$ = [];
      data.classes.forEach(element => {
          tasks$.push(this.addClass(id, element.label, element.description, element.uri));
      });

      combineLatest(tasks$).subscribe((res) => {
          res.forEach((id, index) => {
              data.classes[index]._id = id;
          });
          data.subclasses.forEach(element => {

              const domainClass = data.classes.find(ele => ele.label == element.domain);
              if (element.type === PropertyType.Object) {
                  element.range = data.classes.find(ele => ele.label == element.range)._id;
              }
              this.addProperty(domainClass._id, element.label, element.description, element.uri, element.range, element.type, id);

          });
      });

  }

  createMeteorNewId(): string {
      return Random.id();
  }

}


