
import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { mxgraph as m } from 'mxgraph';
import { from, Observable, of, Subscription } from 'rxjs';
import { auditTime, catchError, combineLatest, debounceTime, defaultIfEmpty, distinctUntilChanged, filter, map, startWith, take, tap, timeout, timeoutWith } from 'rxjs/operators';

import { MxgraphService } from './mxgraph';

import { Ivocabulary, meteorID, IvocabularyExtended } from '../../../api/models';
import { IClassWithProperties, VocabulariesService } from '../services/vocabularies.service';

// import sidebar state dep.
import { SideBarStateService, SidebarChange } from '../services/state-services/sidebar-state.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { PropertyEditModal } from './property-model/property-edit.component';
import { Classes } from '../../../api/collections';
import { RecommendationService } from '../services/recommendation.service';
import { BatchRecommenderComponent } from '../batchRecommender/batchRecommender.component';
import { BatchRecommendations } from '../services/BatchRecommendations';


interface IMergedPropertiesClass {
    _id: string; // Mongo generated ID
    name: string;
    properties: Array<{
        _id: string;
        name: string;
        rangeID: string; // just the ID
    }>;
}

@Component({
    selector: 'app-mxgraph',
    templateUrl: './mxgraph.component.html',
    styleUrls: ['./mxgraph.component.css'],
})

export class MxgraphComponent implements OnInit, OnDestroy {

    editMode: Observable<SidebarChange>; // type SidebarChange = 'default' | 'edit' | 'recommend'
    currentSelection: meteorID;
    currentSelectionSub: Subscription;
    currentEdgeSelectionSub: Subscription;
    public test:boolean = true;
    recommendations: Observable<BatchRecommendations>;

    vocabularySub: Subscription;

    @ViewChild('view',{static: true}) mxGraphView: ElementRef;
    @ViewChild('dEmptyGraph',{static: true}) showDialogForEmptyGraph: ElementRef;
    @ViewChild('batchrec',{static: true}) BatchRecommenderComponent: ElementRef;
    
