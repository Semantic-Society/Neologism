import { Component, EventEmitter, Input, OnChanges, OnInit, Output, } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

// import { multicast } from 'rxjs/operators/multicast';
// import { startWith } from 'rxjs/operators/startWith';

// import { IUserObject, MxgraphService } from '../mxgraph/mxgraph';

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

  // TODO: as this is an observable, does it need @Input?
  @Input() selectedClassID: string;

  /**
   * If more classinfo is needed, it can be fetched in ngOnInit below.
   */
  protected classInfo: Observable<{ label: string, description: string; url: string }>;

  // TODO: strictly speaking, this component does not need this as it only needs access to classes and properties.
  // However, more fine grained methods in the VocabulariesService are not yet implemented.
  @Input() vocabID: string;

  constructor(private recommender: RecommendationService, private vocabService: VocabulariesService) {
  }

  ngOnInit() {
    // this.selectedClassID.subscribe((classID) => {
    //   this.getProperties(classID);
    // });

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
    const classID: string = input.selectedClassID.currentValue;
    if (!classID) {
      return;
    }

    const theClassO = this.vocabService.getClassWithProperties(this.vocabID, of(classID));
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
          console.log(prop);
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

  }

  //  getProperties(classID: string) {
  // this.alreadyThere = this.mx.getProperties(theClass.url);
  // this.recommender.propertyRecommendation(theClass.url, theClass.creator)
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
  // }

  addToGraph(rec: { comment: string; label: string; uri: string; range: string; creator: string; }) {
    // // console.log('editbox -> addToGraph:', this.selectedClass.url, rec.uri, rec.label, rec.range)
    // this.mx.insertProperty(this.selectedClass.url, rec.uri, rec.label, rec.comment, rec.range);
    // // TODO: it feals a bit like a hack to call this directly...
    // this.getProperties(this.selectedClass);
  }
}
