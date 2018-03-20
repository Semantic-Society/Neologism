import { Injectable } from '@angular/core';
import { mxgraph as m } from 'mxgraph';
import { N3Codec } from './N3Codec';

type Predicates = Map<string, Set<string>>;

// @Injectable()
export class MxgraphService {
    private static mx: typeof m = require('mxgraph')({
        mxImageBasePath: 'mxgraph/images',
        mxBasePath: 'mxgraph',
        mxLoadResources: false, // Disables synchronous loading of resources. Disables resource warnings for the moment.
    });

    private graph: m.mxGraph;
    private model: m.mxGraphModel;
    private canvas: m.mxCell;
    private toolbar: m.mxToolbar;
    private codec: N3Codec;

    private predicateSet = new Set(['http://www.w3.org/2000/01/rdf-schema#subClassOf']);

    constructor(private container: HTMLDivElement, private toolbarContainer: HTMLElement, private url: string) {
        if (!MxgraphService.mx.mxClient.isBrowserSupported()) MxgraphService.mx.mxUtils.error('Browser is not supported!', 200, false);

        this.graph = new MxgraphService.mx.mxGraph(container);          // Create the graph inside the given container
        this.model = this.graph.getModel();
        const sel = new MxgraphService.mx.mxRubberband(this.graph);     // Enable rubberband selection (constructor side effect)
        MxgraphService.mx.mxEvent.disableContextMenu(container);        // Disable right click menu
        this.graph.setAllowDanglingEdges(false);                        // Disallow edges that are not connected to nodes
        this.graph.setAutoSizeCells(true);
        this.graph.autoSizeCellsOnAdd = true;
        this.graph.setConnectable(true);
        this.graph.setPanning(true);
        this.graph.setCellsEditable(false);
        // this.graph.panningHandler.useLeftButtonForPanning = true;    // Breaks lasso selection!
        this.graph.convertValueToString = (cell: m.mxCell) => cell.getValue().label;  // Enable mxGraph to extract cell labels

        // Overwrite label change handler in order to correctly write new lables to the user object
        // const defaultLabelChangeHandler = this.graph.cellLabelChanged.bind(this.graph);
        // this.graph.cellLabelChanged = (cell: m.mxCell, newValue: string, autoSize: boolean = true) => {
        //     cell.id = N3Codec.neologismId(newValue);
        //     defaultLabelChangeHandler(cell, cell.value, autoSize);
        // };

        const keyHandler = new MxgraphService.mx.mxKeyHandler(this.graph);
        keyHandler.bindKey(8, (evt) => this.graph.isEnabled() ? this.graph.removeCells() : null);   // backspace key removes cell
        keyHandler.bindKey(43, (evt) => this.graph.isEnabled() ? this.graph.removeCells() : null);  // mac delete key removes cell
        keyHandler.bindKey(127, (evt) => this.graph.isEnabled() ? this.graph.removeCells() : null);  // proper operating systems delete

        // Adds mouse wheel handling for zoom
        MxgraphService.mx.mxEvent.addMouseWheelListener((evt, up) => {
            up ? this.graph.zoomIn() : this.graph.zoomOut();
            MxgraphService.mx.mxEvent.consume(evt);
        });

        // The default parent for inserting new cells. This is normally the first child of the root (ie. layer 0).
        this.canvas = this.graph.getDefaultParent();

        // Create layout algorithm to be used with the graph
        // const hierarchical = new MxgraphService.mx.mxHierarchicalLayout(this.graph, MxgraphService.mx.mxConstants.DIRECTION_SOUTH, true);
        const organic = new MxgraphService.mx.mxFastOrganicLayout(this.graph);
        organic.forceConstant = 120;

        // Initialize a lookup map from subject IRI to the corresponding mxGraph cell and set up automatic syncronization
        this.graph.addListener(MxgraphService.mx.mxEvent.CELLS_ADDED, (sender: m.mxEventSource, evt: m.mxEventObject) => {
            throw new Error('NOT  IMPELEMENTED'); // TODO Michael does this need to be implemented?
            // const cells: m.mxCell[] = (evt.getProperties() || {})['cells'];
            // if (Array.isArray(cells)) cells.forEach((cell) => this.model.set(cell.getId(), cell));
            // organic.execute(this.canvas);
        });
        // this.graph.addListener(MxgraphService.mx.mxEvent.CELLS_REMOVED, (sender: m.mxEventSource, evt: m.mxEventObject) => {
        //  throw new Error('NOT  IMPELEMENTED'); // TODO Michael does this need to be implemented?
        // const cells: m.mxCell[] = (evt.getProperties() || {})['cells'];
        // if (Array.isArray(cells)) cells.forEach((cell) => this.cellByIRI.delete(cell.getId()));
        // organic.execute(this.canvas);
        // });

        // this.toolbar = new MxgraphService.mx.mxToolbar(toolbarContainer);
        // this.addToolbarVertex('assets/class_mockup.gif', 80, 30, 'shape=rounded');

        this.codec = new N3Codec();
        const importingCodec = new N3Codec();
        importingCodec.loadUrl2store(this.url)
            .then(() => {
                this.codec.getClasses()
                    .forEach((element) => {
                        this.insertClass(element.uri, element.label);
                    });
                this.codec.getPredicates()
                    .forEach((element) => {
                        this.insertProperty(element.domain, element.uri, element.label, element.range);
                    });
                this.codec.getSubClassRelations()
                    .forEach((element) => {
                        this.insertSubclassRelation(element.domain, element.range);
                    });
                this.zoomToFit();
            });
    }

