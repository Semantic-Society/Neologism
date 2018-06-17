import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { mxgraph as m } from 'mxgraph';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, map, merge, combineLatest, distinctUntilChanged } from 'rxjs/operators';

import { IUserObject, MxgraphService } from './mxgraph';
import { N3Codec } from './N3Codec';

import { Iclass, Ivocabulary, meteorID } from '../../../api/models';
import { IClassWithProperties, VocabulariesService } from '../services/vocabularies.service';

enum SideBarState {
    Default,
    Edit,
    Recommend,
}

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
    editMode: SideBarState;
    currentSelection: meteorID;
    sideBarState = SideBarState;
    currentSelectionSub: Subscription;
    vocabularySub: Subscription;

    @ViewChild('view') mxGraphView: ElementRef;
    protected mx: MxgraphService;
    protected vocabID: string;
    protected classes: Observable<IClassWithProperties[]>;
    protected vocabulary: Ivocabulary;

    constructor(private route: ActivatedRoute, private vocabService: VocabulariesService) {
        this.editMode = SideBarState.Default;
    }

    ngOnInit() {
        this.vocabID = this.route.snapshot.paramMap.get('id');
        // TODO: Currently creates a new instance with each subscription. Use something like this instead: .multicast(new BehaviorSubject([]));
        // This did, however, not work.
        this.classes = this.vocabService.getClassesWithProperties(this.vocabID);
        this.mx = new MxgraphService(this.mxGraphView.nativeElement);

        // console.log('the is of the vocb is ' + this.id);

        // this.vocabService.addClass(this.vocabID, 'ClassName', 'Iraklis did it', 'the URI');
        // this.vocabService.addProperty('ikhjrcSqXJQQrgfC6', 'myprop', 'nice prop', 'example.org', 'c8YSBREPsKex4526d');

        // this.currentSelection = this.mx.currentSelection().publish(new BehaviorSubject<string>(null));
        this.currentSelectionSub = this.mx.currentSelection().pipe(
            combineLatest(this.mx.currentEdgeSelection(),
                (classSelection, edgeSelection) => {
                    if (classSelection !== null) {
                        return classSelection;
                    } else if (edgeSelection !== null) {
                        return edgeSelection.domainClazzID;
                    } else {
                        return null;
                    }
                }
            ),
            debounceTime(20),
            distinctUntilChanged()
        ).subscribe((selection) => {
            console.log('selectionChange:', selection);
            this.editMode = selection ? SideBarState.Edit : SideBarState.Default;
            this.currentSelection = selection;
        });

        this.vocabularySub = this.vocabService.getVocabulary(this.vocabID).subscribe(
            (v) => this.vocabulary = v,
            (e) => console.log(e),
            () => this.vocabulary = null
        );

        // this.mx.addSelectionListener((id: meteorID) => {
        //     if (id) {
        //         this.currentSelection = id;
        //         this.editMode = SideBarState.Edit;
        //     } else {
        //         this.currentSelection = null;
        //         this.editMode = SideBarState.Default;
        //     }
        // });

        this.mx.addDragListener((ids, dx, dy) => {
            // console.log(ids, dx, dy);
            this.vocabService.translateClasses(ids, dx, dy);
        });

        this.classes.pipe(
            debounceTime(80),
        ).subscribe((cs) => {
            this.mx.startTransaction();

            this.mx.clearModel();

            // insert classes
            cs.forEach((c) =>
                this.mx.insertClass(c._id, c.name, c.position.x, c.position.y)
            );

            // insert properties
            cs.forEach((c) => {
                // grouping the properties by their target
                const merged = this.mergeProperties(c);
                merged.properties.forEach((p) =>
                    this.mx.insertProperty(c._id,
                        p._id, p.name,
                        p.rangeID)
                );
            });

            this.mx.endTransaction();
        });

        // this.mx = new MxgraphService(
        //     this.mxGraphView.nativeElement,
        //     document.getElementById('mx-toolbar'),
        //     'http://xmlns.com/foaf/spec/index.rdf');
    }// end ngOnInit

    mergeProperties(c: IClassWithProperties): IMergedPropertiesClass {
        // only takes the necessary parts
        const withMergedProps: IMergedPropertiesClass = { _id: c._id, properties: [], name: c.name };
        // merge the properties and fill
        const grouped = c.properties.reduce(
            (groups, x, ignored) => {
                (groups[x.range._id] = groups[x.range._id] || []).push(x);
                return groups;
            }, {});

        for (const key in grouped) {
            if (grouped.hasOwnProperty(key)) {
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
                const combinedName = nameList.join(' | ');
                withMergedProps.properties.push({ _id: key, name: combinedName, rangeID: group[0].range._id });
            }
        }
        return withMergedProps;
    }

    showRecommender() {
        this.editMode = SideBarState.Recommend;
    }

    showEditBox() {
        this.currentSelection = null;
        this.editMode = SideBarState.Edit;
    }

    ngOnDestroy() {
        this.mx.destroy();
        this.currentSelectionSub.unsubscribe();
        this.vocabularySub.unsubscribe();
    }
}
