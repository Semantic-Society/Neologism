import { Injectable } from '@angular/core';
import mxgraphFactory, { mxgraph as mx } from 'mxgraph';

// @Injectable()
export class MxgraphService {
    private static mx = mxgraphFactory({
        mxImageBasePath: 'mxgraph/images',
        mxBasePath: 'mxgraph',
    });

    /*
    // Client
    private static mxClient = MxgraphService.mx.mxClient;

    // Model
    private static mxCell = MxgraphService.mx.mxCell;
    private static mxCellPath = MxgraphService.mx.mxCellPath;
    private static mxGeometry = MxgraphService.mx.mxGeometry;
    private static mxGraphModel = MxgraphService.mx.mxGraphModel;

    // View
    private static mxCellEditor = MxgraphService.mx.mxCellEditor;
    private static mxCellOverlay = MxgraphService.mx.mxCellOverlay;
    private static mxCellRenderer = MxgraphService.mx.mxCellRenderer;
    private static mxCellState = MxgraphService.mx.mxCellState;
    private static mxCellStatePreview = MxgraphService.mx.mxCellStatePreview;
    private static mxConnectionConstraint = MxgraphService.mx.mxConnectionConstraint;
    private static mxEdgeStyle = MxgraphService.mx.mxEdgeStyle;
    private static mxGraph = MxgraphService.mx.mxGraph;
    private static mxGraphSelectionModel = MxgraphService.mx.mxGraphSelectionModel;
    private static mxGraphView = MxgraphService.mx.mxGraphView;
    private static mxLayoutManager = MxgraphService.mx.mxLayoutManager;
    private static mxMultiplicity = MxgraphService.mx.mxMultiplicity;
    private static mxOutline = MxgraphService.mx.mxOutline;
    private static mxPerimeter = MxgraphService.mx.mxPerimeter;
    private static mxPrintPreview = MxgraphService.mx.mxPrintPreview;
    private static mxStyleRegistry = MxgraphService.mx.mxStyleRegistry;
    private static mxStylesheet = MxgraphService.mx.mxStylesheet;
    private static mxSwimlaneManager = MxgraphService.mx.mxSwimlaneManager;
    private static mxTemporaryCellStates = MxgraphService.mx.mxTemporaryCellStates;

    // Editor
    private static mxDefaultKeyHandler = MxgraphService.mx.mxDefaultKeyHandler;
    private static mxDefaultPopupMenu = MxgraphService.mx.mxDefaultPopupMenu;
    private static mxDefaultToolbar = MxgraphService.mx.mxDefaultToolbar;
    private static mxEditor = MxgraphService.mx.mxEditor;

    // Shape
    private static mxActor = MxgraphService.mx.mxActor;
    private static mxArrow = MxgraphService.mx.mxArrow;
    private static mxArrowConnector = MxgraphService.mx.mxArrowConnector;
    private static mxCloud = MxgraphService.mx.mxCloud;
    private static mxConnector = MxgraphService.mx.mxConnector;
    private static mxCylinder = MxgraphService.mx.mxCylinder;
    private static mxDoubleEllipse = MxgraphService.mx.mxDoubleEllipse;
    private static mxEllipse = MxgraphService.mx.mxEllipse;
    private static mxHexagon = MxgraphService.mx.mxHexagon;
    private static mxImageShape = MxgraphService.mx.mxImageShape;
    private static mxLabel = MxgraphService.mx.mxLabel;
    private static mxLine = MxgraphService.mx.mxLine;
    private static mxMarker = MxgraphService.mx.mxMarker;
    private static mxPolyline = MxgraphService.mx.mxPolyline;
    private static mxRectangleShape = MxgraphService.mx.mxRectangleShape;
    private static mxRhombus = MxgraphService.mx.mxRhombus;
    private static mxShape = MxgraphService.mx.mxShape;
    private static mxStencil = MxgraphService.mx.mxStencil;
    private static mxStencilRegistry = MxgraphService.mx.mxStencilRegistry;
    private static mxSwimlane = MxgraphService.mx.mxSwimlane;
    private static mxText = MxgraphService.mx.mxText;
    private static mxTriangle = MxgraphService.mx.mxTriangle;

    // IO
    // private static mxCellCodec = MxgraphService.mx.mxCellCodec;
    // private static mxChildChangeCodec = MxgraphService.mx.mxChildChangeCodec;
    private static mxCodec = MxgraphService.mx.mxCodec;
    private static mxCodecRegistry = MxgraphService.mx.mxCodecRegistry;
    // private static mxDefaultKeyHandlerCodec = MxgraphService.mx.mxDefaultKeyHandlerCodec;
    // private static mxDefaultPopupMenuCodec = MxgraphService.mx.mxDefaultPopupMenuCodec;
    // private static mxDefaultToolbarCodec = MxgraphService.mx.mxDefaultToolbarCodec;
    // private static mxEditorCodec = MxgraphService.mx.mxEditorCodec;
    // private static mxGenericChangeCodec = MxgraphService.mx.mxGenericChangeCodec;
    // private static mxGraphCodec = MxgraphService.mx.mxGraphCodec;
    // private static mxGraphViewCodec = MxgraphService.mx.mxGraphViewCodec;
    // private static mxModelCodec = MxgraphService.mx.mxModelCodec;
    // private static mxObjectCodec = MxgraphService.mx.mxObjectCodec;
    // private static mxRootChangeCodec = MxgraphService.mx.mxRootChangeCodec;
    // private static mxStylesheetCodec = MxgraphService.mx.mxStylesheetCodec;
    // private static mxTerminalChangeCodec = MxgraphService.mx.mxTerminalChangeCodec;

    // Layout
    private static mxCircleLayout = MxgraphService.mx.mxCircleLayout;
    private static mxCompactTreeLayout = MxgraphService.mx.mxCompactTreeLayout;
    private static mxCompositeLayout = MxgraphService.mx.mxCompositeLayout;
    private static mxEdgeLabelLayout = MxgraphService.mx.mxEdgeLabelLayout;
    private static mxFastOrganicLayout = MxgraphService.mx.mxFastOrganicLayout;
    private static mxGraphLayout = MxgraphService.mx.mxGraphLayout;
    private static mxParallelEdgeLayout = MxgraphService.mx.mxParallelEdgeLayout;
    private static mxPartitionLayout = MxgraphService.mx.mxPartitionLayout;
    private static mxRadialTreeLayout = MxgraphService.mx.mxRadialTreeLayout;
    private static mxStackLayout = MxgraphService.mx.mxStackLayout;
    // -> Hierarchical
    private static mxHierarchicalLayout = MxgraphService.mx.mxHierarchicalLayout;
    private static mxSwimlaneLayout = MxgraphService.mx.mxSwimlaneLayout;
    // -> -> Model
    private static mxGraphAbstractHierarchyCell = MxgraphService.mx.mxGraphAbstractHierarchyCell;
    private static mxGraphHierarchyEdge = MxgraphService.mx.mxGraphHierarchyEdge;
    private static mxGraphHierarchyModel = MxgraphService.mx.mxGraphHierarchyModel;
    private static mxGraphHierarchyNode = MxgraphService.mx.mxGraphHierarchyNode;
    private static mxSwimlaneModel = MxgraphService.mx.mxSwimlaneModel;
    // -> -> Stage
    private static mxCoordinateAssignment = MxgraphService.mx.mxCoordinateAssignment;
    private static mxHierarchicalLayoutStage = MxgraphService.mx.mxHierarchicalLayoutStage;
    private static mxMedianHybridCrossingReduction = MxgraphService.mx.mxMedianHybridCrossingReduction;
    private static mxMinimumCycleRemover = MxgraphService.mx.mxMinimumCycleRemover;
    private static mxSwimlaneOrdering = MxgraphService.mx.mxSwimlaneOrdering;

    // Util
    // private static mxAbstractCanvas2D = MxgraphService.mx.mxAbstractCanvas2D;
    // private static mxAnimation = MxgraphService.mx.mxAnimation;
    // private static mxAutoSaveManager = MxgraphService.mx.mxAutoSaveManager;
    // private static mxClipboard = MxgraphService.mx.mxClipboard;
    // private static mxConstants = MxgraphService.mx.mxConstants;
    // private static mxDictionary = MxgraphService.mx.mxDictionary;
    // private static mxDivResizer = MxgraphService.mx.mxDivResizer;
    // private static mxDragSource = MxgraphService.mx.mxDragSource;
    // private static mxEffects = MxgraphService.mx.mxEffects;
    // private static mxEvent = MxgraphService.mx.mxEvent;
    // private static mxEventObject = MxgraphService.mx.mxEventObject;
    // private static mxEventSource = MxgraphService.mx.mxEventSource;
    // private static mxForm = MxgraphService.mx.mxForm;
    // private static mxGuide = MxgraphService.mx.mxGuide;
    // private static mxImage = MxgraphService.mx.mxImage;
    // private static mxImageBundle = MxgraphService.mx.mxImageBundle;
    // private static mxImageExport = MxgraphService.mx.mxImageExport;
    // private static mxLog = MxgraphService.mx.mxLog;
    // private static mxMorphing = MxgraphService.mx.mxMorphing;
    // private static mxMouseEvent = MxgraphService.mx.mxMouseEvent;
    // private static mxObjectIdentity = MxgraphService.mx.mxObjectIdentity;
    // private static mxPanningManager = MxgraphService.mx.mxPanningManager;
    // private static mxPoint = MxgraphService.mx.mxPoint;
    // private static mxPopupMenu = MxgraphService.mx.mxPopupMenu;
    // private static mxRectangle = MxgraphService.mx.mxRectangle;
    // private static mxResources = MxgraphService.mx.mxResources;
    // private static mxSvgCanvas2D = MxgraphService.mx.mxSvgCanvas2D;
    // private static mxToolbar = MxgraphService.mx.mxToolbar;
    // private static mxUndoableEdit = MxgraphService.mx.mxUndoableEdit;
    // private static mxUndoManager = MxgraphService.mx.mxUndoManager;
    // private static mxUrlConverter = MxgraphService.mx.mxUrlConverter;
    private static mxUtils = MxgraphService.mx.mxUtils;
    // private static mxVmlCanvas2D = MxgraphService.mx.mxVmlCanvas2D;
    // private static mxWindow = MxgraphService.mx.mxWindow;
    // private static mxXmlCanvas2D = MxgraphService.mx.mxXmlCanvas2D;
    // private static mxXmlRequest = MxgraphService.mx.mxXmlRequest;

    // Handler
    // private static mxCellHighlight = MxgraphService.mx.mxCellHighlight;
    // private static mxCellMarker = MxgraphService.mx.mxCellMarker;
    // private static mxCellTracker = MxgraphService.mx.mxCellTracker;
    // private static mxConnectionHandler = MxgraphService.mx.mxConnectionHandler;
    // private static mxConstraintHandler = MxgraphService.mx.mxConstraintHandler;
    // private static mxEdgeHandler = MxgraphService.mx.mxEdgeHandler;
    // private static mxEdgeSegmentHandler = MxgraphService.mx.mxEdgeSegmentHandler;.js
    // private static mxElbowEdgeHandler = MxgraphService.mx.mxElbowEdgeHandler;
    // private static mxGraphHandler = MxgraphService.mx.mxGraphHandler;
    // private static mxHandle = MxgraphService.mx.mxHandle;
    // private static mxKeyHandler = MxgraphService.mx.mxKeyHandler;
    // private static mxPanningHandler = MxgraphService.mx.mxPanningHandler;
    // private static mxPopupMenuHandler = MxgraphService.mx.mxPopupMenuHandler;
    private static mxRubberband = MxgraphService.mx.mxRubberband;
    // private static mxSelectionCellsHandler = MxgraphService.mx.mxSelectionCellsHandler;
    // private static mxTooltipHandler = MxgraphService.mx.mxTooltipHandler;
    // private static mxVertexHandler = MxgraphService.mx.mxVertexHandler;
    */

