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
        this.mx = new MxgraphService(this.mxGraphView.nativeElement, document.getElementById('mx-toolbar'));
        try {
            const codec = new N3Codec();
            codec.parseUrl('http://xmlns.com/foaf/spec/index.rdf')
                .take(50)
                .subscribe(([e, triple, prefixes]) => {    // Todo: Unsubscribe on delete
                    if (triple) {
                        // console.log(triple.subject, triple.predicate, triple.object, '.');

                        this.mx.graph.getModel().beginUpdate();
                        this.mx.addTriple(triple.subject, triple.predicate, triple.object);
                        this.mx.graph.getModel().endUpdate();
                    } else {
                        console.log('# That\'s all, folks!', prefixes);
                    }
                },
                    (e) => console.log(e),
                    () => {
                        this.mx.graph.autoSizeCell(this.mx.canvas);
                        this.mx.graph.fit();
                    },
            );
        }
        finally {
            // Updates the display
            // this.graph.getModel().endUpdate();
        }
    }

    ngOnDestroy() {
        this.mx.destroy();
    }
}
