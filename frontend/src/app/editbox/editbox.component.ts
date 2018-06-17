import { Component, EventEmitter, Input, OnChanges, OnInit, Output, } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, ReplaySubject } from 'rxjs';
import { combineLatest, distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';

// import { multicast } from 'rxjs/operators/multicast';
// import { startWith } from 'rxjs/operators/startWith';

// import { IUserObject, MxgraphService } from '../mxgraph/mxgraph';

import { Classes, Vocabularies } from '../../../api/collections';
import { RecommendationService } from '../services/recommendation.service';
import { IClassWithProperties, VocabulariesService } from '../services/vocabularies.service';

@Component({
  selector: 'app-editbox',
  templateUrl: './editbox.component.html',
  styleUrls: ['./editbox.component.css'],
})
export class EditboxComponent implements OnInit, OnChanges {

  // protected alreadyThere: Array<{ comment: string; label: string; uri: string; range: string; }> = [];
  protected alreadyThere2: Observable<Array<{ comment: string; label: string; uri: string; range: string; }>>;

  // protected propertyRecommendations: Array<{ comment: string; label: string; uri: string; range: string; }> = [];
  protected propertyRecommendations: Observable<Array<{ comment: string; label: string; uri: string; range: string; }>>;

  // TODO: as this is an observable, does it need @Input?
  @Input() selectedClassID: string;

  /**
   * If more classinfo is needed, it can be fetched in ngOnInit below.
   */
  protected classInfo: Observable<{ label: string, description: string; url: string }>;

  // TODO: strictly speaking, this component does not need this as it only needs access to classes and properties.
  // However, more fine grained methods in the VocabulariesService are not yet implemented.
  @Input() vocabID: string;
  protected newClass = {
    name: '',
    URI: '',
    description: '',
    property: {
      name: '',
      URI: '',
      description: '',
      range: ''
    }
  };

  protected editedClass: {
    name: string;
    URI: string;
    description: string;
  };

  protected emptyClass = {
    name: '',
    URI: '',
    description: '',
    property: {
      name: '',
      URI: '',
      description: '',
      range: ''
    }
  };

  protected classToUpdate: Observable<IClassWithProperties>;
  protected editToggle = false;

  protected rangeOptions: Observable<Array<{ _id: string, name: string }>>;

  constructor(private recommender: RecommendationService, private vocabService: VocabulariesService) {
  }

  ngOnInit() {
    this.rangeOptions = this.vocabService.getClasses(this.vocabID).pipe(
      map((classes) => {
        return classes.map((aclass) => ({ _id: aclass._id, name: aclass.name }));
      })
    );

    this.classToUpdate = this.vocabService.getClassWithProperties(this.vocabID, of(this.selectedClassID));
    // console.log(this.classToUpdate);

    // const theClassO = this.vocabService.getClassWithProperties(this.vocabID, this.selectedClassID.filter((id) => id !== null));
    // // we get several small pieces of info from the class. multicast is likely a good idea, but did not get it working.
    // this.classInfo = theClassO.map((theClass) => {
    //   console.log('Selected: ' + theClass);
    //   return { label: theClass.name, description: theClass.description, url: theClass.URI };
    // }).startWith({ label: '', description: '', url: '' });

    // this.alreadyThere2 = theClassO.map((theClass) => {
    //   return theClass.properties.map((prop) => {
    //     return { comment: prop.description, label: prop.name, uri: prop.URI, range: prop.range.name };
    //   });
    // }).startWith([]);
  }

  ngOnChanges(input) {

    this.editedClass = {
      name: undefined,
      URI: undefined,
      description: undefined,
    };

    const classID: string = input.selectedClassID.currentValue;
    if (!classID) {
      return;
    }

    const theClassO: Observable<IClassWithProperties> = this.vocabService.getClassWithProperties(this.vocabID, of(classID)).pipe(
      // multicast(new ReplaySubject()),
    );
    // we get several small pieces of info from the class. multicast is likely a good idea, but did not get it working.
    this.classInfo = theClassO.pipe(
      map((theClass) => {
        return { label: theClass.name, description: theClass.description, url: theClass.URI };
      }),
      startWith({ label: '', description: '', url: '' }),
    );

    this.alreadyThere2 = theClassO.pipe(
      map((theClass) => {
        return theClass.properties.map((prop) => {
          // console.log(prop);
          return {
            comment: prop.description,
            label: prop.name,
            uri: prop.URI,
            range: prop.range.name
          };
        });
      }),
      startWith([]),
    );

    this.propertyRecommendations = theClassO.pipe(
      switchMap((theclass) => {
        return this.recommender.propertyRecommendation(theclass.URI).pipe(
          combineLatest(this.alreadyThere2, (recommendations, alreadys) => {
            const newReccommendations = [];
            recommendations.forEach((recommendation) => {
              //       // TODO is there a better way in JS?
              if (!alreadys.some((already) => {
                return already.uri === recommendation.uri;
              })) {
                // the property is not there yet
                newReccommendations.push(recommendation);
              }
            });
            return newReccommendations;
          })
        );
      }),
      startWith([]),
    );

    // this.recommender.propertyRecommendation(theClass.url)
    //   .subscribe((allPropRecommendations) => {
    //     // TODO: what if there is discrepancy between what is recommended and what is already there?
    //     console.log('Received Property Recommendation', allPropRecommendations);
    //     const newReccommendations = [];
    //     allPropRecommendations.forEach((recommendation) => {
    //       // TODO is there a better way in JS?
    //       if (!this.alreadyThere.some((already) => {
    //         return already.uri === recommendation.uri;
    //       })) {
    //         // the property is not there yet
    //         newReccommendations.push(recommendation);
    //       }
    //     });
    //     this.propertyRecommendations = newReccommendations;
    //   });
  }

  addRecommendedProperyToGraph(rec: { comment: string; label: string; uri: string; range: string }) {
    console.log('editbox -> addToGraph:', this.selectedClassID, rec.uri, rec.label, rec.range);

    // this is currently rather weirdly working.
    // When the rangeID is not found, the class is added, after which the rangeID is found and the property can be added.
    // TODO: is this a good way to do this?
    const subscription = this.vocabService.getClassIDFromVocabForURI(this.vocabID, rec.range).subscribe(
      (rangeID) => {
        if (rangeID) {
          // ID found
          this.vocabService.addProperty(this.selectedClassID, rec.label, rec.comment, rec.uri, rangeID);
          subscription.unsubscribe();
        } else {
          // ID not found, add a new class first
          let className = 'no name yet';
          const parts = rec.range.split('#');
          if (parts.length === 2 && parts[1].length > 0) {
            className = parts[1];
          } else {
            const partsSlash = rec.range.split('/');
            if (partsSlash.length > 2 && partsSlash[partsSlash.length - 1].length > 0) {
              className = partsSlash[partsSlash.length - 1];
            }
          }
          this.vocabService.addClass(this.vocabID, className, 'no description yet', rec.range);
        }
      }
    );
    // this.mx.insertProperty(this.selectedClass.url, rec.uri, rec.label, rec.comment, rec.range);
    // TODO: it feals a bit like a hack to call this directly...
    // this.getProperties(this.selectedClass);
  }

  addClass() {
    console.log(this.newClass);
    this.vocabService.addClass(this.vocabID, this.newClass.name, this.newClass.description, this.newClass.URI);
    this.newClass = this.emptyClass;
  }

  addProperty() {
    if (this.selectedClassID !== this.newClass.property.range) {
      this.vocabService.addProperty(this.selectedClassID, this.newClass.property.name, this.newClass.property.description, this.newClass.property.URI, this.newClass.property.range);
      this.newClass = this.emptyClass;
    }
  }

  toggleEdit() {
    this.editToggle = !this.editToggle;
  }

  cancelEdit() {
    this.editToggle = false;
    this.editedClass = {
      name: undefined,
      URI: undefined,
      description: undefined,
    };
  }

  updateEdit() {
    // console.log(this.)
    // TODO: Call the updateClass (needs to be implemented) of vocabService and call toggleEdit() afterwards
    // this.vocabService.updateClass(this.newClass.name);
    console.log(this.editedClass);
    if (this.editedClass.name) {
      this.vocabService.updateClassName(this.selectedClassID, this.editedClass.name);
    }
    if (this.editedClass.description) {
      this.vocabService.updateClassDescription(this.selectedClassID, this.editedClass.description);
    }
    if (this.editedClass.URI) {
      this.vocabService.updateClassURI(this.selectedClassID, this.editedClass.URI);
    }
    this.cancelEdit();
  }

}
