import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {combineLatest, map, startWith, switchMap, tap} from 'rxjs/operators';

import {RecommendationService} from '../services/recommendation.service';
import {IClassWithProperties, VocabulariesService} from '../services/vocabularies.service';
import { SideBarStateService } from '../services/state-services/sidebar-state.service';
import { EditboxService } from './editbox.service';
import { IClassProperty } from '../models/editbox.model';

@Component({
  selector: 'app-editbox',
  templateUrl: './editbox.component.html',
  styleUrls: ['./editbox.component.css'],
})

export class EditboxComponent implements OnInit, OnChanges {

  // protected alreadyThere: Array<{ comment: string; label: string; uri: string; range: string; }> = [];
  protected alreadyThere2: Observable<Array<{ comment: string; label: string; uri: string; range: string; }>>;

  // protected propertyRecommendations: Array<{ comment: string; label: string; uri: string; range: string; }> = [];
  protected propertyRecommendations: Observable<Array<{ comment: string; label: string; uri: string; range: string; }>>

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

  constructor(
    private vocabService: VocabulariesService,
    private recommender: RecommendationService,
    private sidebarService: SideBarStateService,
    private editboxService: EditboxService) {
  
  }

  ngOnInit() {

    this.rangeOptions = this.vocabService.getClasses(this.vocabID).pipe(
      map((classes) => classes.map((aclass) => ({_id: aclass._id, name: aclass.name})))
    );

    this.classToUpdate = this.vocabService.getClassWithProperties(this.vocabID, of(this.selectedClassID));

  }

  ngOnChanges(input) {

    this.editedClass = this.editboxService.getUndefinedClass()

    const classID: string = input.selectedClassID.currentValue;
    
    if (!classID) {
      return;
    }

    // we get several small pieces of info from the class. multicast is likely a good idea, but did not get it working.
    this.classInfo = this.editboxService.createClassInfoObj(this.vocabID, classID)

    this.alreadyThere2 = this.editboxService.getClassProperties(this.vocabID, classID)

    // actually already refacored (in editbox service) but very hard to test as the 
    // recommender service always returns an empty array, bug ?
    this.propertyRecommendations = this.editboxService.getClass$(this.vocabID, classID)
      .pipe(
        switchMap((theclass) => {
          console.log('asdasd')
          return this.recommender.propertyRecommendation(theclass.URI).pipe(
            tap(as=> console.log(as, 'recommendations')),
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


  }

  addRecommendedProperyToGraph(rec: IClassProperty){
    this.editboxService.addRecommendedProperyToGraph(rec, this.selectedClassID, this.vocabID)
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

  resetSidebarState(){
    this.sidebarService.changeSidebarToDefault()
  }

}
