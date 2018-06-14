import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { mxgraph as m } from 'mxgraph';
import { BehaviorSubject, Observable } from 'rxjs';

import { IUserObject, MxgraphService } from './mxgraph';
import { N3Codec } from './N3Codec';

import { Iclass, meteorID } from '../../../api/models';
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

    @ViewChild('view') mxGraphView: ElementRef;
    protected mx: MxgraphService;
    protected id: string;
    protected classes; //: Observable<IClassWithProperties[]>;

    constructor(private route: ActivatedRoute, private vocabService: VocabulariesService) {
        this.editMode = SideBarState.Default;
    }

    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id');
        // TODO: Currently creates a new instance with each subscription. Use something like this instead: .multicast(new BehaviorSubject([])); 
        // This did, however, not work.
        this.classes = this.vocabService.getClassesWithProperties(this.id);
        this.mx = new MxgraphService(this.mxGraphView.nativeElement);

        // console.log('the is of the vocb is ' + this.id);

        this.vocabService.addClass(this.id, 'ClassName', 'Iraklis did it', 'the URI');
        this.vocabService.addProperty('t7LhQpL5GpkK9qsuc', 'myprop', 'nice prop', 'example.org', 't7LhQpL5GpkK9qsuc');

        this.mx.addSelectionListener((id: meteorID) => {
            if (id) {
                this.currentSelection = id;
                this.editMode = SideBarState.Edit;
            } else {
                this.currentSelection = null;
                this.editMode = SideBarState.Default;
            }
        });

        this.mx.addDragListener((ids, dx, dy) => {
            console.log(ids, dx, dy);
            this.vocabService.translateClasses(ids, dx, dy);
        });

        this.classes.debounceTime(80)
            .subscribe((cs) => {
                this.mx.startTransaction();

                this.mx.clearModel();

                // insert classes
                cs.forEach((c) =>
                    this.mx.insertClass(c._id, c.name, c.position.x, c.position.y)
                );

                // insert properties
                cs.forEach((c) =>
                    c.properties.forEach((p) =>
                        this.mx.insertProperty(c._id, p._id, p.name, p.range._id)
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
    }
}
