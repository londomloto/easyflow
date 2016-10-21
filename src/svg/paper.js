
(function(){

    /**
     * Paper - root viewport
     */

    var Paper = Graph.svg.Paper = Graph.extend(Graph.svg.Vector, {

        attrs: {
            'class': Graph.string.CLS_VECTOR_SVG
        },

        props: {
            id: null,
            guid: null,
            type: 'paper',
            text: null,
            rotate: 0,

            traversable: false,
            selectable: false,
            selected: false,
            focusable: false,

            rendered: false,
            showAxis: true,
            zoomable: true
        },

        components: {
            viewport: null
        },

        constructor: function(width, height, options) {
            var me = this;

            me.superclass.prototype.constructor.call(me, 'svg', {
                'xmlns': Graph.config.xmlns.svg,
                'xmlns:link': Graph.config.xmlns.xlink,
                'version': Graph.config.svg.version
                // 'width': _.defaultTo(width, 200),
                // 'height': _.defaultTo(height, 200)
            });

            _.assign(me.props, options || {});

            me.style({
                overflow: 'hidden',
                position: 'relative'
            });

            me.interactable();
            me.initLayout();

            me.plugins.collector = new Graph.plugin.Collector(me);
            me.plugins.toolmgr.register('collector', 'plugin');

            me.plugins.linker = new Graph.plugin.Linker(me);
            me.plugins.toolmgr.register('linker', 'plugin');

            me.plugins.pencil = new Graph.plugin.Pencil(me);
            me.plugins.definer = new Graph.plugin.Definer(me);

            me.utils.spotlight = new Graph.util.Spotlight(me);
            me.utils.hinter = null; // new Graph.util.Hinter(me);
            me.utils.toolpad = new Graph.util.Toolpad(me);
            
            me.on('pointerdown', _.bind(me.onPointerDown, me));
            me.on('keynav', _.bind(me.onNavigation, me));

            // subscribe topics
            Graph.topic.subscribe('link/update', _.bind(me.listenLinkUpdate, me));
            Graph.topic.subscribe('shape/draw',  _.bind(me.listenShapeDraw, me));
        },

        initLayout: function() {
            // create viewport
            var viewport = (new Graph.svg.Group())
                .addClass(Graph.string.CLS_VECTOR_VIEWPORT)
                .selectable(false);

            viewport.props.viewport = true;
            this.components.viewport = viewport.guid();

            if (this.props.showAxis) {
                // add axis sign
                var gs, ys, as, ts;
                
                gs = Graph.$('<g>').appendTo(viewport.elem);
                ys = Graph.$('<rect>').appendTo(gs);
                as = Graph.$('<rect>').appendTo(gs);
                ts = Graph.$('<text>').appendTo(gs).text('(0, 0)');

                gs.attr({'class': 'graph-axis'});
                as.attr({'class': 'x', rx: 1, ry: 1, x: -16, y:  -2, height:  2, width: 30});
                ys.attr({'class': 'y', rx: 1, ry: 1, x:  -2, y: -16, height: 30, width: 2});
                ts.attr({'class': 't', x: -40, y: -10});

                gs = as = ys = ts = null;
            }

            // render viewport
            viewport.tree.paper = viewport.tree.parent = this.guid();
            viewport.translate(0.5, 0.5).commit();

            this.elem.append(viewport.elem);
            this.children().push(viewport);

            viewport.on('render', function(){
                viewport.cascade(function(c){
                    if (c !== viewport && ! c.props.rendered) {
                        c.props.rendered = true;
                        c.tree.paper = viewport.tree.paper;
                        c.fire('render');
                    }
                });
            });

            this.layout('default');
        },

        layout: function(options) {
            var viewport = this.viewport();

            if (options === undefined) {
                return viewport.graph.layout;
            }1
            
            viewport.layout(options);
            return this;
        },

        shape: function(names, options) {
            var shape = Graph.shape(names, options);
            shape.render(this);
            
            return shape;
        },

        draw: function(shape, options) {
            var shape = this.plugins.pencil.draw(shape, options);
            return shape;
        },

        render: function(container) {
            var me = this, 
                vp = me.viewport(),
                id = me.guid();

            if (me.props.rendered) {
                return;
            }

            container = Graph.$(container);
            container.append(me.elem);

            me.tree.container = container;
            
            me.elem.css({
                width: '100%',
                height: '100%'
            });
            
            me.props.rendered = true;
            me.fire('render');

            vp.props.rendered = true;
            vp.fire('render');

            if (me.props.zoomable) {
                me.zoomable();
                
                var debounce = _.debounce(function(){
                    debounce.flush();
                    debounce = null;
                    
                    me.tool().activate('panzoom');
                }, 1000);
                
                debounce();
            }

            return me;
        },

        container: function() {
            return this.tree.container;
        },

        viewport: function() {
            return Graph.registry.vector.get(this.components.viewport);
        },

        // @Override
        scale: function(sx, sy, cx, cy) {
            if (sx === undefined) {
                return this.viewport().matrix().scale();
            }
            return this.plugins.transformer.scale(sx, sy, cx, cy);
        },

        connect: function(source, target, start, end, options) {
            var layout, router, link;

            if (start) {
                if ( ! Graph.isPoint(start)) {
                    options = start;
                    start = null;
                    end = null;    
                }
            }

            source = Graph.isShape(source) ? source.hub() : source;
            target = Graph.isShape(target) ? target.hub() : target;
            layout = this.layout();
            router = layout.createRouter(source, target, options);
            
            link = layout.createLink(router);
            
            link.connect(start, end);
            link.render(this);

            return link;
        },

        parse: function(json) {
            var paper  = this;
            var shapes = {};

            _.forEach(json.shapes, function(o){
                (function(o){
                    var s = Graph.shape(o.type, o.data);
                    s.render(paper);
                    shapes[o.data.id] = s;    
                }(o));
            });

            _.forEach(json.links, function(o){
                (function(o){
                    paper.connect(shapes[o.source], shapes[o.target]);
                }(o))
            });

        },

        save: function() {
            alert('save');
        },

        toString: function() {
            return 'Graph.svg.Paper';
        },

        ///////// OBSERVERS /////////
        
        onPointerDown: function(e) {
            if (e.target === this.node()) {
                var tool = this.tool().current();
                if (tool != 'collector') {
                    this.tool().activate('panzoom');    
                }
            }
        },

        onNavigation: function(e) {
            var me = this;

            switch(e.keyCode) {
                case Graph.event.DELETE:

                    var selections = me.plugins.collector.collection;
                    
                    for (var v, i = selections.length - 1; i >= 0; i--) {
                        if ((v = selections[i])) {
                            v.remove();
                            selections.splice(i, 1);
                        }
                    }

                    break;
            }
        },

        ///////// TOPIC LISTENERS /////////
        
        listenLinkUpdate: _.debounce(function() {
            this.layout().arrangeLinks();
        }, 300),

        listenShapeDraw: _.debounce(function() {
            this.layout().arrangeShapes();
        }, 1)

    });

    ///////// STATICS /////////
    
    Paper.toString = function() {
        return 'function( width, height )';
    };

    ///////// EXTENSIONS /////////

    var vectors = {
        ellipse: 'Ellipse',
        circle: 'Circle',
        rect: 'Rect',
        path: 'Path',
        polyline: 'Polyline',
        polygon: 'Polygon',
        group: 'Group',
        text: 'Text',
        image: 'Image',
        line: 'Line',
        connector: 'Connector'
    };

    _.forOwn(vectors, function(name, method){
        (function(name, method){
            Paper.prototype[method] = function() {
                var arg = [name].concat(_.toArray(arguments)),
                    svg = Graph.svg.apply(null, arg);

                svg.tree.paper = this.guid();
                svg.render(this);

                arg = null;
                return svg;
            };
        }(name, method));
    });


}());