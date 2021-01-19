import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { combineLatest, filter, map, startWith, switchMap, tap } from 'rxjs/operators';

import { RecommendationService } from '../services/recommendation.service';
import { IClassWithProperties, VocabulariesService } from '../services/vocabularies.service';
import { SideBarStateService } from '../services/state-services/sidebar-state.service';
import { EditboxService } from './editbox.service';
import { IClassProperties, IClassProperty } from '../models/editbox.model';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-editbox',
  templateUrl: './editbox.component.html',
  styleUrls: ['./editbox.component.css'],
})

export class EditboxComponent implements OnInit, OnChanges {

  // protected alreadyThere: Array<{ comment: string; label: string; uri: string; range: string; }> = [];
  protected alreadyThere$: Observable<Array<{ comment: string; label: string; uri: string; range: string; }>>;

  // protected propertyRecommendations: Array<{ comment: string; label: string; uri: string; range: string; }> = [];
  protected propertyRecommendations: Observable<Array<{ comment: string; label: string; uri: string; range: string; }>>

  // TODO: as this is an observable, does it need @Input?
  @Input() selectedClassID: string;
  @Input() uriPrefix: string;
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
    description: ''
  };

  formProp: FormGroup;

  protected editedClass: {
    name: string;
    URI: string;
    description: string;
  };

  protected emptyClass = {
    name: '',
    URI: '',
    description: ''
  };

  protected classToUpdate: Observable<IClassWithProperties>;
  public editToggle = false;
  protected rangeOptions: Observable<Array<{ _id: string, name: string }>>;

  constructor(
    private vocabService: VocabulariesService,
    private recommender: RecommendationService,
    private sidebarService: SideBarStateService,
    private editboxService: EditboxService,
    private fb: FormBuilder,
    private modal: NzModalService) {

    this.formProp = fb.group({
      name: ['', Validators.required],
      URI: [ `${this.uriPrefix}#`,
      {
        asyncValidators: [this.vocabService.uriPropValidator()],
      }],
      range: ['', Validators.required],
      description: [''],

    });

  }
  propsForm: FormGroup;

  ngOnInit() {

    this.rangeOptions = this.vocabService.getClasses(this.vocabID).pipe(
      map((classes) => classes.map((aclass) => ({ _id: aclass._id, name: aclass.name })))
    );

    this.classToUpdate = this.vocabService.getClassWithProperties(this.vocabID, of(this.selectedClassID));

  }

  get props() {
    return this.propsForm.get('props') as FormArray;
  }

  public buildForm(rec: IClassProperties, index = 0): FormGroup {
    return this.fb.group({
      id: [rec.id, Validators.required],
      name: [rec.label, Validators.required],
      uri: [rec.uri, Validators.required],
      range: [rec.range, Validators.required],
      rangeId: [rec.rangeId, Validators.required],
      comment: [rec.comment],

    });
  }
  oldClassID: string
  ngOnChanges(input) {

    this.editedClass = this.editboxService.getUndefinedClass()

    const classID: string = input.selectedClassID.currentValue;

    if (!classID) {
      return;
    }

    // we get several small pieces of info from the class. multicast is likely a good idea, but did not get it working.
    this.classInfo = this.editboxService.createClassInfoObj(this.vocabID, classID)

    this.propsForm = this.fb.group({ props: new FormArray([]) })

    this.alreadyThere$ = this.editboxService.getClassProperties(this.vocabID, classID).pipe(

      map((rec) => {
        console.log(rec)
        rec.map((prop, index) => {
          prop.isEditToggle = false;
          const duplicateIndex = this.props.controls.findIndex((element) => (element.get("id").value === prop.id))
          // Avoid duplication of properties due multiple subscriptions
          if (duplicateIndex === -1) {
            this.props.push(this.buildForm(prop, index))
          } else {
            this.props.controls[duplicateIndex].patchValue(prop)
          }

          return prop;
        })
        return rec;
      }), tap(x => console.log(this.propsForm.value))
    )

    // actually already refacored (in editbox service) but very hard to test as the 
    // recommender service always returns an empty array, bug ?
    this.propertyRecommendations = this.editboxService.getClass$(this.vocabID, classID)
      .pipe(
        switchMap((theclass) => {
          console.log('asdasd')
          return this.recommender.propertyRecommendation(theclass.URI).pipe(
            tap(as => console.log(as, 'recommendations')),
            combineLatest(this.alreadyThere$, (recommendations, alreadys) => {
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

  addRecommendedProperyToGraph(rec: IClassProperty) {
    this.editboxService.addRecommendedProperyToGraph(rec, this.selectedClassID, this.vocabID)
  }

  addClass() {
    console.log(this.newClass);
    this.vocabService.addClass(this.vocabID, this.newClass.name, this.newClass.description, this.newClass.URI);
    this.newClass = this.emptyClass;
  }

  addProperty(formDirective: FormGroupDirective) {
    this.vocabService.addProperty(this.selectedClassID, this.formProp.value.name, this.formProp.value.description, this.formProp.value.URI, this.formProp.value.range);
    formDirective.resetForm();
    this.formProp.reset()
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

  change(value: string) {
    this.editedClass.URI = `${this.uriPrefix}#${value.toLocaleLowerCase()}`
  }

  resetSidebarState() {
    this.sidebarService.changeSidebarToDefault()
  }

  propModify(rec) {
    this.editboxService.updateProperty(rec)
    this.propToggleView(rec)

  }

  propToggleView(rec) {
    rec.isEditToggle = !rec.isEditToggle
    return;
  }

  propReturn(index: number, rec) {
    this.props.controls[index].patchValue(rec)
    this.propToggleView(rec)
  }

  showDeleteConfirm(): void {
    console.log(this.selectedClassID)
    this.modal.confirm({
      nzTitle: 'Are you sure delete this class?',
      nzOkText: 'Yes',
      nzOkType: 'danger',
      nzOnOk: () => this.editboxService.deleteClass(this.selectedClassID),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  completeNewPropURI($event) {
    this.formProp.controls['URI'].setValue(`${this.uriPrefix}#${$event.target.value.toLocaleLowerCase()}`)

  }

}
