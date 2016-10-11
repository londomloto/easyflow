
(function(){

    Graph.plugin.Panzoom = Graph.extend({

        props: {
            panEnabled: false,
            zoomEnabled: true,
            vector: null
        },

        caching: {
            offset: {x: 0, y: 0}
        },

        scrolling: {
            steps: 10
        },

        zooming: {
            scale: 1,
            zoom: 1,
            origin: null,
            range: {min: 0.2, max: 4}
        },

        panning: {
            start: {x: 0, y: 0},
            moveHandler: null,
            stopHandler: null
        },

        constructor: function(vector) {
            var me = this, vendor, viewport, scale, bound;

            // validate vector
            if ( ! vector.isPaper()) {
                throw Graph.error('Panzoom only available for paper !');
            }

            viewport = vector.viewport();
            scale    = Math.round(viewport.matrix().scale().x, 1000);
            vendor   = vector.interactable().vendor();

            _.assign(me.props, {
                vector: vector.guid()
            });

            _.assign(me.zooming, {
                scale: scale,
                zoom: scale
            });

            // use native engine
            vendor.on('wheel', _.bind(me.onMouseWheel, me, _, vector, viewport));
            vendor.on('down', _.bind(me.onPointerDown, me, _, vector, viewport));

            if (vector.props.rendered) {
                me.revalidate(vector);
            } else {
                vector.on('render', function(){
                    me.revalidate(vector);
                });
            }

            vendor = null;
            vector = null;
        },

        revalidate: function(vector) {
            var bound = vector.node().getBoundingClientRect();

            this.caching.offset = {
                x: bound.left,
                y: bound.top
            };
        },

        vector: function() {
            return Graph.manager.vector.get(this.props.vector);
        },

        enable: function() {
            var vector = this.vector();

            this.props.panEnabled = true;
            this.props.zoomEnabled = true;

            vector.cursor('default');
            vector.state('panning');
        },

        disable: function() {
            this.props.panEnabled = false;
        },

        zoom: function(paper, viewport, direction, origin) {

            var range = this.zooming.range,
                currentZoom = this.zooming.zoom,
                zoomType = direction > 0 ? 'in' : 'out',
                factor = Math.pow(1 + Math.abs(direction), zoomType == 'in' ? 1 : -1),
                zoom = (zoomRange(range, currentZoom * factor)),
                matrix = viewport.matrix(),
                currentScale = matrix.props.a,
                scale = 1 / currentScale * zoom,
                matrixScale = matrix.clone();

            matrixScale.scale(scale, scale, origin.x, origin.y);

            viewport.attr('transform', matrixScale.toString());
            viewport.graph.matrix = matrixScale;

            this.zooming.zoom  = zoom;
            this.zooming.scale = matrixScale.props.a;
            
            if (paper.state() == 'panning') {
                paper.cursor(zoomType == 'in' ? 'zoom-in' : 'zoom-out');    
            }

            this.onZoom(paper);
        },

        scroll: function(paper, viewport, dx, dy) {
            var matrix = viewport.matrix().clone();
                scale = this.zooming.scale;

            dx /= scale;
            dy /= scale;
            
            matrix.translate(dx, dy);

            viewport.attr('transform', matrix.toString());
            viewport.graph.matrix = matrix;

            if (this.zooming.origin) {
                this.zooming.origin.x += dx;
                this.zooming.origin.y += dy;
            }
        },

        onMouseWheel: function(e, paper, viewport) {

            e = Graph.event.fix(e);
            e.preventDefault();

            var vscroll = Graph.event.hasPrimaryModifier(e),
                hscroll = Graph.event.hasSecondaryModifier(e),
                event   = Graph.event.original(e);

            var factor, delta, origin, offset, box;

            if (vscroll || hscroll) {

                if (Graph.isMac()) {
                    factor = event.deltaMode === 0 ? 1.25 : 50;
                } else {
                    // factor = event.deltaMode === 0 ? 1/40 : 1/2;
                    factor = event.deltaMode === 0 ? 1 : 20;
                }

                delta = {};

                if (hscroll) {
                    delta.dx = (factor * (event.deltaX || event.deltaY));
                    delta.dy = 0;
                } else {
                    delta.dx = 0;
                    delta.dy = (factor * event.deltaY);
                }

                this.scroll(paper, viewport, delta.dx, delta.dy);

            } else {
                factor = (event.deltaMode === 0 ? 1/40 : 1/2);
                offset = this.caching.offset;

                origin = {
                    x: event.clientX - offset.x,
                    y: event.clientY - offset.y    
                };

                this.zooming.origin = origin;

                this.zoom(
                    paper,
                    viewport,
                    // event.deltaY * factor / (-5), 
                    event.deltaY * factor / (-8), 
                    origin
                );
            }
        }, 

        onPointerDown: function(e, paper, viewport, vendor) {
            var target = Graph.$(e.target),
                vector = Graph.manager.vector.get(target),
                vendor = paper.interactable().vendor(),
                tool   = paper.tool().current();

            var offset;

            if (tool == 'collector') {
                return;
            }

            if (vector) {
                // already has drag feature
                if (vector.isDraggable()) {
                    return;
                }

                // reject non primary button
                if (e.button || e.ctrlKey || e.shiftKey || e.altKey) {
                    return;
                }

                this.revalidate(paper);

                offset = this.caching.offset;

                this.panning.start = {
                    x: e.clientX - offset.x,
                    y: e.clientY - offset.y
                };

                // install temporary events handler
                this.panning.moveHandler = _.bind(this.onPointerMove, this, _, paper, viewport);
                this.panning.stopHandler = _.bind(this.onPointerStop, this, _, paper, viewport);

                vendor.on('move', this.panning.moveHandler);
                vendor.on('up', this.panning.stopHandler);
            }
        },

        onPointerMove: function(e, paper, viewport) {
            var offset = this.caching.offset,
                start = this.panning.start,
                current = { 
                    x: e.clientX - offset.x, 
                    y: e.clientY - offset.y
                },
                dx = current.x - start.x,
                dy = current.y - start.y,
                mg = Graph.math.hypo(dx, dy);

            paper.cursor('move');

            this.scroll(paper, viewport, dx, dy);

            this.panning.start = {
                x: e.clientX - offset.x,
                y: e.clientY - offset.y
            };

            // prevent select
            e.preventDefault();
        },

        onPointerStop: function(e, paper) {
            var me = this, vendor = paper.interactable().vendor();
            var delay, bounce;

            // wait interact to fire last posible event...
            delay = _.delay(function(){
                clearTimeout(delay);
                delay = null;

                vendor.off('move', me.panning.moveHandler);
                vendor.off('up', me.panning.stopHandler);

            }, 0);

            paper.cursor('default');
        },

        onZoom: _.debounce(function(paper) {
            var state = paper.state();

            if (state == 'panning') {
                paper.cursor('default');    
            }

        }, 300),

        onScroll: _.debounce(function() {

        }, 300)

    });

    ///////// HELPERS /////////
    
    function logarithm(num, base) {
        base = base || 10;
        return Math.log(num) / Math.log(base);
    }

    function stepRange(range, steps) {
        var min = logarithm(range.min),
            max = logarithm(range.max),
            abs = Math.abs(min) + Math.abs(max);

        return abs / steps;
    }

    function zoomRange(range, scale) {
        return Math.max(range.min, Math.min(range.max, scale));
    }

    function pointerLocation(event, paper) {
        var offset = paper.node().getBoundingClientRect(),
            x = event.clientX - offset.left,
            y = event.clientY - offset.top;

        return {
            x: x, 
            y: y
        };
    }

}());