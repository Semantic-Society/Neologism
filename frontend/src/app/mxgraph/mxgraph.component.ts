import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import mxgraphFactory, { mxgraph as mx} from 'mxgraph';
import { N3Codec } from './N3Codec';

@Component({
    selector: 'app-mxgraph',
    templateUrl: './mxgraph.component.html',
    styleUrls: ['./mxgraph.component.css'],
})
export class MxgraphComponent implements OnInit {
    @ViewChild('view') mxGraphView: ElementRef;

    mx = mxgraphFactory({
        mxImageBasePath: 'mxgraph/images',
        mxBasePath: 'mxgraph',
    });
    mxGraph = this.mx.mxGraph;
    mxClient = this.mx.mxClient;
    mxUtils = this.mx.mxUtils;
    mxRubberband = this.mx.mxRubberband;

    graph: mx.mxGraph;

    constructor() { }

    ngOnInit() {
        // Checks if the browser is supported
        if (!this.mxClient.isBrowserSupported()) {
            this.mxUtils.error('Browser is not supported!', 200, false);
        } else {
            // Creates the graph inside the given container
            this.graph = new this.mxGraph(this.mxGraphView.nativeElement);
            // this.graph = new this.mxGraph(this.mxGraphView.nativeElement);

            // Enables rubberband selection - Weird constructor side effect stuff
            const rubberband = new this.mxRubberband(this.graph);

            // Gets the default parent for inserting new cells. This
            // is normally the first child of the root (ie. layer 0).
            const parent = this.graph.getDefaultParent();

            // Adds cells to the model in a single step
            this.graph.getModel().beginUpdate();
            try {
                const codec = new N3Codec();
                codec.parseUrl('http://xmlns.com/foaf/spec/index.rdf')
                    .subscribe(([e, triple, prefixes]) => {    // Todo: Unsubscribe on delete
                        if (triple) {
                            console.log(triple.subject, triple.predicate, triple.object, '.');
                        } else {
                            console.log('# That\'s all, folks!', prefixes);
                        }
                    });
                const v1 = this.graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
                const v2 = this.graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
                this.graph.insertEdge(parent, null, '', v1, v2);
            }
            finally {
                // Updates the display
                this.graph.getModel().endUpdate();
            }
        }
    }
}