    mx: MxgraphService;
    vocabID: string;
    classes: Observable<IClassWithProperties[]>;
    vocabulary: IvocabularyExtended;
    classNames: string[];
    propertyNames: string[];

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event) {
        if (event.keyCode === 27) { // 27 is keycode for ESC
            this.sideBarState.changeBySelection('default');
        }
    }


    constructor(
        private route: ActivatedRoute,
        private vocabService: VocabulariesService,
        private recommenderService: RecommendationService,
        private sideBarState: SideBarStateService,
        private modalService: NzModalService) {
        this.editMode = this.sideBarState.editMode;
    }


    ngOnInit() {
        this.vocabID = this.route.snapshot.paramMap.get('id');
        this.classNames = []
        this. propertyNames =[]
        // TODO: Currently creates a new instance with each subscription. Use something like this instead: .multicast(new BehaviorSubject([]));
        // This did, however, not work.
        this.classes = this.vocabService.getClassesWithProperties(this.vocabID);
        this.mx = new MxgraphService(this.mxGraphView.nativeElement);
        this.sideBarState.changeSidebarToDefault()

        this.currentEdgeSelectionSub = this.mx.currentEdgeSelection().subscribe(edgeSelection => {
            if (edgeSelection != null) {
                const modal = this.modalService.create({
                    nzTitle: 'Actions on Property',
                    nzContent: PropertyEditModal,
                    nzComponentParams: {
                        propListString: edgeSelection.edgeID,
                        propSourceNodeId: edgeSelection.domainClazzID
                    },
                    nzFooter: [
                        {
                            type: 'default',
                            label: 'Cancel',
                            onClick: (componentInstance) => {
                                modal.destroy()
                            }
                        }
                        , {

                            type: 'primary',
                            label: 'Update',
                            onClick: (componentInstance) => {
                                componentInstance.closeModal();
                            }
                        }, {
                            type: 'danger',
                            label: 'Delete',
                            onClick: (componentInstance) => {
                                componentInstance.deleteProp();
                            }
                        }
                    ]
                });
            }
        })

        this.currentSelectionSub = this.mx.currentSelection().pipe(
            map(
                (classSelection) => {
                    if (classSelection !== null) {
                        return classSelection;
                    } else {
                        return null;
                    }
                }
            ),
            debounceTime(20),
            distinctUntilChanged()
        ).subscribe((selection) => {
            this.sideBarState.changeBySelection(selection);
            this.currentSelection = selection;
        });

        // TODO It looks like this currently leaks observables.
        this.mx.deleteRequestObservable().pipe(
            combineLatest(this.mx.currentEdgeSelection(), this.mx.currentSelection(),
                (keyevent, edgeSel, nodeSel) => ({ key: keyevent, edge: edgeSel, node: nodeSel })
            ),
            filter((possibleDelReq) => possibleDelReq.key !== null && (possibleDelReq.edge !== null || possibleDelReq.node !== null))
        ).subscribe(
            (deleteRequest) => {
                console.log('delete key presses seem to be not deatlh correctly atm. Pressing the del key multiple times and then clicking nodes, fires delete events still.');
                if (deleteRequest.edge !== null) {
                    // this.vocabService.deleteProperty();
                    console.log('delete edge ', deleteRequest.edge);
                }
                if (deleteRequest.node !== null) {
                    console.log('delete node', deleteRequest.node);
                }
            }
        );

        this.vocabularySub = this.vocabService.getVocabulary(this.vocabID).pipe(map((vocab, index) => {
            let emailAddress = ""
            vocab.authors.forEach(author => emailAddress += this.vocabService.getEmailAddress(author) + " ")
            let newVocab = <IvocabularyExtended>{};
            newVocab._id = vocab._id;
            newVocab.authorsEmailAddress = emailAddress;
            newVocab.authors = vocab.authors;
            newVocab.classes = vocab.classes;
            newVocab.description = vocab.description;
            newVocab.name = vocab.name;
            newVocab.public = vocab.public;
            newVocab.uriPrefix = vocab.uriPrefix;
            return newVocab;
        })).subscribe(
            (v) => this.vocabulary = v,
            (e) => console.log(e),
            () => this.vocabulary = null
        );

        this.mx.addDragListener((ids, dx, dy) => {
            this.vocabService.translateClasses(ids, dx, dy);
        });

        this.classes.pipe(
            startWith([]),
            debounceTime(1000),
        ).subscribe((cs) => {
            if(!cs.length){
                //this.showDialogForEmptyGraph.nativeElement.showModal()
                return;
            }
            this.mx.startTransaction();

            this.mx.clearModel();

            // insert classes
            cs.forEach((c) => {
                this.mx.insertClass(c._id, c.name, c.position.x, c.position.y)
                this.classNames.push(c.name)}
            );

            // insert properties
            cs.forEach((c) => {
                // grouping the properties by their target
                const merged = this.mergeProperties(c);
                merged.properties.forEach((p) =>{
                    this.mx.insertProperty(c._id,
                        p._id, p.name,
                        p.rangeID)
                        this.propertyNames.push(p.name) }
                );
            });

            this.mx.endTransaction();
        });
        
    }// end ngOnInit
    mergeProperties(c: IClassWithProperties): IMergedPropertiesClass {
        // only takes the necessary parts
        const withMergedProps: IMergedPropertiesClass = { _id: c._id, properties: [], name: c.name };
        // merge the properties and fill.
        // TODO: is this better solved with a ES6 Map?
        const grouped = c.properties.reduce(
            (groups, x, ignored) => {
                (groups[x.range._id] = groups[x.range._id] || []).push(x);
                return groups;
            }, Object.create(null));

        // We used Object.create(null) to make grouped. So, it does not have any non-own properties.
        // in fact, it does not have hasOwnProperty
        // tslint:disable-next-line:forin
        for (const key in grouped) {
            // if (grouped.hasOwnProperty(key)) {
            const group: Array<{
                _id: string;
                name: string;

                range: IClassWithProperties;
            }> = grouped[key];
            // join names
            const nameList: string[] = group.reduce<string[]>(
                (combinedNameAcc, prop, ignores) => {
                    combinedNameAcc.push(prop.name);
                    return combinedNameAcc;
                }, []);
            const keyList: string[] = group.reduce<string[]>(
                (combinedNameAcc, prop, ignores) => {
                    combinedNameAcc.push(prop._id);
                    return combinedNameAcc;
                }, []);
            const combinedName = nameList.join(' | ');
            const combinedKey = keyList.join(',');
            withMergedProps.properties.push({ _id: combinedKey, name: combinedName, rangeID: group[0].range._id });
            // }
        }
        return withMergedProps;
    }

    showRecommender() {
        this.sideBarState.changeSidebarState('recommend');
    }

    showNodeCreator() {
        this.sideBarState.changeSidebarState('create');
    }


    async getBatchRecommendation() {

        this.recommendations = this.recommenderService.batchRecommendationsForClasses({keywords:this.classNames,properties:this.propertyNames,domain:"test"})
            this.test= false;

            this.BatchRecommenderComponent.nativeElement.showModal()
        }

    
    liftOntology(){
        
           // this.vocabService.updateClassName(this.selectedClassID, this.editedClass.name);
         
            //this.vocabService.updateClassDescription(this.selectedClassID, this.editedClass.description);
         
            //this.vocabService.updateClassURI(this.selectedClassID, this.editedClass.URI);
        this.test= true;
    }
    
    
    showEditBox() {
        console.log('show edit box')
        this.currentSelection = null;
        this.sideBarState.changeSidebarState('edit');
    }

    ngOnDestroy() {
        this.mx.destroy();
        this.currentSelectionSub.unsubscribe();
        this.vocabularySub.unsubscribe();
        this.currentEdgeSelectionSub.unsubscribe()
    }
}
