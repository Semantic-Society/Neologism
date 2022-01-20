import {
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    map,
    startWith,
    takeUntil,
} from 'rxjs/operators';

import { MxgraphService } from './mxgraph';

import {
    Ivocabulary,
    meteorID,
    IvocabularyExtended,
    PropertyType,
    IClassWithProperties
} from '../../../api/models';
import {
    VocabulariesService,
} from '../services/vocabularies.service';

// import sidebar state dep.
import {
    SideBarStateService,
    SidebarChange,
} from '../services/state-services/sidebar-state.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { PropertyEditModal } from './property-edit-form/property-edit.component';
import { RecommendationService } from '../services/recommendation.service';
import { MeteorObservable, zoneOperator } from 'meteor-rxjs';
import { BatchRecommendations } from '../services/BatchRecommendations';

interface IMergedPropertiesClass {
    _id: string; // Mongo generated ID
    name: string;
    properties: {
        _id: string;
        name: string;
        rangeID: string; // just the ID
        type: PropertyType;
    }[];
}

@Component({
    selector: 'app-mxgraph',
    templateUrl: './mxgraph.component.html',
    styleUrls: ['./mxgraph.component.css'],
})

export class MxgraphComponent implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<boolean> = new Subject()
    editMode: Observable<SidebarChange>; // type SidebarChange = 'default' | 'edit' | 'recommend'
    currentSelection: meteorID;
    currentSelectionSub: Subscription;
    currentEdgeSelectionSub: Subscription;
    public batchPhase = true;
    recommendations$: Observable<BatchRecommendations>;
    domain: string;
    public editing = false;

    vocabularySub: Subscription;

    @ViewChild('view', { static: true }) mxGraphView: ElementRef;

    @ViewChild('dEmptyGraph', { static: true }) showDialogForEmptyGraph: ElementRef;

    mx: MxgraphService;
    vocabID: string;
    classes: Observable<IClassWithProperties[]>;
    vocabulary: IvocabularyExtended;
    classNames: string[];
    propertyNames: string[];
    recommendationLimit: number;
    layoutExecute = false;

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event) {
        if (event.keyCode === 27) {
            // 27 is keycode for ESC
            this.sideBarState.changeBySelection(null);
        }
    }


    constructor(
        private route: ActivatedRoute,
        private vocabService: VocabulariesService,
        private recommenderService: RecommendationService,
        private sideBarState: SideBarStateService,
        private modalService: NzModalService,
        private router: Router
    ) {
        this.editMode = this.sideBarState.editMode;
    }

    ngOnInit() {
        this.vocabID = this.route.snapshot.paramMap.get("id");
        this.route.queryParams
            .subscribe(params => {
                this.layoutExecute = params.layout == 'true';
            });
        // TODO (18): Currently creates a new instance with each subscription. Use something like this instead: .multicast(new BehaviorSubject([]));
        // This did, however, not work.
        this.classes = this.vocabService.getClassesWithProperties(this.vocabID);
        this.mx = new MxgraphService(this.mxGraphView.nativeElement);
        this.sideBarState.changeSidebarToDefault();

        this.currentEdgeSelectionSub = this.mx
            .currentEdgeSelection().pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((edgeSelection) => {
                if (edgeSelection != null) {
                    let modal = null
                    modal = this.openPropUpdateForm(edgeSelection, modal);
                }
            });

        this.currentSelectionSub = this.mx
            .currentSelection()
            .pipe(takeUntil(this.ngUnsubscribe),
                map((classSelection) => {
                    if (classSelection !== null) {
                        return classSelection;
                    } else {
                        return null;
                    }
                }),
                debounceTime(20),
                distinctUntilChanged()
            )
            .subscribe((selection) => {
                this.sideBarState.changeBySelection(selection);
                this.currentSelection = selection;
            });


        this.vocabularySub = this.vocabService
            .getVocabulary(this.vocabID)
            .pipe(takeUntil(this.ngUnsubscribe),
                map((vocab) => {
                    let emailAddress = '';
                    vocab.authors.forEach(
                        (author) =>
                            (emailAddress += this.vocabService.getEmailAddress(author) + ' ')
                    );
                    return this.transformVocab(vocab, emailAddress);
                })
            )
            .subscribe(
                (v) => (this.vocabulary = v),
                (e) => console.log(e),
                () => (this.vocabulary = null)
            );

        this.mx.addDragListener((ids, dx, dy) => {
            this.vocabService.translateClasses(ids, dx, dy);
        });

        this.classes.pipe(
            startWith([]),
            debounceTime(1000),
            takeUntil(this.ngUnsubscribe)
        ).subscribe((cs) => {
            if (!cs.length) {
                try {
                    this.showDialogForEmptyGraph.nativeElement.showModal();
                } catch (e) {
                    // console.log(e)
                }
                finally {
                    return;
                }
            }
            this.mx.startTransaction();

            this.mx.clearModel();

            // insert classes
            this.classNames = [];
            cs.forEach((c) => {

                if (c.isDataTypeVertex) {
                    this.mx.insertDashedClass(c._id, c.name, c.position.x, c.position.y);
                } else {
                    this.mx.insertClass(c._id, c.name, c.position.x, c.position.y);
                }

                !this.classNames.includes(c.name) ? this.classNames.push(c.name) : null;
            });

            cs = cs.filter(c => !c.isDataTypeVertex);
            // insert properties
            this.propertyNames = [];
            cs.forEach((c) => {
                // grouping the properties by their target
                const merged = this.mergeProperties(c);
                merged.properties.forEach((p) => {
                    !this.propertyNames.includes(p.name) ? this.propertyNames.push(p.name) : null;
                    this.mx.insertProperty(c._id,
                        p._id, p.name,
                        p.rangeID);
                });
            });

            this.mx.endTransaction();

            if (this.layoutExecute) {
                this.mx.executeLayout()
                this.mx.saveLayout(this.vocabService.translateClasses)
                this.layoutExecute = false
                this.clearQueryParam()
            }
        });

    }// end ngOnInit

    private openPropUpdateForm(edgeSelection: { domainClazzID: string; edgeID: string; isDataTypeProp: boolean; }, modal) {
        return this.modalService.create({
            nzTitle: 'Actions on Property',
            nzContent: PropertyEditModal,
            nzComponentParams: {
                propListString: edgeSelection.edgeID,
                domainClassId: edgeSelection.domainClazzID,
            },
            nzFooter: [
                {
                    type: 'default',
                    label: 'Cancel',
                    onClick: (componentInstance) => {
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
                        componentInstance.deleteProp();
                    },
                },
            ],
        });
    }

    private transformVocab(vocab: Ivocabulary, emailAddress: string) {
        const newVocab = {} as IvocabularyExtended;
        newVocab._id = vocab._id;
        newVocab.authorsEmailAddress = emailAddress;
        newVocab.authors = vocab.authors;
        newVocab.classes = vocab.classes;
        newVocab.description = vocab.description;
        newVocab.domain = vocab.domain;
        newVocab.name = vocab.name;
        newVocab.public = vocab.public;
        newVocab.uriPrefix = vocab.uriPrefix;
        return newVocab;
    }

    clearQueryParam() {
        this.router.navigate(
            ['.'],
            { relativeTo: this.route, queryParams: {} }
        );
    }

    /**
     * Method takes in class with props
     * reduces into a new group of props
     * @param c
     * @returns
     */
    mergeProperties(c: IClassWithProperties): IMergedPropertiesClass {
        // only takes the necessary parts
        const withMergedProps: IMergedPropertiesClass = { _id: c._id, properties: [], name: c.name };
        // merge the properties and fill.
        // TODO (184): is this better solved with a ES6 Map?
        const grouped = c.properties.reduce(
            (groups, x) => {
                if (x.type == PropertyType.Data) {
                    (groups[x._id] = groups[x._id] || []).push(x);
                } else {
                    (groups[x.range._id] = groups[x.range._id] || []).push(x);
                }

                return groups;
            }, Object.create(null));

        // We used Object.create(null) to make grouped. So, it does not have any non-own properties.
        // in fact, it does not have hasOwnProperty
        // eslint-disable-next-line guard-for-in
        for (const key in grouped) {
            // if (grouped.hasOwnProperty(key)) {
            const group: {
                _id: string;
                name: string;
                type: PropertyType;
                range: IClassWithProperties;
            }[] = grouped[key];
            // join names
            const nameList: string[] = group.reduce<string[]>(
                (combinedNameAcc, prop) => {
                    combinedNameAcc.push(prop.name);
                    return combinedNameAcc;
                }, []);
            const keyList: string[] = group.reduce<string[]>(
                (combinedNameAcc, prop) => {
                    combinedNameAcc.push(prop._id);
                    return combinedNameAcc;
                }, []);
            const combinedName = nameList.join(' | ');
            const combinedKey = keyList.join(',');
            withMergedProps.properties.push({ _id: combinedKey, name: combinedName, rangeID: group[0].range._id || group[0]._id as any, type: group[0].type });
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

    getBatchRecommendation() {


        this.recommendations$ = this.recommenderService.batchRecommendationsForClasses(
            {
                classes: this.classNames,
                properties: this.propertyNames,
                domain: this.vocabulary.domain,
                limit: this.recommendationLimit
            }
        );

        this.batchPhase = false;

    }

    hideBatch() {
        this.batchPhase = true;

    }

    startEdit() {
        this.editing = !this.editing;
    }

    editDomain() {
        MeteorObservable.call('vocabulary.addDomain', this.domain, this.vocabulary._id).pipe(zoneOperator())
            .subscribe((_response) => {
                // Handle success and response from server!
            }, (err) => {
                console.log(err);
                // Handle error
            });
        this.editing = false;
    }


    showEditBox() {
        console.log('show edit box');
        this.currentSelection = null;
        this.sideBarState.changeSidebarState('edit');
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next(true);
        this.ngUnsubscribe.complete();
        this.mx.destroy();

    }

}
