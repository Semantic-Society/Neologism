import { Injectable } from '@angular/core';
import { mxgraph as m } from 'mxgraph';
import { N3Codec } from './N3Codec';

// @Injectable()
export class MxgraphService {
    private static mx: typeof m = require('mxgraph')({
        mxImageBasePath: 'mxgraph/images',
        mxBasePath: 'mxgraph',
        mxLoadResources: false, // Disables synchronous loading of resources. Disables resource warnings for the moment.
    });

    private graph: m.mxGraph;
    private canvas: m.mxCell;
    private toolbar: m.mxToolbar;

    private cellByIRI: Map<string, m.mxCell>;
    private predicateSet = new Set(['http://www.w3.org/2000/01/rdf-schema#subClassOf']);

    constructor(private container: HTMLDivElement, private toolbarContainer: HTMLElement, private url: string) {
        if (!MxgraphService.mx.mxClient.isBrowserSupported()) MxgraphService.mx.mxUtils.error('Browser is not supported!', 200, false);

        this.graph = new MxgraphService.mx.mxGraph(container);          // Create the graph inside the given container
        const sel = new MxgraphService.mx.mxRubberband(this.graph);     // Enable rubberband selection (constructor side effect)
        MxgraphService.mx.mxEvent.disableContextMenu(container);        // Disable right click menu
        this.graph.setAllowDanglingEdges(false);                        // Disallow edges that are not connected to nodes
        this.graph.setAutoSizeCells(true);
        this.graph.autoSizeCellsOnAdd = true;
        this.graph.setConnectable(true);
        this.graph.setPanning(true);
        this.graph.panningHandler.useLeftButtonForPanning = true;
        this.graph.convertValueToString = (cell: m.mxCell) => cell.id;  // Enable mxGraph to extract cell labels

        // Overwrite label change handler in order to correctly write new lables to the user object
        const defaultLabelChangeHandler = this.graph.cellLabelChanged.bind(this.graph);
        this.graph.cellLabelChanged = (cell: m.mxCell, newValue: string, autoSize: boolean = true) => {
            cell.id = N3Codec.neologismId(newValue);
            defaultLabelChangeHandler(cell, cell.value, autoSize);
            this.getRecommendations();
        };

        const keyHandler = new MxgraphService.mx.mxKeyHandler(this.graph);
        keyHandler.bindKey(8, (evt) => this.graph.isEnabled() ? this.graph.removeCells() : null);   // delete key removes cell
        keyHandler.bindKey(43, (evt) => this.graph.isEnabled() ? this.graph.removeCells() : null);  // mac delete key removes cell


        // Adds mouse wheel handling for zoom
        MxgraphService.mx.mxEvent.addMouseWheelListener((evt, up) => {
            up ? this.graph.zoomIn() : this.graph.zoomOut();
            MxgraphService.mx.mxEvent.consume(evt);
        });

        // The default parent for inserting new cells. This is normally the first child of the root (ie. layer 0).
        this.canvas = this.graph.getDefaultParent();

        // Create layout algorithms to be used with the graph
        // const hierarchical = new MxgraphService.mx.mxHierarchicalLayout(this.graph);
        const organic = new MxgraphService.mx.mxFastOrganicLayout(this.graph);
        organic.forceConstant = 120;

        // Initialize a lookup map from subject IRI to the corresponding mxGraph cell and set up automatic syncronization
        this.cellByIRI = new Map([['', this.canvas]]);
        this.graph.addListener(MxgraphService.mx.mxEvent.CELLS_ADDED, (sender: m.mxEventSource, evt: m.mxEventObject) => {
            const cells: m.mxCell[] = (evt.getProperties() || {})['cells'];
            if (Array.isArray(cells)) cells.forEach((cell) => this.cellByIRI.set(cell.getId(), cell));
            organic.execute(this.canvas);
        });
        this.graph.addListener(MxgraphService.mx.mxEvent.CELLS_REMOVED, (sender: m.mxEventSource, evt: m.mxEventObject) => {
            const cells: m.mxCell[] = (evt.getProperties() || {})['cells'];
            if (Array.isArray(cells)) cells.forEach((cell) => this.cellByIRI.delete(cell.getId()));
            organic.execute(this.canvas);
        });

        this.toolbar = new MxgraphService.mx.mxToolbar(toolbarContainer);
        this.addToolbarVertex('assets/class_mockup.gif', 80, 30, 'shape=rounded');

        this.initialize();
    }

    private initialize() {
        try {
            const codec = new N3Codec();
            codec.parseUrl(this.url)
                .subscribe(
                    ([e, triple, prefixes]) => {    // Todo: Unsubscribe on delete
                        if (triple) {
                            // this.graph.getModel().beginUpdate();
                            this.addTriple(triple.subject, triple.predicate, triple.object);
                            // this.graph.getModel().endUpdate();
                        } else {
                            // console.log('# That\'s all, folks!');
                            codec.setPrefixes(prefixes);
                        }
                    },
                    (e) => console.log(e),
                    () => this.zoomToFit(),
            );
        } finally { }
    }

    private addToolbarItem(prototype: m.mxCell, image: string) {
        // Function that is executed when the image is dropped on
        // the graph. The cell argument points to the cell under
        // the mousepointer if there is one.
        const funct = (graph: m.mxGraph, evt: MouseEvent, cell: m.mxCell, x: number, y: number) => {
            graph.stopEditing(false);

            const vertex = this.graph.getModel().cloneCell(prototype);
            vertex.geometry.x = x;
            vertex.geometry.y = y;
            graph.addCell(vertex);
            graph.setSelectionCell(vertex);
        };

        // Creates the image which is used as the drag icon (preview)
        const img = this.toolbar.addMode(null, image, (evt: MouseEvent, cell: m.mxCell) => {
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
    ) {
        const v = this.cellByIRI.get(id);
        return v ? v : this.graph.insertVertex(this.canvas, id, {}, x, y, 100, 15);
    }

    private addEdge(
        id: string,
        v1: m.mxCell,
        v2: m.mxCell,
    ) {
        return this.graph.insertEdge(this.canvas, id, null, v1, v2);
    }

    private addTriple(subject: string, predicate: string, object: string) {
        if (typeof subject === 'string' && typeof predicate === 'string' && typeof object === 'string') {

            this.graph.getModel().beginUpdate();

            const v1 = this.getOrAddVertex(subject);
            if (this.predicateSet.has(predicate)) {
                // add it as a visible edge in graph
                const v2 = this.getOrAddVertex(object);
                this.addEdge(predicate, v1, v2);
            } else {
                // add it to user object
                const old = v1.getValue();                  // get old user object
                const cur = { ...old };                     // copy to current/new user object
                const oldValues = old[predicate] || [];     // get the old objects for this predicate
                const newValues = [...oldValues, object];   // construct array of old + new objects
                cur[predicate] = new Set(newValues);        // and add it (as a Set) to the new user object
                v1.setValue(cur);                           // finally commit the update
            }
            this.graph.getModel().endUpdate();
        }
    }

    /** Returns a turtle serialization of the current model */
    async serializeModel() {
        return await N3Codec.serializeModel(this.graph.getModel());
    }

    zoomToFit() {
        this.graph.fit();
    }

    getRecommendations() { // TODO: Stub - make actual calls
        this.serializeModel().then((res) => console.log(res)).catch((e) => console.log(e));
    }

    destroy() {
        this.graph.destroy();
        this.toolbar.destroy();
    }
}
