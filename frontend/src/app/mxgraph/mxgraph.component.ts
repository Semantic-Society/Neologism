import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import mxgraphFactory, { mxgraph as mx } from 'mxgraph';
import "rxjs/add/operator/take";

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
    canvas: mx.mxCell;
    container: HTMLDivElement;

    constructor() { }

    addVertex(
        id: string,
        x: number = Math.random() * this.container.clientWidth,
        y: number = Math.random() * this.container.clientHeight,
        w: number = 80,
        h: number = 30,
    ) {
        return this.graph.insertVertex(this.canvas, id, id, x, y, w, h);
    }

    ngOnInit() {
        // Checks if the browser is supported
        if (!this.mxClient.isBrowserSupported()) {
            this.mxUtils.error('Browser is not supported!', 200, false);
        } else {
            this.container = this.mxGraphView.nativeElement;

            // Creates the graph inside the given container
            this.graph = new this.mxGraph(this.container);

            // Enables rubberband selection - Weird constructor side effect stuff
            const rubberband = new this.mxRubberband(this.graph);

            // Gets the default parent for inserting new cells. This
            // is normally the first child of the root (ie. layer 0).
            this.canvas = this.graph.getDefaultParent();

            // Adds cells to the model in a single step
            // this.graph.getModel().beginUpdate();
           const predicateSet = new Set(['http://www.w3.org/2000/01/rdf-schema#subClassOf']);
  
            try {
                const codec = new N3Codec();
                codec.parseUrl('http://xmlns.com/foaf/spec/index.rdf')
                    .take(50)
                    .subscribe(([e, triple, prefixes]) => {    // Todo: Unsubscribe on delete
                        
                      // Consider only those predicate for graph display which are in predicateSet
                        if (triple && predicateSet.has(triple.predicate)) {
                            console.log(
                              // triple.subject, 
                              triple.predicate, 
                              // triple.object
                            );
                                this.graph.getModel().beginUpdate();
                                const v1 = this.addVertex(triple.subject);
                                const v2 = this.addVertex(triple.object);
                                this.graph.insertEdge(this.canvas, triple.predicate, triple.predicate, v1, v2);
                                this.graph.getModel().endUpdate();
                        } else {
                            console.log('# That\'s all, folks!', prefixes);
                        }
                    });
            }
            finally {
                // Updates the display
                // this.graph.getModel().endUpdate();
            }
        }
    }
}