    container: HTMLDivElement;
    graph: mx.mxGraph;
    canvas: mx.mxCell;

    cellById: Map<string, mx.mxCell>;

    constructor(container: HTMLDivElement) {
        // Checks if the browser is supported
        if (!MxgraphService.mx.mxClient.isBrowserSupported()) {
            MxgraphService.mx.mxUtils.error('Browser is not supported!', 200, false);
        }

        this.container = container;

        // Creates the graph inside the given container
        this.graph = new MxgraphService.mx.mxGraph(this.container);

        // Enables rubberband selection - Weird constructor side effect stuff
        const rubberband = new MxgraphService.mx.mxRubberband(this.graph);

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        this.canvas = this.graph.getDefaultParent();

        this.cellById = new Map([['', this.canvas]]);
    }

    private addVertex(
        id: string,
        x: number = Math.random() * this.container.clientWidth,
        y: number = Math.random() * this.container.clientHeight,
        w: number = 80,
        h: number = 30,
    ) {
        let v = this.cellById.get(id);
        if (!v) {
            v = this.graph.insertVertex(this.canvas, id, {}, x, y, w, h);
            this.cellById.set(id, v);
        }
        return v;
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
            const v2 = this.addVertex(object);
            return this.addEdge(predicate, v1, v2);
        }
        return null;
    }


    destroy() {
        this.graph.destroy();
    }

}
