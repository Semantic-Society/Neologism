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
import { PropertyType } from './../../../api/models';

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
  classInfo$: Observable<{ label: string, description: string; url: string }>;

  // TODO: strictly speaking, this component does not need this as it only needs access to classes and properties.
  // However, more fine grained methods in the VocabulariesService are not yet implemented.
  @Input() vocabID: string;

  formProp: FormGroup;

  formEnable = "data"

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
  xsdDataTypes = [

    "anyURI",

    "base64Binary",

    "boolean",

    "byte",

    "date",

    "dateTime",

    "decimal",

    "derivationControl",

    "double",

    "duration",

    "ENTITIES",

    "ENTITY",

    "float",

    "gDay",

    "gMonth",

    "gMonthDay",

    "gYear",

    "gYearMonth",

    "hexBinary",

    "ID",

    "IDREF",

    "IDREFS",

    "int",

    "integer",

    "language",

    "long",

    "Name",

    "NCName",

    "negativeInteger",

    "NMTOKEN",

    "NMTOKENS",

    "nonNegativeInteger",

    "nonPositiveInteger",

    "normalizedString",

    "NOTATION",

    "positiveInteger",

    "QName",

    "short",

    "simpleDerivationSet",

    "string",

    "time",

    "token",

    "unsignedByte",

    "unsignedInt",

    "unsignedLong",

    "unsignedShort"

  ]
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
  }

  ngOnInit() {
    this.uriPrefix = (this.uriPrefix.search(/^(.*)#$/) == -1) ? `${this.uriPrefix}#` : `${this.uriPrefix}`
    this.formProp = this.fb.group({
      name: ['', Validators.required],
      URI: [`${this.uriPrefix}`],
      range: ['', Validators.required],
      description: [''],

    });

    this.rangeOptions = this.vocabService.getClasses(this.vocabID).pipe(
      map((classes) => classes.map((aclass) => ({ _id: aclass._id, name: aclass.name })))
    );

    this.classToUpdate = this.vocabService.getClassWithProperties(this.vocabID, of(this.selectedClassID));

  }

  public buildForm(rec: IClassProperties): FormGroup {
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
    this.classInfo$ = this.editboxService.createClassInfoObj(this.vocabID, classID)

    // actually already refacored (in editbox service) but very hard to test as the 
    // recommender service always returns an empty array, bug ?
    this.propertyRecommendations = this.editboxService.getClass$(this.vocabID, classID)
      .pipe(
        switchMap((theclass) => {
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


  addProperty(formDirective: FormGroupDirective, index: number) {
    const typo = (index === 0) ? PropertyType.Object : PropertyType.Data;
    if (index) {
      this.formProp.controls['URI'].setValue(`http://www.w3.org/2001/XMLSchema#${this.formProp.value.range}`)
    }
    console.log(formDirective.value)
    this.vocabService.addProperty(this.selectedClassID, this.formProp.value.name, this.formProp.value.description, this.formProp.value.URI, this.formProp.value.range, typo, this.vocabID);
    formDirective.resetForm();
    this.formProp.reset()
  }



  cancelEdit() {
    this.editToggle = false;
    this.editedClass = this.editboxService.getUndefinedClass()
  }

  updateEdit() {

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

  showDeleteConfirm(): void {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this class?',
      nzOkText: 'Yes',
      nzOkType: 'danger',
      nzOnOk: () => this.editboxService.deleteClass(this.selectedClassID),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  listenerPropNameChange($event) {
    this.formProp.controls['URI'].setValue(`${this.uriPrefix}${encodeURIComponent($event.target.value.toLocaleLowerCase())}`)

  }

  listenerClassNameChange(value: string) {
    this.editedClass.URI = `${this.uriPrefix}${encodeURIComponent(value.toLocaleLowerCase())}`
  }

  resetSidebarState() {
    this.sidebarService.changeSidebarToDefault()
  }

  toggleEdit() {
    this.editToggle = !this.editToggle;
  }
}