    // private addToolbarItem(prototype: m.mxCell, image: string) {
    //     // Function that is executed when the image is dropped on
    //     // the graph. The cell argument points to the cell under
    //     // the mousepointer if there is one.
    //     const funct = (graph: m.mxGraph, evt: MouseEvent, cell: m.mxCell, x: number, y: number) => {
    //         graph.stopEditing(false);

    //         const vertex = this.model.cloneCell(prototype);
    //         vertex.geometry.x = x;
    //         vertex.geometry.y = y;
    //         graph.addCell(vertex);
    //         graph.setSelectionCell(vertex);
    //     };

    //     // Creates the image which is used as the drag icon (preview)
    //     const img = this.toolbar.addMode(null, image, (evt: MouseEvent, cell: m.mxCell) => {
    //         const pt = this.graph.getPointForEvent(evt, false);
    //         funct(this.graph, evt, cell, pt.x, pt.y);
    //     });

    //     // This listener is always called first before any other listener in all browsers.
    //     // MxgraphService.mx.mxEvent.addListener(img, 'mousedown', (evt) => MxgraphService.mx.mxEvent.consume(evt));

    //     MxgraphService.mx.mxUtils.makeDraggable(img, this.graph, funct);
    //     return img;
    // }
    // private addToolbarVertex(icon: string, w: number, h: number, style) {
    //     const vertex = new MxgraphService.mx.mxCell(null, new MxgraphService.mx.mxGeometry(0, 0, w, h), style);
    //     vertex.setVertex(true);
    //     const img = this.addToolbarItem(vertex, icon);
    //     // img.enabled = true;
    // }

    private addEdge(
        uri: string,
        label: string,
        v1: m.mxCell,
        v2: m.mxCell,
    ) {
        return this.graph.insertEdge(this.canvas, null, { uri, label }, v1, v2);
    }

    public insertProperty(
        subject: string,
        predicate: string,
        predicateLabel: string,
        object: string
    ) {
        const v1 = this.model.getCell(subject);
        const v2 = this.model.getCell(object);

        if (!v1 || !v2) throw new Error('Classes do not exist');

        // Check if property is already existing
        const count = v1.getEdgeCount();
        for (let i = 0; i < count; i++) {
            const edge = v1.getEdgeAt(i);
            if (edge.getValue().uri === predicate && edge.getTerminal(false).getId() === object)
                return edge;
        }

        // insert in the codec:
        this.codec.addRDFSProperty(predicate, subject, object);
        this.codec.addLabel(predicate, predicateLabel);
        return this.graph.insertEdge(this.canvas, null, { uri: predicate, label: predicateLabel }, v1, v2);
    }

    public insertSubclassRelation(
        subclass: string,
        superclass: string,
    ) {
        const v1 = this.model.getCell(subclass);
        const v2 = this.model.getCell(superclass);

        if (!v1 || !v2) throw new Error('Classes do not exist');

        // Check if property is already existing
        const count = v1.getEdgeCount();
        for (let i = 0; i < count; i++) {
            const edge = v1.getEdgeAt(i);
            if (edge.getValue().uri === 'http://www.w3.org/2000/01/rdf-schema#subClassOf' && edge.getTerminal(false).getId() === superclass)
                return edge;
        }

        // insert in the codec:
        this.codec.addRDFSSubclassOf(subclass, superclass);
        return this.graph.insertEdge(this.canvas, null, { uri: 'http://www.w3.org/2000/01/rdf-schema#subClassOf', label: 'rdfs:subClassOf' }, v1, v2);
    }

    insertClass(
        uri: string,
        label: string,
        creator?: string,
        x: number = Math.random() * this.container.clientWidth,
        y: number = Math.random() * this.container.clientHeight,
    ) {
        let v = this.graph.getModel().getCell(uri);
        if (!v) {
            v = this.graph.insertVertex(this.canvas, uri, { uri, label, creator }, x, y, 100, 15);
            this.codec.addClass(uri);
            this.codec.addLabel(uri, label);
        }
        // return v;
    }

    /** Returns a turtle serialization of the current model */
    async serializeModel() {
        return await this.codec.serialize();
    }

    zoomToFit() {
        this.graph.fit();
    }

    destroy() {
        this.graph.destroy();
        this.toolbar.destroy();
    }

    selectClass(iri: string) {
        this.selectCells([this.model.getCell(iri)]);
    }

    private selectCells(cells: m.mxCell[]) {
        this.graph.setSelectionCells(cells);
    }
}
