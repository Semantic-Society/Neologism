import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { mxgraph as m } from 'mxgraph';
import { Observable } from 'rxjs/Observable';

import { IUserObject, MxgraphService } from './mxgraph';
import { N3Codec } from './N3Codec';

import { Iclass } from '../../../api/models';
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
    currentSelection: IUserObject;
    sideBarState = SideBarState;

    @ViewChild('view') mxGraphView: ElementRef;
    protected mx: MxgraphService;
    protected id: string;
    protected classes: Observable<IClassWithProperties[]>;

    constructor(private route: ActivatedRoute, private vocabService: VocabulariesService) {
        this.editMode = SideBarState.Default;
    }

    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id');

        this.mx = new MxgraphService(
            this.mxGraphView.nativeElement,
            // document.getElementById('mx-toolbar'),
            this.id
        );

        // console.log('the is of the vocb is ' + this.id);
        this.classes = this.vocabService.getClassesWithProperties(this.id);

        // this.vocabService.addClass(this.id, 'ClassName', 'Iraklis did it', 'the URI');
        // this.vocabService.addProperty('t7LhQpL5GpkK9qsuc', 'myprop', 'nice prop', 'example.org', 't7LhQpL5GpkK9qsuc');

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
