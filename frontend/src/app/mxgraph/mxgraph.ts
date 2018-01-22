import { Injectable } from '@angular/core';
import mxgraphFactory, { mxgraph as mx } from 'mxgraph';

// @Injectable()
export class MxgraphService {
    private static mx = mxgraphFactory({
        mxImageBasePath: 'mxgraph/images',
        mxBasePath: 'mxgraph',
    });

    container: HTMLDivElement;
    toolbarContainer: HTMLElement;
    graph: mx.mxGraph;
    canvas: mx.mxCell;

    cellById: Map<string, mx.mxCell>;
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
        this.graph.convertValueToString = (cell: mx.mxCell) => {
            if (!cell || !cell.value) {
                return '';
            }

            if (typeof cell.value === 'string') {
                return cell.value;
            }

            return cell.value['label'] || '';
        };

        // Overwrite label change handler in order to correctly write new lables to the user object
        const cellLabelChanged = this.graph.cellLabelChanged;
        this.graph.cellLabelChanged = function (cell: mx.mxCell, newValue: string, autoSize: boolean = true) {
            if (cell && typeof cell.value !== 'string') {
                // Clones the value for correct undo/redo
                newValue = { ...cell.value, label: newValue } as any;
                console.log(newValue);
            }
            cellLabelChanged.apply(this, arguments);
        };

        // Ensure any cell addition/deletion in the mxGraph UI is reflected in our private data structure
        /*this.graph.addListener(mx.mxEvent.CELLS_ADDED, (evt: mx.mxEventObject) => {
            const cells: mx.mxCell[] = (evt.getProperties() || {})['cells'];
            if (Array.isArray(cells)) {
                cells.forEach((cell) => this.cellById.set(cell.getId(), cell));
            }
        });
        this.graph.addListener(mx.mxEvent.CELLS_REMOVED, (evt: mx.mxEventObject) => {
            const cells: mx.mxCell[] = (evt.getProperties() || {})['cells'];
            if (Array.isArray(cells)) {
                cells.forEach((cell) => this.cellById.delete(cell.getId()));
            }
        });*/

        // Enables rubberband selection - Weird constructor side effect stuff
        const rubberband = new MxgraphService.mx.mxRubberband(this.graph);


        const keyHandler = new MxgraphService.mx.mxKeyHandler(this.graph);
        keyHandler.bindKey(8, (evt) => this.graph.isEnabled() ? this.graph.removeCells() : null);
        keyHandler.bindKey(43, (evt) => this.graph.isEnabled() ? this.graph.removeCells() : null);

        // Disables dangling edges
        this.graph.setAllowDanglingEdges(false);

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        this.canvas = this.graph.getDefaultParent();

        this.cellById = new Map([['', this.canvas]]);

        const toolbar = new MxgraphService.mx.mxToolbar(this.toolbarContainer);

        /*var addVertex = function (icon, w, h, style) {
            var vertex = new MxgraphService.mx.mxCell(null, new MxgraphService.mx.mxGeometry(0, 0, w, h), style);
            vertex.setVertex(true);

            var img = this.addToolbarItem(container, toolbar, vertex, icon);
            img.enabled = true;
        };
        addVertex('assets/class_mockup.gif', 80, 30, 'shape=rounded');*/

    }

    /*addToolbarItem(graph: HTMLDivElement, toolbar: mx.mxToolbar, prototype: HTMLElement, image: String) {
        // Function that is executed when the image is dropped on
        // the graph. The cell argument points to the cell under
        // the mousepointer if there is one.
        var funct = function (graph, evt, cell, x, y) {

            var vertex = graph.getModel().cloneCell(prototype);
            vertex.geometry.x = x;
            vertex.geometry.y = y;

            graph.addCell(vertex);
            graph.setSelectionCell(vertex);
        };

        // Creates the image which is used as the drag icon (preview)
        var img = toolbar.addMode(null, image, function (evt, cell) {
            var pt = this.graph.getPointForEvent(evt);
            funct(graph, evt, cell, pt.x, pt.y);
        });

        // Disables dragging if element is disabled. This is a workaround
        // for wrong event order in IE. Following is a dummy listener that
        // is invoked as the last listener in IE.
        MxgraphService.mx.mxEvent.addListener(img, 'mousedown', function (evt) {
            // do nothing
        });

        // This listener is always called first before any other listener
        // in all browsers.
        MxgraphService.mx.mxEvent.addListener(img, 'mousedown', function (evt) {
            //if (img.enabled == false) {
                MxgraphService.mx.mxEvent.consume(evt);
            //}
        });

        MxgraphService.mx.mxUtils.makeDraggable(img, graph, funct);

        return img;
    }*/

    private addVertex(
        id: string,
        x: number = Math.random() * this.container.clientWidth,
        y: number = Math.random() * this.container.clientHeight,
        w: number = 80,
        h: number = 30,
    ) {
        const v = this.cellById.get(id);
        return v ? v : this.graph.insertVertex(this.canvas, id, { label: id }, x, y, w, h);
    }

    private addEdge(
        id: string,
        v1: mx.mxCell,
        v2: mx.mxCell,
    ) {
        return this.graph.insertEdge(this.canvas, id, null, v1, v2);
    }

    addTriple(subject: string, predicate: string, object: string) {
        if (typeof subject === 'string' && typeof predicate === 'string' && typeof object === 'string') {
            const v1 = this.addVertex(subject);
            if (this.predicateSet.has(predicate)) {
                const v2 = this.addVertex(object);
                return this.addEdge(predicate, v1, v2);
            } else {
                const oldVal = v1.getValue();
                const newVal = {
                    ...oldVal,
                    [predicate]: new Set([...(oldVal[predicate] || []), object]),
                };
                v1.setValue(newVal as any);
                console.log(newVal);
            }
        }
        return null;
    }

    destroy() {
        this.graph.destroy();
    }
}
