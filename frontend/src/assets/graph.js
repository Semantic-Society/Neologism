// Program starts here. Creates a sample graph in the
// DOM node with the specified ID. This function is invoked
// from the onLoad event handler of the document (see below).
var graph;

function main(container) {
  // Checks if the browser is supported
  if (!mxClient.isBrowserSupported()) {
    // Displays an error message if the browser is not supported.
    mxUtils.error('Browser is not supported!', 200, false);
  }
  else {

    // Disables the built-in context menu
    //mxEvent.disableContextMenu(container);

    //TODO: Look into clipboard.html, events.html, extendedcanvas.html, graphlayout.html, hovericons.html, layers.html, morph.html, secondlabel.html, stylesheets.html and touch.html

    //Defines an icon creating new connections
    //mxConnectionHandler.prototype.connectImage = new mxImage('external/mxgraph/images/point_new.gif', 16, 16);

    // Creates the graph inside the given container
    graph = new mxGraph(container);

    //add Node event listener for right toolbar
    graph.getSelectionModel().addListener(mxEvent.CHANGE, function (e) {
      var cell = graph.getSelectionCell();
      if (cell["vertex"] == true) {
        var cellLabel = cell["value"];
        $("#descriptionOfClass")[0].innerHTML = cellLabel;

      }


    });

    /*
        =======================================
                    GRAPH STYLES
        =======================================

     */

    var style = graph.stylesheet.getDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_STROKECOLOR] = '#c4a000';
    style[mxConstants.STYLE_STROKEWIDTH] = 2;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
    style[mxConstants.STYLE_FONTCOLOR] = 'black';
    style[mxConstants.STYLE_FILLCOLOR] = '#f3e57a';
    //Edge color #554600
    graph.getStylesheet().putCellStyle('image', style);


    /*
        =======================================
                    GENERAL SETTINGS
        =======================================

     */

    //Enables Guide (Highlighting)
    mxGraphHandler.prototype.highlightEnabled = true;

    //Disables resize of vertices
    graph.setCellsResizable(false);

    //Enables Auto resize of vertices
    //graph.setAutoSizeCells(true);

    //Disable edit function for graph in default mode
    graph.setEnabled(true);

    // Graph Style Settings
    graph.setConnectable(true);

    // Disables unconnected edges
    graph.setAllowDanglingEdges(false);

    // Enables rubberband selection
    new mxRubberband(graph);

    /*
       =======================================
                   TOLLBAR SETUP
       =======================================

    */

    // Creates toolbar inside the given container
    var tbContainer = document.getElementById('left-toolbar');
    var toolbar = new mxToolbar(tbContainer);
    toolbar.enabled = false;

    var addVertex = function (icon, w, h, style) {
      var vertex = new mxCell(null, new mxGeometry(0, 0, w, h), style);
      vertex.setVertex(true);

      var img = addToolbarItem(graph, toolbar, vertex, icon);
      img.enabled = true;

      /*graph.getSelectionModel().addListener(mxEvent.CHANGE, function()
      {
          var tmp = graph.isSelectionEmpty();
          mxUtils.setOpacity(img, (tmp) ? 100 : 20);
          img.enabled = tmp;
      });*/

    };

    //Adding mockup Node
    addVertex('external/mxgraph/images/class_mockup.gif', 80, 30, 'shape=rounded');


    /*
       =======================================
                   OTHER STUFF
       =======================================

    */

    // Scroll events should not start moving the vertex
    graph.cellRenderer.isLabelEvent = function (state, evt) {
      var source = mxEvent.getSource(evt);

      return state.text != null && source != state.text.node &&
        source != state.text.node.getElementsByTagName('div')[0];
    };


    /*
              =======================================
                         AUTO GRAPH LAYOUT
              =======================================
    */

    var parent = graph.getDefaultParent();

    var layout = new mxFastOrganicLayout(graph);
    // Moves stuff wider apart than usual
    layout.forceConstant = 80;
    $(".auto-layout-graph").bind("click", function () {
        graph.getModel().beginUpdate();
        try {
          // Creates a layout algorithm to be used
          // with the graph
          var circleLayout = new mxCircleLayout(graph);
          circleLayout.execute(parent);
        }
        catch (e) {
          throw e;
        }
        finally {
          if (true) {
            var morph = new mxMorphing(graph);
            morph.addListener(mxEvent.DONE, function () {
              graph.getModel().endUpdate();
            });

            morph.startAnimation();
          }
          else {
            graph.getModel().endUpdate();
          }
        }

      }
    );

    /*
              =======================================
                      UNDO/REDO FUNCTIONALITY
              =======================================
    */

// Undo/redo
    var undoManager = new mxUndoManager();
    var listener = function (sender, evt) {
      undoManager.undoableEditHappened(evt.getProperty('edit'));
    };
    graph.getModel().addListener(mxEvent.UNDO, listener);
    graph.getView().addListener(mxEvent.UNDO, listener);

    /*document.body.appendChild(mxUtils.button('Undo', function () {
        undoManager.undo();
    }));

    document.body.appendChild(mxUtils.button('Redo', function () {
        undoManager.redo();
    }));*/
    $(".undo-graph").bind("click", function () {
      undoManager.undo();
    });

    /*
         =======================================
             MOCKUP NODES AND UPDATE ROUTINE
         =======================================

    */

// Gets the default parent for inserting new cells. This
// is normally the first child of the root (ie. layer 0).
    var parent = graph.getDefaultParent();

// Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try {
      var v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
      var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
      var e1 = graph.insertEdge(parent, null, '', v1, v2);
    }
    finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
  }
  undoManager.clear(); // Removes the mockup nodes from the undo History.
}
;

function addToolbarItem(graph, toolbar, prototype, image) {
  // Function that is executed when the image is dropped on
  // the graph. The cell argument points to the cell under
  // the mousepointer if there is one.
  var funct = function (graph, evt, cell, x, y) {
    graph.stopEditing(false);

    var vertex = graph.getModel().cloneCell(prototype);
    vertex.geometry.x = x;
    vertex.geometry.y = y;

    graph.addCell(vertex);
    graph.setSelectionCell(vertex);
  }

  // Creates the image which is used as the drag icon (preview)
  var img = toolbar.addMode(null, image, function (evt, cell) {
    var pt = this.graph.getPointForEvent(evt);
    funct(graph, evt, cell, pt.x, pt.y);
  });

  // Disables dragging if element is disabled. This is a workaround
  // for wrong event order in IE. Following is a dummy listener that
  // is invoked as the last listener in IE.
  mxEvent.addListener(img, 'mousedown', function (evt) {
    // do nothing
  });

  // This listener is always called first before any other listener
  // in all browsers.
  mxEvent.addListener(img, 'mousedown', function (evt) {
    if (img.enabled == false) {
      mxEvent.consume(evt);
    }
  });

  mxUtils.makeDraggable(img, graph, funct);

  return img;
}


/*
   =======================================
          BINDING EVENTS FOR BUTTONS
   =======================================

*/

