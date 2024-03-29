import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { combineLatest, filter, map, startWith, switchMap, tap } from 'rxjs/operators';

import { RecommendationService } from '../services/recommendation.service';
import { VocabulariesService } from '../services/vocabularies.service';
import { SideBarStateService } from '../services/state-services/sidebar-state.service';
import { EditboxService } from './editbox.service';
import { IClassProperty } from '../models/editbox.model';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';

import { PropertyType2, xsdDataTypes, IClassWithProperties } from './../../../api/models';
import { SpellCheckerService } from 'ngx-spellchecker';
import { HttpClient } from '@angular/common/http';
import { PropertyEditModal } from '../mxgraph/property-edit-form/property-edit.component';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { transformURI } from '../shared/validator.dup.URI';

@Component({
    selector: 'app-editbox',
    templateUrl: './editbox.component.html',
    styleUrls: ['./editbox.component.css'],
    providers: [SpellCheckerService]
})

export class EditboxComponent implements OnInit, OnChanges {

    constructor(
        private modalService: NzModalService,
        private vocabService: VocabulariesService,
        private recommender: RecommendationService,
        private sidebarService: SideBarStateService,
        private editboxService: EditboxService,
        private fb: FormBuilder,
        private spellCheckerService: SpellCheckerService,
        private modal: NzModalService,
        private httpClient: HttpClient) {
    }

    // protected alreadyThere: Array<{ comment: string; label: string; uri: string; range: string; }> = [];
    protected alreadyThere$: Observable<{ comment: string; label: string; uri: string; range: string }[]>;

    // protected propertyRecommendations: Array<{ comment: string; label: string; uri: string; range: string; }> = [];
    protected propertyRecommendations: Observable<{ comment: string; label: string; uri: string; range: string }[]>;

    @Input() selectedVertex: any;
    @Input() uriPrefix: string;
    /**
     * If more classinfo is needed, it can be fetched in ngOnInit below.
     */
    classInfo$: Observable<{ label: string; description: string; url: string }>;

    @Input() vocabID: string;

    formProp: FormGroup;

    selectedForm = 'object';

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
    readonly xsdDataTypes = xsdDataTypes;

    protected classToUpdate: Observable<IClassWithProperties>;
    public editToggle = false;
    protected rangeOptions: Observable<{ _id: string; name: string }[]>;
    public suggestions_class: string[];
    public suggestions_property: string[];
    contextmenu_class = false;
    contextmenu_property = false;
    private selectedVertexId: string = null;
    fileURL = 'https://raw.githubusercontent.com/JacobSamro/ngx-spellchecker/master/dict/normalized_en-US.dic';
    oldClassID: string;

    hasProps: boolean = false;

