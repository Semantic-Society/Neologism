import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/take';

import { mxgraph as m } from 'mxgraph';
import { Observable } from 'rxjs/Observable';
import { IUserObject, MxgraphService } from './mxgraph';
import { N3Codec } from './N3Codec';
import { ActivatedRoute } from '@angular/router';

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
    currentSelection: IUserObject;
    sideBarState = SideBarState;

    @ViewChild('view') mxGraphView: ElementRef;
    protected mx: MxgraphService;

    constructor(private route: ActivatedRoute) {
        this.editMode = SideBarState.Default;
    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');

        this.mx = new MxgraphService(
            this.mxGraphView.nativeElement,
            // document.getElementById('mx-toolbar'),
            id
        );

        this.mx.addSelectionListener((userobjects: IUserObject[]) => {
            if (userobjects.length === 1) {
                this.currentSelection = userobjects[0];
                this.editMode = SideBarState.Edit;
            } else if (userobjects.length === 0) {
                this.editMode = SideBarState.Default;
            } else {
                throw new Error('Selection of more than one element can currently not be handled.');
            }
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
