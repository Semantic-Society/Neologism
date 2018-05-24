import { mxgraph as m } from 'mxgraph';

// Create grid dynamically (requires canvas)
// see https://github.com/jgraph/mxgraph/blob/master/javascript/examples/grid.html
export function enableDynamicGrid(graph: m.mxGraph, mx: typeof m) {
    try {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0px';
        canvas.style.left = '0px';
        canvas.style.zIndex = '-1';
        graph.container.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Modify event filtering to accept canvas as container
        const mxGraphViewIsContainerEvent = mx.mxGraphView.prototype.isContainerEvent;
        mx.mxGraphView.prototype.isContainerEvent = function (evt) {
            return mxGraphViewIsContainerEvent.apply(this, arguments) ||
                mx.mxEvent.getSource(evt) === canvas;
        };

        let s = 0;
        let gs = 0;
        let tr = new mx.mxPoint();
        let w = 0;
        let h = 0;
        const repaintGrid = () => {
            // TODO attach window resize listener
            if (ctx != null && !!graph.container) {
                const width = graph.container.clientWidth;
                const height = graph.container.clientHeight;
                const sizeChanged = width !== w || height !== h;

                if (graph.view.scale !== s || graph.view.translate.x !== tr.x || graph.view.translate.y !== tr.y ||
                    gs !== graph.gridSize || sizeChanged) {
                    tr = graph.view.translate.clone();
                    s = graph.view.scale;
                    gs = graph.gridSize;
                    w = width;
                    h = height;

                    // Clears the background if required
                    if (!sizeChanged) {
                        ctx.clearRect(0, 0, w, h);
                    } else {
                        canvas.setAttribute('width', w as any);
                        canvas.setAttribute('height', h as any);
                    }

                    const tx = tr.x * s;
                    const ty = tr.y * s;

                    // Sets the distance of the grid lines in pixels
                    const minStepping = graph.gridSize;
                    let stepping = minStepping * s;

                    if (stepping < minStepping) {
                        const count = Math.round(Math.ceil(minStepping / stepping) / 2) * 2;
                        stepping = count * stepping;
                    }

                    const xs = Math.floor((0 - tx) / stepping) * stepping + tx;
                    let xe = Math.ceil(w / stepping) * stepping;
                    const ys = Math.floor((0 - ty) / stepping) * stepping + ty;
                    let ye = Math.ceil(h / stepping) * stepping;

                    xe += Math.ceil(stepping);
                    ye += Math.ceil(stepping);

                    const ixs = Math.round(xs);
                    const ixe = Math.round(xe);
                    const iys = Math.round(ys);
                    const iye = Math.round(ye);

                    // Draws the actual grid
                    ctx.strokeStyle = '#e6e6e6';
                    ctx.beginPath();

                    for (let x = xs; x <= xe; x += stepping) {
                        x = Math.round((x - tx) / stepping) * stepping + tx;
                        const ix = Math.round(x);

                        ctx.moveTo(ix + 0.5, iys + 0.5);
                        ctx.lineTo(ix + 0.5, iye + 0.5);
                    }

                    for (let y = ys; y <= ye; y += stepping) {
                        y = Math.round((y - ty) / stepping) * stepping + ty;
                        const iy = Math.round(y);

                        ctx.moveTo(ixs + 0.5, iy + 0.5);
                        ctx.lineTo(ixe + 0.5, iy + 0.5);
                    }

                    ctx.closePath();
                    ctx.stroke();
                }
            }
        };

        const mxGraphViewValidateBackground = mx.mxGraphView.prototype.validateBackground;
        mx.mxGraphView.prototype.validateBackground = function () {
            mxGraphViewValidateBackground.apply(this, arguments);
            setTimeout(repaintGrid);
        };

        repaintGrid();
    } catch (e) {
        mx.mxLog.show();
        (mx.mxLog.debug as any)('Using background image');

        graph.container.style.backgroundImage = 'url(\'editors/images/grid.gif\')';
    }
}
