import { Injectable } from '@angular/core';
import { mxgraph } from 'mxgraph';
import { N3Codec } from './N3Codec';

// @Injectable()
export class MxgraphService {
    private static mx: typeof mxgraph = require('mxgraph')({
        mxImageBasePath: 'mxgraph/images',
        mxBasePath: 'mxgraph',
    });

    container: HTMLDivElement;
    toolbarContainer: HTMLElement;
    graph: mxgraph.mxGraph;
    canvas: mxgraph.mxCell;
    toolbar: mxgraph.mxToolbar;

    cellByIRI: Map<string, mxgraph.mxCell>;
    predicateSet = new Set(['http://www.w3.org/2000/01/rdf-schema#subClassOf']);

    constructor(container: HTMLDivElement, toolbarContainer: HTMLElement) {
        // Checks if the browser is supported
        if (!MxgraphService.mx.mxClient.isBrowserSupported()) {
            MxgraphService.mx.mxUtils.error('Browser is not supported!', 200, false);
        }

        this.container = container;
        this.toolbarContainer = toolbarContainer;

        // Creates the graph inside the given container
        this.graph = new MxgraphService.mx.mxGraph(this.container);

        // Provide accessor for mxGraph to be able to extract Cell labels from user object
        this.graph.convertValueToString = (cell: mxgraph.mxCell) => {
            if (!cell || !cell.value) {
                return '';
            }

            if (typeof cell.value === 'string') {
                return cell.value;
            }

            return cell.value['label'] || '';
        };

        // Overwrite label change handler in order to correctly write new lables to the user object
        const defaultLabelChangeHandler = this.graph.cellLabelChanged.bind(this.graph);
        this.graph.cellLabelChanged = (cell: mxgraph.mxCell, newValue: string, autoSize: boolean = true) => { // TODO: Reject incorrect URLs
            if (cell && typeof cell.value === 'object') {
                newValue = { ...cell.value, label: newValue } as any; // clone the value for correct undo/redo
            }
            defaultLabelChangeHandler(cell, newValue, autoSize);
        };

        // Ensure any cell addition/deletion in the mxGraph UI is reflected in our private data structure
        this.graph.addListener(MxgraphService.mx.mxEvent.CELLS_ADDED, (sender: mxgraph.mxEventSource, evt: mxgraph.mxEventObject) => {
            const cells: mxgraph.mxCell[] = (evt.getProperties() || {})['cells'];
            if (Array.isArray(cells)) {
                cells.forEach((cell) => this.cellByIRI.set(cell.getId(), cell));
            }
        });
        this.graph.addListener(MxgraphService.mx.mxEvent.CELLS_REMOVED, (sender: mxgraph.mxEventSource, evt: mxgraph.mxEventObject) => {
            const cells: mxgraph.mxCell[] = (evt.getProperties() || {})['cells'];
            if (Array.isArray(cells)) {
                cells.forEach((cell) => this.cellByIRI.delete(cell.getId()));
            }
        });

        // Enables rubberband selection - Weird constructor side effect stuff
        const rubberband = new MxgraphService.mx.mxRubberband(this.graph);

        const keyHandler = new MxgraphService.mx.mxKeyHandler(this.graph);
        keyHandler.bindKey(8, (evt) => this.graph.isEnabled() ? this.graph.removeCells() : null);   // delete key removes cell
        keyHandler.bindKey(43, (evt) => this.graph.isEnabled() ? this.graph.removeCells() : null);  // mac delete key removes cell

        // Disallows edges that are not connected to nodes
        this.graph.setAllowDanglingEdges(false);
        this.graph.setAutoSizeCells(true);
        this.graph.autoSizeCellsOnAdd = true;

        // The default parent for inserting new cells. This is normally the first child of the root (ie. layer 0).
        this.canvas = this.graph.getDefaultParent();

        // Initialize a lookup map from subject IRI to the corresponding mxGraph cell
        this.cellByIRI = new Map([['', this.canvas]]);

        this.toolbar = new MxgraphService.mx.mxToolbar(this.toolbarContainer);
        this.addToolbarVertex('assets/class_mockup.gif', 80, 30, 'shape=rounded');
    }

    private addToolbarItem(prototype: mxgraph.mxCell, image: string) {
        // Function that is executed when the image is dropped on
        // the graph. The cell argument points to the cell under
        // the mousepointer if there is one.
        const funct = (graph: mxgraph.mxGraph, evt: MouseEvent, cell: mxgraph.mxCell, x: number, y: number) => {
            graph.stopEditing(false);

            const vertex = this.graph.getModel().cloneCell(prototype);
            vertex.geometry.x = x;
            vertex.geometry.y = y;
            graph.addCell(vertex);
            graph.setSelectionCell(vertex);
        };

        // Creates the image which is used as the drag icon (preview)
        const img = this.toolbar.addMode(null, image, (evt: MouseEvent, cell: mxgraph.mxCell) => {
            const pt = this.graph.getPointForEvent(evt, false);
            funct(this.graph, evt, cell, pt.x, pt.y);
        });

        // This listener is always called first before any other listener in all browsers.
        // MxgraphService.mx.mxEvent.addListener(img, 'mousedown', (evt) => MxgraphService.mx.mxEvent.consume(evt));

        MxgraphService.mx.mxUtils.makeDraggable(img, this.graph, funct);
        return img;
    }
    private addToolbarVertex(icon: string, w: number, h: number, style) {
        const vertex = new MxgraphService.mx.mxCell(null, new MxgraphService.mx.mxGeometry(0, 0, w, h), style);
        vertex.setVertex(true);
        const img = this.addToolbarItem(vertex, icon);
        // img.enabled = true;
    }

    private getOrAddVertex(
        id: string,
        x: number = Math.random() * this.container.clientWidth,
        y: number = Math.random() * this.container.clientHeight,
        w: number = 80,
        h: number = 30,
    ) {
        const v = this.cellByIRI.get(id);
        return v ? v : this.graph.insertVertex(this.canvas, id, { label: id }, x, y, w, h);
    }

    private addEdge(
        id: string,
        v1: mxgraph.mxCell,
        v2: mxgraph.mxCell,
    ) {
        return this.graph.insertEdge(this.canvas, id, null, v1, v2);
    }

    addTriple(subject: string, predicate: string, object: string) {
        if (typeof subject === 'string' && typeof predicate === 'string' && typeof object === 'string') {
            const v1 = this.getOrAddVertex(subject);
            if (this.predicateSet.has(predicate)) {
                // add it as a visible edge in graph
                const v2 = this.getOrAddVertex(object);
                return this.addEdge(predicate, v1, v2);
            } else {
                // add it to user object
                const old = v1.getValue();                  // get old user object
                const cur = { ...old };                     // copy to current/new user object
                const oldValues = old[predicate] || [];     // get the old objects for this predicate
                const newValues = [...oldValues, object];   // construct array of old + new objects
                cur[predicate] = new Set(newValues);        // and add it (as a Set) to the new user object
                v1.setValue(cur);                           // finally commit the update
            }
        }
        return null;
    }

    /** Returns a turtle serialization of the current model */
    async serializeModel() {
        return await N3Codec.serializeModel(this.graph.getModel());
    }

    destroy() {
        this.graph.destroy();
        this.toolbar.destroy();
    }
}
