
(function(){

    Graph.plugin.Linker = Graph.extend({

        props: {
            vector: null,
            enabled: false,
            suspended: true,
            rendered: false
        },

        components: {
            block: null,
            pointer: null,
            path: null
        },

        linking: {
            treshold: 10,
            enabled: false,
            moveHandler: null,
            stopHandler: null,

            // linkable vectors
            source: null,
            target: null,

            // coords
            start: null,
            end: null
        },

        constructor: function(vector) {
            var me = this, vendor;

            if ( ! vector.isPaper()) {
                throw Graph.error('Linker plugin is only available for paper !');
            }

            vendor = vector.interactable().vendor();
            vendor.on('down', _.bind(me.onPointerDown, me, _, vector));

            vector.on('keynav', function(e){
                if (e.keyCode === Graph.event.ESC) {
                    me.invalidate();
                    vector.tool().activate('panzoom');
                }
            });

            me.props.vector = vector.guid();
            me.initComponent(vector);
        },

        vector: function() {
            return Graph.manager.vector.get(this.props.vector);
        },

        initComponent: function(paper) {
            var me = this, comp = me.components;

            comp.block = (new Graph.svg.Group())
                .addClass('graph-linker-path')
                .removeClass(Graph.string.CLS_VECTOR_GROUP)
                .selectable(false);

            comp.pointer = (new Graph.svg.Circle())
                .addClass('graph-linker-pointer')
                .removeClass(Graph.string.CLS_VECTOR_CIRCLE)
                .selectable(false)
                .render(comp.block);

            comp.path = (new Graph.svg.Path())
                .addClass('graph-linker-path')
                .removeClass(Graph.string.CLS_VECTOR_PATH)
                .selectable(false)
                .render(comp.block)
                .attr('marker-end', 'url(#marker-arrow)');
        },

        render: function() {
            var paper;

            if (this.props.rendered) {
                return;
            }

            paper = this.vector();
            this.components.block.render(paper);
            this.props.rendered = true;
        },

        invalidate: function() {
            var vector, vendor;

            if (this.linking.enabled) {
                vector = this.vector();
                vector.removeClass('linking');

                if (this.linking.moveHandler) {
                    vendor = vector.interactable().vendor();
                    vendor.off('move', this.linking.moveHandler);
                }

                if (this.linking.source) {
                    this.linking.source.removeClass('disallowed');
                }

                if (this.linking.target) {
                    this.linking.target.removeClass('allowed');
                }

                _.assign(this.linking, {
                    enabled: false,
                    moveHandler: null,
                    stopHandler: null,
                    source: null,
                    target: null,
                    start: null,
                    end: null
                });
            }
        },

        enable: function() {
            this.props.enabled = true;
            this.vector().state('linking');
        },

        disable: function() {
            this.props.enabled = false;
            this.invalidate();
            this.suspend();
        },

        suspend: function() {
            this.props.suspended = true;
            this.components.block.elem.detach();
        },

        resume: function() {
            var paper;

            if ( ! this.props.suspended) {
                return;
            }

            paper = this.vector();
            this.props.suspended = false;
            
            if ( ! this.props.rendered) {
                this.render();
            } else {
                paper.viewport().elem.append(this.components.block.elem);
            }
        },

        cropping: function(start, end) {
            var source = this.linking.source,
                target = this.linking.target,
                sample = Graph.path([['M', start.x, start.y], ['L', end.x, end.y]]);

            var spath, scrop, tpath, tcrop;

            if (source) {
                spath = source.pathinfo().transform(source.matrix());
                scrop = spath.intersection(sample, true);
            }

            if (target) {
                tpath = target.pathinfo().transform(target.matrix());
                tcrop = tpath.intersection(sample, true);
            }

            sample = null;

            return {
                start: scrop ? scrop[0] : null,
                end:   tcrop ? tcrop[0] : null
            };
        },

        build: function() {
            var tail = this.components.path.tail(),
                head = this.components.path.head();

            if (tail && head) {
                var paper = this.vector();
                paper.connect(this.linking.source, this.linking.target, tail, head);
            }

            this.invalidate();
            this.suspend();
        },

        onPointerDown: function(e, paper) {
            var vector = Graph.manager.vector.get(e.target), 
                vendor = paper.interactable().vendor(),
                tool  = paper.tool().current();

            if (tool != 'linker') {
                return;
            }

            if (this.linking.enabled) {
                if (this.linking.target) {
                    this.build();
                }
            } else {
                if (vector.isLinkable()) {
                    var source = this.linking.source;
                    var start;

                    if ( ! source) {
                        source = this.linking.source = vector;
                        start = this.linking.start = source.bbox().center(true);

                        this.components.path
                            .moveTo(start.x, start.y)
                            .lineTo(start.x, start.y, false);

                        source.addClass('disallowed');
                    }

                    if (this.props.suspended) {
                        this.resume();    
                    }

                    // install handler
                    this.linking.moveHandler = _.bind(this.onPointerMove, this, _, source, paper);
                    this.linking.stopHandler = _.bind(this.onPointerStop, this, _, paper);

                    this.linking.enabled = true;
                    this.linking.offset = paper.node().getBoundingClientRect();
                        
                    paper.addClass('linking');

                    vendor = paper.interactable().vendor();
                    vendor.on('move', this.linking.moveHandler);
                    vendor.on('up', this.linking.stopHandler);
                }
            }
        },

        onPointerMove: function(e, source, paper) {
            var viewport = paper.viewport(),
                offset = this.linking.offset,
                start = this.linking.start,
                delta = this.linking.treshold,
                position = Graph.event.relativePosition(e, viewport),
                scale = viewport.matrix().scale();

            var x = position.x - (offset.left / scale.x),
                y = position.y - (offset.top / scale.y);

            // add threshold
            var rad = Graph.math.rad(Graph.math.theta(start.x, start.y, x, y)),
                sin = Math.sin(rad),
                cos = Math.cos(rad),
                tdx = delta * -cos,
                tdy = delta * sin;

            x += tdx;
            y += tdy;

            var current = Graph.manager.vector.get(e.target);
            var target, crop, end;

            if (current && current.isLinkable() && current !== source) {
                if (current !== this.linking.target) {
                    
                    if (this.linking.target) {
                        this.linking.target.removeClass('allowed');    
                    }

                    target = current;
                    target.addClass('allowed');

                    end = target.bbox().center(true);

                    this.linking.target = target;
                    this.linking.end = end;

                    crop = this.cropping(start, end);

                    if (crop.start) {
                        this.components.path.moveTo(crop.start.x, crop.start.y);
                    }

                    if (crop.end) {
                        this.components.path.lineTo(crop.end.x, crop.end.y, false);
                    } else {
                        this.components.path.lineTo(x, y, false);
                    }
                }
            } else {
                this.linking.target = null;
                this.linking.end = null;

                crop = this.cropping(start, {x: x, y: y});

                if (crop.start) {
                    this.components.path.moveTo(crop.start.x, crop.start.y);
                }

                if (crop.end) {
                    this.components.path.lineTo(crop.end.x, crop.end.y, false);
                } else {
                    this.components.path.lineTo(x, y, false);
                }
            }

        },

        onPointerStop: function(e, paper) {
            
        }

    });

    ///////// HELPER /////////
    


}());