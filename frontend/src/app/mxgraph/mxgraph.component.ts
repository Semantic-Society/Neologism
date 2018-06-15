import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { mxgraph as m } from 'mxgraph';
import { Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { IUserObject, MxgraphService } from './mxgraph';
import { N3Codec } from './N3Codec';

import { Iclass, Ivocabulary, meteorID } from '../../../api/models';
import { IClassWithProperties, VocabulariesService } from '../services/vocabularies.service';

enum SideBarState {
    Default,
    Edit,
    Recommend,
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
    protected classes; // : Observable<IClassWithProperties[]>;
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
        this.currentSelectionSub = this.mx.currentSelection().subscribe((selection) => {
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
            console.log(ids, dx, dy);
            this.vocabService.translateClasses(ids, dx, dy);
        });

        this.classes.pipe(
            debounceTime(80),
        ).subscribe((cs) => {
            this.mx.startTransaction();

            this.mx.clearModel();

            // insert classes
            cs.forEach((c) =>
                this.mx.insertClass(c._id, c._id, c.position.x, c.position.y)
            );

            // insert properties
            cs.forEach((c) =>
                c.properties.forEach((p) =>
                    this.mx.insertProperty(c._id,
                        p._id, p.name,
                        p.range._id)
                )
            );

            this.mx.endTransaction();
        });

        // this.mx = new MxgraphService(
        //     this.mxGraphView.nativeElement,
        //     document.getElementById('mx-toolbar'),
        //     'http://xmlns.com/foaf/spec/index.rdf');
    }

    showRecommender() {
        this.editMode = SideBarState.Recommend;
    }

    ngOnDestroy() {
        this.mx.destroy();
        this.currentSelectionSub.unsubscribe();
        this.vocabularySub.unsubscribe();
    }
}
