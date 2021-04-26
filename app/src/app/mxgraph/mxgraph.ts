import * as m from 'mxgraph';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { enableDynamicGrid } from './dynamicGrid';
// import { N3Codec } from './N3Codec';

type Predicates = Map<string, Set<string>>;
// export interface IUserObject { url: string; label: string; creator: string; }

export class MxgraphService {

    static mx: typeof m = require('mxgraph')({
        mxImageBasePath: 'mxgraph/images',
        mxBasePath: 'mxgraph',
        mxLoadResources: false, // Disables synchronous loading of resources. Disables resource warnings for the moment.
    });

    graph: m.mxGraph;
    model: m.mxGraphModel;
    canvas: m.mxCell;
    transactionSelection;
    selection$: Observable<string>;
    wnd: any
    edgeSelection$: Observable<{ domainClazzID: string; edgeID: string }>;

    tb: m.mxToolbar;
    // public codec: N3Codec;

    deletePress: Subject<any>;

    constructor(
        private container: HTMLDivElement,
        //  toolbarContainer: HTMLElement,
    ) {
        if (!MxgraphService.mx.mxClient.isBrowserSupported()) MxgraphService.mx.mxUtils.error('Browser is not supported!', 200, false);

        this.graph = new MxgraphService.mx.mxGraph(container);          // Create the graph inside the given container
        this.model = this.graph.getModel();
        // const sel = new MxgraphService.mx.mxRubberband(this.graph);     // Enable rubberband selection (constructor side effect)
        MxgraphService.mx.mxEvent.disableContextMenu(container);        // Disable right click menu
        this.graph.setAllowDanglingEdges(false);                        // Disallow edges that are not connected to nodes
        this.graph.setAutoSizeCells(true);
        this.graph.autoSizeCellsOnAdd = true;
        this.graph.setCellsResizable(false);
        this.graph.setConnectable(false); // TODO: Implement this in the future?
        this.graph.setPanning(true);
        this.graph.setCellsEditable(false);
        this.graph.panningHandler.useLeftButtonForPanning = true;    // Breaks lasso selection!
        // this.graph.convertValueToString = (cell: m.mxCell) => cell.getValue().label;  // Enable mxGraph to extract cell labels
        enableDynamicGrid(this.graph, MxgraphService.mx);
        this.graph.view.refresh();
        // allow only one thing to be selected at the same time.
        this.graph.getSelectionModel().setSingleSelection(true);
        // Overwrite label change handler in order to correctly write new lables to the user object
        // const defaultLabelChangeHandler = this.graph.cellLabelChanged.bind(this.graph);
        // this.graph.cellLabelChanged = (cell: m.mxCell, newValue: string, autoSize: boolean = true) => {
        //     cell.id = N3Codec.neologismId(newValue);
        //     defaultLabelChangeHandler(cell, cell.value, autoSize);
        // };
        /*const vertexStyle = this.graph.stylesheet.getDefaultVertexStyle();
      vertexStyle[MxgraphService.mx.mxConstants.DEFAULT_VALID_COLOR] = '#FF0000';
      vertexStyle[MxgraphService.mx.mxConstants.OUTLINE_HIGHLIGHT_COLOR] = '#FF0000';
      vertexStyle[MxgraphService.mx.mxConstants.HIGHLIGHT_COLOR] = '#FF0000';
      vertexStyle[MxgraphService.mx.mxConstants.VALID_COLOR] = '#FF0000';
      vertexStyle[MxgraphService.mx.mxConstants.EDGE_SELECTION_COLOR] = '#FF0000';
      vertexStyle[MxgraphService.mx.mxConstants.VERTEX_SELECTION_COLOR] = '#FF0000';
      vertexStyle[MxgraphService.mx.mxConstants.HANDLE_FILLCOLOR] = '#FF0000';
        vertexStyle[MxgraphService.mx.mxConstants.HIGHLIGHT_STROKEWIDTH] = 10;*/

        const edgeStyle = this.graph.stylesheet.getDefaultEdgeStyle();
        edgeStyle[MxgraphService.mx.mxConstants.STYLE_FILLCOLOR] = '#FFFFFF';
        edgeStyle[MxgraphService.mx.mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#FFFFFF';

        this.deletePress = new Subject();
        const keyHandler = new MxgraphService.mx.mxKeyHandler(this.graph);
        keyHandler.bindKey(8, (evt) => {
            if (this.graph.isEnabled()) {
                this.deletePress.next(evt);
            }
        });   // backspace key removes cell
        keyHandler.bindKey(43, (evt) => {
            if (this.graph.isEnabled()) {
                this.deletePress.next(evt);
            }
        });  // mac delete key removes cell
        keyHandler.bindKey(127, (evt) => {
            if (this.graph.isEnabled()) {
                this.deletePress.next(evt);
            }
        });  // proper operating systems delete

        // Adds mouse wheel handling for zoom
        // see https://github.com/jgraph/mxgraph/blob/master/javascript/examples/grapheditor/www/js/EditorUi.js
        MxgraphService.mx.mxEvent.addMouseWheelListener((evt: MouseEvent, scrollUp: boolean) => {
            // Ctrl+wheel (or pinch on touchpad) is a native browser zoom event is OS X
            // LATER: Add support for zoom via pinch on trackpad for Chrome in OS X
            // if (((mxEvent.isControlDown(evt) && !MxgraphService.mx.mxClient.IS_MAC) || mxEvent.isAltDown(evt) ||
            //     this.graph.panningHandler.isActive()) /* && (this.dialogs == null || this.dialogs.length == 0) */) {

            if (this.container.contains(MxgraphService.mx.mxEvent.getSource(evt))) {

                scrollUp ? this.graph.zoomIn() : this.graph.zoomOut();

                const windowContainerOffset = MxgraphService.mx.mxUtils.getOffset(this.container); // 0:0
                const dx = windowContainerOffset.x + this.container.offsetWidth / 2 - MxgraphService.mx.mxEvent.getClientX(evt);
                const dy = windowContainerOffset.y + this.container.offsetHeight / 2 - MxgraphService.mx.mxEvent.getClientY(evt);

                const cx = dx * (this.graph.zoomFactor - 1);
                const cy = dy * (this.graph.zoomFactor - 1);

                if (cx !== 0 || cy !== 0) {
                    const t = this.graph.view.translate;
                    const s = this.graph.view.scale;

                    this.graph.view.setTranslate(Math.floor(t.x + cx / s), Math.floor(t.y + cy / s));
                }
            }
            // }
        });

        // The default parent for inserting new cells. This is normally the first child of the root (ie. layer 0).
        this.canvas = this.graph.getDefaultParent();

        // Create layout algorithm to be used with the graph
        // const hierarchical = new MxgraphService.mx.mxHierarchicalLayout(this.graph, MxgraphService.mx.mxConstants.DIRECTION_SOUTH, true);
        // const organic = new MxgraphServiBehaviorSubject,e.mx.mxFastOrganicLayout(this.graph);
        // organic.forceConstant = 120;

        // Initialize a lookup map from subject IRI to the corresponding mxGraph cell and set up automatic syncronization
        // this.graph.addListener(MxgraphService.mx.mxEvent.CELLS_ADDED, (sender: m.mxEventSource, evt: m.mxEventObject) => {
        // throw new Error('NOT  IMPELEMENTED'); // TODO Michael does this need to be implemented?
        // const cells: m.mxCell[] = (evt.getProperties() || {})['cells'];
        // if (Array.isArray(cells)) cells.forEach((cell) => this.model.set(cell.getId(), cell));
        // organic.execute(this.canvas);
        // });
        // this.graph.addListener(MxgraphService.mx.mxEvent.CELLS_REMOVED, (sender: m.mxEventSource, evt: m.mxEventObject) => {
        //  throw new Error('NOT  IMPELEMENTED'); // TODO Michael does this need to be implemented?
        // const cells: m.mxCell[] = (evt.getProperties() || {})['cells'];
        // if (Array.isArray(cells)) cells.forEach((cell) => this.cellByIRI.delete(cell.getId()));
        // organic.execute(this.canvas);
        // });

        // this.toolbar = new MxgraphService.mx.mxToolbar(toolbarContainer);
        // this.addToolbarVertex('assets/class_mockup.gif', 80, 30, 'shape=rounded');

        // this.codec = new N3Codec();
        // const importingCodec = new N3Codec();
        // importingCodec.loadUrl2store(this.url)
        //     .then(() => {
        //         this.codec.getClasses()
        //             .forEach((element) => {
        //                 this.insertClass(element.uri, element.label);
        //             });
        //         this.codec.getPredicates()
        //             .forEach((element) => {
        //                 this.insertProperty(element.domain, element.uri, element.label, element.comment, element.range);
        //             });
        //         this.codec.getSubClassRelations()
        //             .forEach((element) => {
        //                 this.insertSubclassRelation(element.domain, element.range);
        //             });
        //         this.zoomToFit();
        //     });

        this.selection$ = new Observable<string>((observer) => {
            const handler = (selectionModel: m.mxGraphSelectionModel, evt: m.mxEventObject) => {
                const values = selectionModel.cells
                    .filter((cell) => cell.vertex)
                    .map((cell) => cell.getId());
                if (values.length === 1) {
                    observer.next(values[0]);
                } else if (values.length === 0) {
                    observer.next(null);
                } else {
                    throw new Error('Multiple items selected. Should not be possible');
                }
            };
            this.graph.getSelectionModel().addListener(MxgraphService.mx.mxEvent.CHANGE, handler);
            return () => this.graph.getSelectionModel().removeListener(handler);
        }).pipe(distinctUntilChanged());

        this.edgeSelection$ = new Observable<{ domainClazzID: string; edgeID: string }>((observer) => {
            const handler = (selectionModel: m.mxGraphSelectionModel, evt: m.mxEventObject) => {
                const values = selectionModel.cells
                    .filter((cell) => cell.edge)
                    .map((cell) => cell.getId());
                if (values.length === 1) {
                    const edgeID: string = values[0];
                    const edgeO = this.getEdgeWithId(edgeID);
                    const sourceNode = edgeO.getTerminal(true);
                    const domainClazzID: string = sourceNode.getId();
                    observer.next({ domainClazzID, edgeID });
                } else if (values.length === 0) {
                    observer.next(null);
                } else {
                    throw new Error('Multiple items selected. Should not be possible');
                }
            };
            this.graph.getSelectionModel().addListener(MxgraphService.mx.mxEvent.CHANGE, handler);
            return () => this.graph.getSelectionModel().removeListener(handler);
        }).pipe(distinctUntilChanged());


        this.initializeToolBar()

    }

    getEdgeWithId(edgeID: string) {
        // TODO in principle getCell should work, but upon inserting there is an issue and the cell gets assingned a new id
        for (const key in this.model.cells) {
            if (this.model.cells.hasOwnProperty(key)) {
                const candidate = this.model.cells[key];
                if (candidate.edge && candidate.id === edgeID) {
                    return candidate;
                }
            }
        }
        throw new Error('edge with id ' + edgeID + ' not found');
    }

    //  addToolbarItem(prototype: m.mxCell, image: string) {
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
    //  addToolbarVertex(icon: string, w: number, h: number, style) {
    //     const vertex = new MxgraphService.mx.mxCell(null, new MxgraphService.mx.mxGeometry(0, 0, w, h), style);
    //     vertex.setVertex(true);
    //     const img = this.addToolbarItem(vertex, icon);
    //     // img.enabled = true;
    // }

    public startTransaction() {
        this.model.beginUpdate();
        this.transactionSelection = this.graph.getSelectionModel().cells.map((cell) => cell.getId());
    }

    public endTransaction() {
        this.assertTransaction();
        const selectedNewCells = this.transactionSelection.map((id) => this.model.getCell(id)).filter((x) => x);
        this.selectCells(selectedNewCells);
        this.transactionSelection = null;
        this.model.endUpdate();
    }

    public clearModel() {
        this.assertTransaction();
        this.graph.removeCells(this.graph.getChildCells(this.canvas, true, true)); // TODO: Assert this clear selection model
    }

    assertTransaction() {
        if (this.model.updateLevel <= 0) {
            throw new Error('Start a transaction before making changes');
        }
    }

    /** Add edge as mxcell to actual graph */
    addEdge(
        id: string,
        label: string,
        v1: m.mxCell,
        v2: m.mxCell,
    ) {
        const edge = this.graph.insertEdge(this.canvas, id, label, v1, v2);
        // there seems to be a bug in mxgraph, such that the id is not set properly upon insertion
        edge.setId(id);
        return edge;
    }

    /** takes a number and rounds it to align with drawing grid */
    alignToGrid(x: number) {
        return Math.round(x / this.graph.gridSize) * this.graph.gridSize;
    }

    viewCenter() {
        // -translate is the point at the top left of the screen
        let x: number = this.container.clientWidth / 2 / this.graph.view.scale - this.graph.view.translate.x;

        // containerDims/2/scale = offset to middle of screen
        let y: number = this.container.clientHeight / 2 / this.graph.view.scale - this.graph.view.translate.y;

        x = this.alignToGrid(x);
        y = this.alignToGrid(y);

        return { x, y };
    }

    /**
     * Inserts a new class into the graph
     * @param id The internal ID of the class
     * @param label The label to show in the rendering
     * @param x The x offset of the new class. Middle of screen by default.
     * @param y The y offset of the new class. Middle of screen by default.
     */
    public insertClass(id: string, label: string, x: number, y: number) {
        if (this.model.getCell(id)) {
            throw new Error('Class already exists');
        }
        this.assertTransaction();

        this.graph.insertVertex(this.canvas, id, label, x, y, 100, 15);
    }

    /**
     * Inserts a new property into the graph
     * @param subject The internal id of the property's domain
     * @param predicateID The internal id of the property itself
     * @param predicateLabel The label to display on the edge
     * @param object The internal id of the property's range
     */
    public insertProperty(
        subject: string,
        predicateID: string,
        predicateLabel: string,
        object: string
    ) {
        this.assertTransaction();

        const v1 = this.model.getCell(subject);
        const v2 = this.model.getCell(object);

        if (!v1 || !v2) {
            throw new Error('Classes do not exist');
        }

        // Check if property is already existing
        const count = v1.getEdgeCount();
        for (let i = 0; i < count; i++) {
            const edge = v1.getEdgeAt(i);
            if (edge.getId() === predicateID && edge.getTerminal(false).getId() === object) {
                // return;
                throw new Error('Trying to add same property twice');
            }
        }

        this.addEdge(predicateID, predicateLabel, v1, v2);
    }

    // public insertSubclassRelation(
    //     subclass: string,
    //     superclass: string,
    // ) {
    //     const v1 = this.model.getCell(subclass);
    //     const v2 = this.model.getCell(superclass);

    //     if (!v1 || !v2) throw new Error('Classes do not exist');

    //     // Check if property is already existing
    //     const count = v1.getEdgeCount();
    //     for (let i = 0; i < count; i++) {
    //         const edge = v1.getEdgeAt(i);
    //         if (edge.getValue().uri === 'http://www.w3.org/2000/01/rdf-schema#subClassOf' && edge.getTerminal(false).getId() === superclass)
    //             return edge;
    //     }

    //     // insert in the codec:
    //     this.codec.addRDFSSubclassOf(subclass, superclass);
    //     return this.graph.insertEdge(this.canvas, null, { uri: 'http://www.w3.org/2000/01/rdf-schema#subClassOf', label: 'rdfs:subClassOf' }, v1, v2);
    // }

    // /** Returns a turtle serialization of the current model */
    // async serializeModel() {
    //     const model = await this.codec.serialize();
    //     console.log('GraphSerialization:', model);
    //     return model;
    // }

    zoomToFit() {
        this.graph.fit();
    }

    destroy() {
        this.graph.destroy();
        this.tb.destroy();
        this.wnd.destroy()
    }

    /** Highlight cell in graph by its ID */
    public selectClass(id: string) {
        this.selectCells([this.model.getCell(id)]);
    }

    /** Select an array of mxcells in the graph */
    selectCells(cells: m.mxCell[]) {
        this.graph.setSelectionCells(cells);
    }

    public currentSelection(): Observable<string> {
        return this.selection$;
    }

    public currentEdgeSelection(): Observable<{ domainClazzID: string; edgeID: string }> {
        return this.edgeSelection$;
    }

    public deleteRequestObservable(): Observable<any> {
        return this.deletePress;
    }

    // This has been rewritten with observables above.
    // /** Call the given function with data of selected mxCell */
    // public addSelectionListener(funct: (x: string) => void) {
    //     // http://forum.jgraph.com/questions/252/add-listener-when-clicking-on-a-vertex/253
    //     this.graph.getSelectionModel().addListener(MxgraphService.mx.mxEvent.CHANGE, (selectionModel: m.mxGraphSelectionModel, evt: m.mxEventObject) => {
    //         const values = selectionModel.cells
    //             .filter((cell) => cell.vertex)
    //             .map((cell) => cell.getId());

    //         if (values.length === 1) {
    //             funct(values[0]);
    //         } else if (values.length === 0) {
    //             funct(null);
    //         } else {
    //             throw new Error('Multiple items selected. Should not be possible');
    //         }
    //     });
    // }

    /** Call the given function with data of selected mxCell */
    public addDragListener(funct: (ids: string[], dx: number, dy: number) => void) {
        // http://forum.jgraph.com/questions/252/add-listener-when-clicking-on-a-vertex/253
        this.graph.addListener(MxgraphService.mx.mxEvent.CELLS_MOVED, (sender, evt: m.mxEventObject) => {
            const cells: m.mxCell[] = evt.getProperty('cells');
            const ids: string[] = cells.map((cell) => cell.getId());
            const dx: number = evt.getProperty('dx');
            const dy: number = evt.getProperty('dy');

            funct(ids, dx, dy);
        });
    }

    private initializeToolBar() {

        var content = document.createElement('div');
        content.style.padding = '4px';

        this.tb = new MxgraphService.mx.mxToolbar(content);

        this.tb.addItem('Zoom In', '/assets/images/zoom_in32.png', (evt) => {
            this.graph.zoomIn();
        });

        this.tb.addItem('Zoom Out', '/assets/images/zoom_out32.png', (evt) => {
            this.graph.zoomOut();
        });

        this.tb.addItem('Actual Size', '/assets/images/view_1_132.png', (evt) => {
            this.graph.zoomActual();
        });

        this.tb.addItem('Print', '/assets/images/print32.png', (evt) => {
            var preview = new MxgraphService.mx.mxPrintPreview(this.graph, 1);
            preview.open();
        });

        this.tb.addItem('Poster Print', '/assets/images/press32.png', (evt) => {
            var pageCount = MxgraphService.mx.mxUtils.prompt('Enter maximum page count', '1');

            if (pageCount != null) {
                var scale = MxgraphService.mx.mxUtils.getScaleForPageCount(pageCount, this.graph);
                var preview = new MxgraphService.mx.mxPrintPreview(this.graph, scale);
                preview.open();
            }
        });

        this.wnd = new MxgraphService.mx.mxWindow('Tools', content, 400, 0, 200, 66, false);
        this.wnd.setMaximizable(false);
        this.wnd.setScrollable(false);
        this.wnd.setResizable(false);
        this.wnd.setVisible(true);
        this.wnd.addListener(MxgraphService.mx.mxEvent.MOVE, (e) => {
            this.wnd.setLocation(Math.max(0, this.wnd.getX()), Math.max(0, this.wnd.getY()));
        });
    }
}
