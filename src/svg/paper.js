
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

            implicitRender: false,
            rendered: false,

            showAxis: true,
            zoomEnabled: true
        },

        components: {
            viewport: null
        },

        constructor: function(width, height, options) {
            var me = this;

            // me.$super('svg', {
            //     'xmlns': Graph.config.xmlns.svg,
            //     'xmlns:link': Graph.config.xmlns.xlink,
            //     'version': Graph.config.svg.version,
            //     'width': _.defaultTo(width, 200),
            //     'height': _.defaultTo(height, 200)
            // });

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

            me.utils.collector = new Graph.util.Collector(me);
            me.plugins.toolmgr.register('collector', 'util');

            me.plugins.linker = new Graph.plugin.Linker(me);
            me.plugins.toolmgr.register('linker', 'plugin');

            me.plugins.canvas = new Graph.plugin.Canvas(me);

            me.utils.definer = new Graph.util.Definer(me);
            me.utils.spotlight = new Graph.util.Spotlight(me);
            me.utils.hinter = null; // new Graph.util.Hinter(me);
            me.utils.toolpad = new Graph.util.Toolpad(me);

            
            me.on('pointerdown', _.bind(me.onPointerDown, me));
            me.on('keynav', _.bind(me.onNavigation, me));

            Graph.topic.subscribe('vector/dragend', _.bind(me.listenVectorDragend, me));
            Graph.topic.subscribe('vector/resize', _.bind(me.listenVectorResize, me));
        },

        initLayout: function() {
            // create viewport
            var viewport = this.components.viewport = (new Graph.svg.Group())
                .removeClass(Graph.string.CLS_VECTOR_GROUP)
                .addClass(Graph.string.CLS_VECTOR_VIEWPORT)
                .selectable(false);

            viewport.props.viewport = true;

            if (this.props.showAxis) {
                // add axis sign
                var gAxis, yAxis, xAxis, tAxis;

                gAxis = Graph.$('<g>').appendTo(viewport.elem);
                yAxis = Graph.$('<rect>').appendTo(gAxis);
                xAxis = Graph.$('<rect>').appendTo(gAxis);
                tAxis = Graph.$('<text>').appendTo(gAxis).text('(0, 0)');

                gAxis.attr({'class': 'graph-axis'});
                xAxis.attr({'class': 'x', rx: 1, ry: 1, x: -16, y:  -2, height:  2, width: 30});
                yAxis.attr({'class': 'y', rx: 1, ry: 1, x:  -2, y: -16, height: 30, width: 2});
                tAxis.attr({'class': 't', x: -40, y: -10});

                gAxis = null;
                xAxis = null;
                yAxis = null;
                tAxis = null;
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
            var viewport = this.components.viewport;

            if (options === undefined) {
                return viewport.graph.layout;
            }
            
            viewport.layout(options);
            viewport.graph.layout.on('refresh', _.bind(this.onLayoutRefresh, this));

            return this;
        },

        canvas: function() {
            return this.plugins.canvas;
        },

        render: function(container) {
            var me = this, 
                vp = me.components.viewport,
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

            if (me.props.zoomEnabled) {
                me.zoomable();

                var debounce = _.debounce(function(){
                    debounce.flush();
                    debounce = null;
                    me.tool().activate('panzoom');
                }, 1000);

                debounce();
            }
            // me.cascade(function(c){
            //     if (c !== me && ! c.props.rendered) {
            //         c.props.rendered = true;
            //         c.tree.paper = id;
            //         c.fire('render');
            //     }
            // });

            var scroller = container;

            while(scroller.length()) {
                if (scroller.node().tagName === 'BODY') {
                    break;
                }
                if ( scroller.css('overflow') != 'hidden' || 
                     scroller.css('overflow-x') != 'hidden' || 
                     scroller.css('overflow-y') != 'hidden' ) {
                    break;
                }
                scroller = scroller.parent();
            }

            me.utils.scroller = scroller;
        },

        container: function() {
            return this.tree.container;
        },

        viewport: function() {
            return this.components.viewport;
        },

        scale: function(sx, sy, cx, cy) {
            if (sx === undefined) {
                return this.components.viewport.matrix().scale();
            }
            return this.plugins.transformer.scale(sx, sy, cx, cy);
        },

        scrollable: function(target) {
            this.utils.scroller = Graph.$(target);
        },

        scrollLeft: function() {
            return this.utils.scroller ? this.utils.scroller.scrollLeft() : 0;
        },

        scrollTop: function() {
            return this.utils.scroller ? this.utils.scroller.scrollTop() : 0;
        },

        // link: function(port1, port2, options) {
        //     var link = new Graph.util.Link(this, port1, port2, options);
        //     return link;
        // },

        /**
         * Create router based on current layout
         */
        router: function(source, target, options) {
            return this.layout().router(source, target, options);
        },

        /**
         * Create link based on selected router
         */
        link: function(router, options) {
            return this.layout().link(router, options);
        },

        selectLinks: function(except) {
            
        },

        deselectLinks: function(except) {

        },

        synchronizeLinks: function(ref) {

        },

        connect: function(source, target, start, end, options) {
            var router, link;

            if (start) {
                if ( ! Graph.isPoint(start)) {
                    options = start;
                    start = null;
                    end = null;    
                }
            }

            router = this.layout().router(source, target, options);
            
            link = this.link(router);
            link.connect(start, end);

            link.render(this);
        },

        toString: function() {
            return 'Graph.svg.Paper';
        },

        ///////// OBSERVERS /////////
        
        onLayoutRefresh: function(e) {
            var me = this,
                viewport = this.viewport(),
                snapping = this.layout().snapping();
            
            viewport.cascade(function(v){
                if (v !== viewport) {
                    if (v.isDraggable()) {
                        v.draggable().snap(snapping);    
                    }

                    if (v.isResizable()) {
                        v.resizable().snap(snapping);
                    }
                }
            });

        },

        onPointerDown: function(e) {
            var link = Graph.manager.link.get(e.target);
            this.deselectLinks(link);
        },

        onNavigation: function(e) {
            var me = this;

            switch(e.keyCode) {
                case Graph.event.DELETE:

                    var selections = me.utils.collector.collection;

                    _.forEach(selections, function(v){

                    });

                    break;
            }
        },

        listenVectorDragend: function(message) {
            var vector = message.publisher;
            if (vector.isLinkable()) {
                this.synchronizeLinks(vector);
            }
        },

        listenVectorResize: function(message) {
            var vector = message.publisher;
            this.synchronizeLinks(vector);
        }

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
                var args, clazz, vector;

                args   = _.toArray(arguments);
                clazz  = Graph.svg[name];
                vector = Graph.factory(clazz, args);
                vector.tree.paper = this.guid();
                return vector;
            };
        }(name, method));
    });

}());