    ngOnInit() {
        this.uriPrefix = (this.uriPrefix.search(/^(.*)#$/) == -1) ? `${this.uriPrefix}#` : `${this.uriPrefix}`;
        this.formProp = this.fb.group({
            name: ['', Validators.required],
            URI: [`${this.uriPrefix}`],
            range: ['', Validators.required],
            description: [''],

        });

        this.rangeOptions = this.vocabService.getClasses(this.vocabID).pipe(
            map((classes) => classes.map((aclass) => ({ _id: aclass._id, name: aclass.name })))
        );

        this.classToUpdate = this.vocabService.getClassWithProperties(this.vocabID, of(this.selectedVertex.id));
        this.fnFillVal(this.selectedForm.toString())
    }

    checkIfPropsAny(){
        this.hasProps = this.vocabService.hasProps(this.selectedVertexId)
    }

    ngOnChanges(input) {

        this.editedClass = this.editboxService.getUndefinedClass();

        this.selectedVertexId = input.selectedVertex.currentValue.id;

        if (!this.selectedVertexId) {
            return;
        }

        this.checkIfPropsAny()

        // we get several small pieces of info from the class. multicast is likely a good idea, but did not get it working.
        this.classInfo$ = this.editboxService.createClassInfoObj(this.vocabID, this.selectedVertexId);

        // actually already refacored (in editbox service) but very hard to test as the
        // recommender service always returns an empty array, bug ?
        this.propertyRecommendations = this.editboxService.getClass$(this.vocabID, this.selectedVertexId)
            .pipe(
                switchMap((theclass) => this.recommender.propertyRecommendation(theclass.URI).pipe(
                    tap(as => console.log(as, "recommendations")),
                    combineLatest(this.alreadyThere$, (recommendations, alreadys) => {
                        const newReccommendations = [];
                        recommendations.forEach((recommendation) => {
                 
                            if (!alreadys.some((already) => already.uri === recommendation.uri)) {
                                // the property is not there yet
                                newReccommendations.push(recommendation);
                            }
                        });
                        return newReccommendations;
                    })
                )),
                startWith([]),
            );


    }

    checkWordProperty(word: string) {

        this.httpClient.get(this.fileURL, { responseType: 'text' }).subscribe((res: any) => {
            const dictionary = this.spellCheckerService.getDictionary(res);

            this.suggestions_property = dictionary.getSuggestions(word);
        });


        this.contextmenu_class = true;
    }

    checkWordClass(word: string) {

        this.httpClient.get(this.fileURL, { responseType: 'text' }).subscribe((res: any) => {
            const dictionary = this.spellCheckerService.getDictionary(res);

            this.suggestions_class = dictionary.getSuggestions(word);
        });


        this.contextmenu_class = true;
    }

    addRecommendedProperyToGraph(rec: IClassProperty) {
        this.editboxService.addRecommendedProperyToGraph(rec, this.selectedVertex.id, this.vocabID);
    }

    addProperty(formDirective: FormGroupDirective, index: number) {

        this.vocabService.addPropertyExt(this.selectedVertex.id, this.formProp.value.name, this.formProp.value.description, this.formProp.value.URI, this.formProp.value.range, PropertyType2[index], this.vocabID)
        .subscribe((_response) => {
            this.checkIfPropsAny()
        }, (err) => {
            console.log(err);
        });
        formDirective.resetForm();
        this.formProp.reset();
        this.fnFillVal(this.selectedForm.toString())

    }

    cancelEdit() {
        this.editToggle = false;
        this.editedClass = this.editboxService.getUndefinedClass();
    }

    updateEdit() {

        if (this.editedClass.name) {
            this.vocabService.updateClassName(this.selectedVertex.id, this.editedClass.name);
        }
        if (this.editedClass.description) {
            this.vocabService.updateClassDescription(this.selectedVertex.id, this.editedClass.description);
        }
        if (this.editedClass.URI) {
            this.vocabService.updateClassURI(this.selectedVertex.id, this.editedClass.URI);
        }
        this.cancelEdit();
    }

    showDeleteConfirm(): void {
        this.modal.confirm({
            nzTitle: 'Are you sure delete this class?',
            nzOkText: 'Yes',
            nzOkType: 'danger',
            nzOnOk: () => {
                this.editboxService.deleteClass(this.selectedVertex.id)
                this.resetSidebarState()
            },
            nzCancelText: 'No',
            nzOnCancel: () => console.log('Cancel')
        });
    }

    listenerPropNameChange($event) {
        this.formProp.controls['URI'].setValue(`${this.uriPrefix}${transformURI($event.target.value)}`);

    }

    listenerClassNameChange(value: string) {
        this.editedClass.URI = `${this.uriPrefix}${transformURI(value)}`;
    }

    resetSidebarState() {
        this.sidebarService.changeSidebarToDefault();
    }

    toggleEdit() {
        this.editToggle = !this.editToggle;
    }

    fnFillVal($event) {

        if ($event === "subclass") {
            this.formProp.controls['URI'].setValue(`http://www.w3.org/2000/01/rdf-schema#subClassOf`);
            this.formProp.controls['name'].setValue(`rdfs:subClassOf`);
        }
        else {
            this.formProp.controls['URI'].setValue(`${this.uriPrefix}`);
            this.formProp.controls['name'].setValue(``);
        }
    }

    fnEditClassProps() {
        const modal: NzModalRef = this.modalService.create({
            nzTitle: 'Actions on Property',
            nzContent: PropertyEditModal,
            nzComponentParams: {
                propListString: null,
                domainClassId: this.selectedVertex.id,
            },
            nzFooter: [
                {
                    type: 'default',
                    label: 'Cancel',
                    onClick: () => {
                        modal.destroy();
                    },
                },
                {
                    type: 'primary',
                    label: 'Update',
                    onClick: (componentInstance) => {
                        componentInstance.closeModal();
                    },
                },
                {
                    type: 'danger',
                    label: 'Delete',
                    onClick: (componentInstance) => {
                        componentInstance.deleteProp().subscribe((response) => {
                            // Handle success and response from server!
                            this.checkIfPropsAny()
                        }, (err) => {
                            console.log(err);
                        });
                    },
                },
            ],
        });
    }
}