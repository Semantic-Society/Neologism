import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/take';

import { MxgraphService } from './mxgraph';
import { N3Codec } from './N3Codec';

@Component({
    selector: 'app-mxgraph',
    templateUrl: './mxgraph.component.html',
    styleUrls: ['./mxgraph.component.css'],
})
export class MxgraphComponent implements OnInit, OnDestroy {
    @ViewChild('view') mxGraphView: ElementRef;
    private mx: MxgraphService;

    constructor() { }

    ngOnInit() {
        this.mx = new MxgraphService(
            this.mxGraphView.nativeElement,
            document.getElementById('mx-toolbar'),
            'assets/dcat.ttl');

        window['mxgraphService'] = this.mx; // TODO: Fix this FUCKING UGLY Workaround


        // this.mx = new MxgraphService(
        //     this.mxGraphView.nativeElement,
        //     document.getElementById('mx-toolbar'),
        //     'http://xmlns.com/foaf/spec/index.rdf');
    }

    ngOnDestroy() {
        this.mx.destroy();
    }
}
