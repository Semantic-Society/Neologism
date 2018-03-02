import { Injectable } from '@angular/core';
import { mxgraph } from 'mxgraph';

// @Injectable()
export class MxgraphService {
  private static mx = require('mxgraph')({
    mxImageBasePath: 'mxgraph/images',
    mxBasePath: 'mxgraph',
  });

  container: HTMLDivElement;
  toolbarContainer: HTMLElement;
  graph: mxgraph.mxGraph;
  canvas: mxgraph.mxCell;
  toolbar: mxgraph.mxToolbar;

  cellById: Map<string, mxgraph.mxCell>;
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
    const cellLabelChanged = this.graph.cellLabelChanged;
    this.graph.cellLabelChanged = function (cell: mxgraph.mxCell, newValue: string, autoSize: boolean = true) {
      if (cell && typeof cell.value !== 'string') {
        // Clones the value for correct undo/redo
        newValue = { ...cell.value, label: newValue } as any;
        console.log(newValue);
      }
      cellLabelChanged.apply(this, arguments);
    };

    // Ensure any cell addition/deletion in the mxGraph UI is reflected in our private data structure
    this.graph.addListener(MxgraphService.mx.mxEvent.CELLS_ADDED, (sender: mxgraph.mxEventSource, evt: mxgraph.mxEventObject) => {
      const cells: mxgraph.mxCell[] = (evt.getProperties() || {})['cells'];
      if (Array.isArray(cells)) {
        cells.forEach((cell) => this.cellById.set(cell.getId(), cell));
      }
    });
    this.graph.addListener(MxgraphService.mx.mxEvent.CELLS_REMOVED, (sender: mxgraph.mxEventSource, evt: mxgraph.mxEventObject) => {
      const cells: mxgraph.mxCell[] = (evt.getProperties() || {})['cells'];
      if (Array.isArray(cells)) {
        cells.forEach((cell) => this.cellById.delete(cell.getId()));
      }
    });

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


    this.toolbar = new MxgraphService.mx.mxToolbar(this.toolbarContainer);
    console.log(toolbar);

    this.addToolbarVertex('assets/class_mockup.gif', 80, 30, 'shape=rounded');
  }

  private addToolbarItem(prototype: HTMLElement, image: String) {
    // Function that is executed when the image is dropped on
    // the graph. The cell argument points to the cell under
    // the mousepointer if there is one.
    var funct = function (graph, evt, cell, x, y) {
      graph.stopEditing(false);

      var vertex = graph.getModel().cloneCell(prototype);
      vertex.geometry.x = x;
      vertex.geometry.y = y;
      console.log(vertex.geometry.y);


      graph.addCell(vertex);
      graph.setSelectionCell(vertex);
    }

    // Creates the image which is used as the drag icon (preview)
    var img = this.toolbar.addMode(null, image, function (evt, cell) {
      var pt = this.graph.getPointForEvent(evt);
      funct(this.graph, evt, cell, pt.x, pt.y);
    });


   // This listener is always called first before any other listener
   // in all browsers.
    /*MxgraphService.mx.mxEvent.addListener(img, 'mousedown', function (evt) {

       MxgraphService.mx.mxEvent.consume(evt);

   });*/
    console.log(img);
    console.log(this.graph);
    MxgraphService.mx.mxUtils.makeDraggable(img, this.graph, funct);
    console.log(img);
    return img;
  }
  private addToolbarVertex(icon, w, h, style) {
    var vertex = new MxgraphService.mx.mxCell(null, new MxgraphService.mx.mxGeometry(0, 0, w, h), style);
    vertex.setVertex(true);
    var img = this.addToolbarItem(vertex, icon);
    //img.enabled = true;
  };

  private getOrAddVertex(
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
        v1.setValue(cur as any);                    // finally commit the update
        //console.log(cur);
      }
    }
    return null;
  }

  destroy() {
    this.graph.destroy();
  }
}
