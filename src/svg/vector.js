
(function(){

    var Vector = Graph.svg.Vector = Graph.extend({

        tree: {
            container: null,
            paper: null, // root
            parent: null,
            children: null,
            next: null,
            prev: null
        },

        props: {
            id: null,
            guid: null,
            type: null,
            text: null,
            rotate: 0,
            scaleX: 1,
            scaleY: 1,
            traversable: true,
            selectable: true,
            focusable: false,
            selected: false,
            rendered: false,
            state: null
        },

        attrs: {
            'stroke': '#4A4D6E',
            'stroke-width': 1,
            'fill': 'none',
            'style': '',
            'class': ''
        },

        plugins: {
            transformer: null,
            animator: null,
            resizer: null,
            reactor: null,
            dragger: null,
            dropper: null,
            network: null,
            history: null,
            sorter: null,
            panzoom: null,
            toolmgr: null
        },

        utils: {
            collector: null,
            hinter: null,
            spotlight: null,
            definer: null,
            scroller: null,
            toolpad: null
        },

        graph: {
            matrix: null,
            layout: null
        },

        cached: {
            bbox: null,
            originalBBox: null,
            position: null,
            offset: null
        },

        constructor: function(type, attrs) {
            var me = this;

            me.graph.matrix = Graph.matrix();
            me.tree.children = new Graph.collection.Vector();
            
            me.tree.children.on({
                push:    _.bind(me.onAppendChild, me),
                pull:    _.bind(me.onRemoveChild, me),
                unshift: _.bind(me.onPrependChild, me)
            });

            attrs = _.extend({
                id: 'graph-vector-' + (++Vector.guid)
            }, me.attrs, attrs || {});

            me.elem = Graph.$(document.createElementNS(Graph.config.xmlns.svg, type));
            
            // apply initial attributes
            me.attr(attrs);

            me.props.guid = me.props.id = me.attrs.id; // Graph.uuid();
            me.props.type = type;
            
            me.elem.data(Graph.string.ID_VECTOR, me.props.guid);

            // me.plugins.history = new Graph.plugin.History(me);
            me.plugins.transformer = (new Graph.plugin.Transformer(me))
                .on('translate', _.bind(me.onTransformTranslate, me))
                .on('rotate', _.bind(me.onTransformRotate, me))
                .on('scale', _.bind(me.onTransformScale, me));

            me.plugins.toolmgr = (new Graph.plugin.ToolManager(me))
                .on('activate', _.bind(me.onActivateTool, me))
                .on('deactivate', _.bind(me.onDeactivateTool, me));

            Graph.manager.vector.register(me);
        },

        matrix: function(global) {
            var matrix, ctm;

            global = _.defaultTo(global, false);

            if (global) {
                ctm = this.node().getCTM();
                matrix = ctm ? Graph.matrix(
                    ctm.a,
                    ctm.b,
                    ctm.c,
                    ctm.d,
                    ctm.e,
                    ctm.f
                ) : this.graph.matrix;
            } else {
                matrix = this.graph.matrix;
            }

            return matrix;
        },

        layout: function(options) {
            if (options === undefined) {
                return this.graph.layout;
            }

            var clazz, layout;

            options = options == 'default' ? 'layout' : options;

            if (_.isString(options)) {
                clazz = Graph.layout[_.capitalize(options)];
                layout = Graph.factory(clazz, [this]);
            } else if (_.isPlainObject(options)) {
                if (options.name) {
                    clazz = Graph.layout[_.capitalize(options.name)];
                    delete options.name;   
                    layout = Graph.factory(clazz, [this, options]);
                }
            }
            
            layout.refresh();
            this.graph.layout = layout;

            return this;
        },

        reset: function() {
            this.graph.matrix = Graph.matrix();
            this.removeAttr('transform');
            this.props.rotate = 0;
            this.dirty(true);
            this.fire('reset', this.props);

            // invoke core plugins
            if (this.dragger) {
                this.dragger.rotate(0);
            }
        },

        invalidate: function(cache) {
            this.cached[cached] = null;
        },

        state: function(name) {
            if (name === undefined) {
                return this.props.state;    
            }
            this.props.state = name;
            return this;
        },

        dirty: function(state) {
            if (state === undefined) {
                return this.cached.bbox === null;
            }
            
            if (state) {
                // invalidates
                for (var name in this.cached) {
                    if (name != 'stringify') {
                        this.cached[name] = null;
                    }
                }

                // update core plugins
                // `resizer`
                if (this.plugins.resizer) {
                    this.plugins.resizer.dirty(state);
                }
            }
            
            return this;
        },

        interactable: function() {
            if ( ! this.plugins.reactor) {
                this.plugins.reactor = new Graph.plugin.Reactor(this);
            }

            return this.plugins.reactor;
        },

        animable: function() {
            var me = this;

            if ( ! me.plugins.animator) {
                me.plugins.animator = new Graph.plugin.Animator(me);
                me.plugins.animator.on({
                    animstart: function(e) {
                        me.fire(e);
                    },
                    animating: function(e) {
                        me.fire(e);
                    },
                    animend: function(e) {
                        me.fire(e);
                    }
                })
            }
            return me.plugins.animator;
        },
        
        resizable: function(config) {
            if ( ! this.plugins.resizer) {
                this.plugins.resizer = new Graph.plugin.Resizer(this, config);
                this.plugins.resizer.on({
                    resize: _.bind(this.onResizerResize, this)
                });
            }
            return this.plugins.resizer;
        },

        draggable: function(config) {
            if ( ! this.plugins.dragger) {
                this.plugins.dragger = new Graph.plugin.Dragger(this, config);

                this.plugins.dragger.on({
                    dragstart: _.bind(this.onDraggerStart, this),
                    dragmove: _.bind(this.onDraggerMove, this),
                    dragend: _.bind(this.onDraggerEnd, this)
                });
            }
            return this.plugins.dragger;
        },

        zoomable: function() {
            if ( ! this.plugins.panzoom) {
                this.plugins.panzoom = new Graph.plugin.Panzoom(this);
                this.plugins.toolmgr.register('panzoom');
            }
            return this.plugins.panzoom;
        },

        droppable: function() {
            if ( ! this.plugins.dropper) {
                this.plugins.dropper = new Graph.plugin.Dropper(this);

                this.plugins.dropper.on({
                    dropenter: _.bind(this.onDropperEnter, this),
                    dropleave: _.bind(this.onDropperLeave, this)
                });
            }
            return this.plugins.dropper;
        },

        sortable: function(config) {
            if ( ! this.plugins.sorter) {
                this.plugins.sorter = new Graph.plugin.Sorter(this, config);
            }
            return this.plugins.sorter;
        },

        linkable: function(config) {
            if ( ! this.plugins.network) {
                this.plugins.network = new Graph.plugin.Network(this, config);
            }
            return this.plugins.network;
        },

        traversable: function(value) {
            if (value === undefined) {
                return this.props.traversable;
            }
            this.props.traversable = value;
            return this;
        },

        selectable: function(value) {
            if (value === undefined) {
                return this.props.selectable;
            }
            this.props.selectable = value;
            return this;
        },

        clickable: function(value) {
            var me = this;

            if (value === undefined) {
                return me.attrs['pointer-events'] || 'visiblePainted';
            }
            
            if (value) {
                this.attr('pointer-events', '');
            } else {
                this.attr('pointer-events', 'none');
            }
            
            return this;
        },

        id: function() {
            return this.props.id;
        },

        guid: function() {
            return this.props.guid;
        },  

        node: function() {
            return this.elem.node();
        },

        data: function(name, value) {
            var me = this;

            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    me.props[k] = v;
                });
                return this;
            }

            if (name === undefined && value === undefined) {
                return me.props;
            }

            if (value === undefined) {
                return me.props[name];
            }

            me.props[name] = value;
            return this;
        },

        /**
         * Element properties
         */
        attr: function(name, value) {

            var me = this, node = me.node();

            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    (function(v, k){
                        me.attr(k, v);
                    }(v, k));
                });
                return me;
            }

            if (name === undefined) {
                return me.attrs;
            }

            if (value === undefined) {
                return me.attrs[name] || '';
            }

            me.attrs[name] = value;

            if (name.substring(0, 6) == 'xlink:') {
                node.setAttributeNS(Graph.config.xmlns.xlink, name.substring(6), _.toString(value));
            } else if (name == 'class') {
                node.className.baseVal = _.toString(value);
            } else {
                node.setAttribute(name, _.toString(value));
            }

            return me;
        },

        removeAttr: function(name) {
            this.node().removeAttribute(name);

            if (this.attrs[name]) {
                delete this.attrs[name];
            }
            return this;
        },

        style: function(name, value) {
            var me = this;
            
            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    me.style(k, v);
                });
                return this;
            }

            this.elem.css(name, value);
            return this;
        },

        // set/get pointer style
        cursor: function(style) {
            this.elem.css('cursor', style);
        },

        hasClass: function(predicate) {
            return _.indexOf(_.split(this.attrs['class'], ' '), predicate) > -1;
        },

        addClass: function(added) {
            var classes = _.trim(
                _.join(
                    _.uniq(
                        _.concat(
                            _.split(this.attrs['class'], ' '),
                            _.split(added, ' ')
                        )
                    ),
                    ' '
                )
            );

            this.attr('class', classes);
            return this;
        },

        removeClass: function(removed) {
            var classes = _.split(this.attrs['class'], ' ');
            _.pullAll(classes, _.split(removed, ' '));
            this.attr('class', _.join(classes, ' '));
            return this;
        },

        hide: function() {
            this.elem.hide();
        },

        show: function() {
            this.elem.show();
        },

        pathinfo: function() {
            return new Graph.lang.Path([]);
        },

        vertices: function() {
            return [];
        },

        dots: function(absolute) {
            var ma, pa, ps, dt;

            absolute = _.defaultTo(absolute, false);

            ma = this.matrix(absolute);
            pa = this.pathinfo().transform(ma);
            ps = pa.segments;
            dt = [];

            _.forEach(ps, function(seg){
                var x, y;
                if (seg[0] != 'Z') {
                    x = seg[seg.length - 2];
                    y = seg[seg.length - 1];
                    dt.push([x, y]);
                }
            });

            return dt;
        },

        dotval: function(x, y) {
            var mat = this.graph.matrix;
            return {
                x: mat.x(x, y), 
                y: mat.y(x, y)
            };
        },

        dimension: function() {
            var size = {},
                node = this.node();
                     
            try {
                size = node.getBBox();
            } catch(e) {
                size = {
                    x: node.clientLeft,
                    y: node.clientTop,
                    width: node.clientWidth,
                    height: node.clientHeight
                };
            } finally {
                size = size || {};
            }

            return size;
        },

        offset: function() {
            var node = this.node(),
                bbox = node.getBoundingClientRect(),
                scroller = this.isPaper() ? this.utils.scroller : this.paper().utils.scroller,
                sctop = scroller.scrollTop(),
                scleft = scroller.scrollLeft();
            
            var offset = {
                top: bbox.top + sctop,
                left: bbox.left + scleft,
                bottom: bbox.bottom,
                right: bbox.right,
                width: bbox.width,
                height: bbox.height
            }
            
            return offset;
        },

        position: function() {
            if ( ! this.cached.position) {
                var node = this.node(),
                    nbox = node.getBoundingClientRect(),
                    pbox = position(node);

                this.cached.position = {
                    top: nbox.top - pbox.top,
                    left: nbox.left - pbox.left,
                    bottom: nbox.bottom - pbox.top,
                    right: nbox.right - pbox.left,
                    width: nbox.width,
                    height: nbox.height
                };
            }

            return this.cached.position;
        },

        bbox: function(original) {
            var path, bbox;

            original = _.defaultTo(original, false);
            
            if (original) {
                bbox = this.cached.originalBBox;
                if ( ! bbox) {
                    path = this.pathinfo();
                    bbox = this.cached.originalBBox = path.bbox();
                }
            } else {
                bbox = this.cached.bbox;
                if ( ! bbox) {
                    path = this.pathinfo().transform(this.matrix());
                    bbox = this.cached.bbox = path.bbox();
                }
            }
            
            path = null;
            return bbox;
        },

        find: function(selector) {
            var elems = this.elem.find(selector),
                vectors = [];

            elems.each(function(i, node){
                vectors.push(Graph.manager.vector.get(node));
            });

            return new Graph.collection.Vector(vectors);
        },

        holder: function() {
            return this.isPaper()
                ? Graph.$(this.node().parentNode) 
                : Graph.$(this.paper().node().parentNode);
        },
        
        append: function(vector) {
            vector.render(this, 'append');
            return vector;
        },

        prepend: function(vector) {
            vector.render(this, 'prepend');
            return vector;
        },

        render: function(container, method) {
            var me = this,
                traversable = me.props.traversable;
            
            if (me.props.rendered) {
                return me;
            }

            container = _.defaultTo(container, me.paper());
            method = _.defaultTo(method, 'append');

            if (container) {
                
                if (container.isPaper()) {
                    container = container.viewport();
                }

                me.tree.paper = container.tree.paper;

                if (traversable) {
                    me.tree.parent = container.guid();
                }

                switch(method) {
                    case 'append':
                        container.elem.append(me.elem);
                                
                        if (traversable) {
                            container.children().push(me);
                        }

                        break;

                    case 'prepend':
                        container.elem.prepend(me.elem);

                        if (traversable) {
                            container.children().unshift(me);
                        }

                        break;
                }

                // broadcast
                if (container.props.rendered) {
                    me.props.rendered = true;
                    me.fire('render');

                    me.cascade(function(c){
                        if (c !== me && ! c.props.rendered) {
                            c.props.rendered = true;
                            c.tree.paper = me.tree.paper;
                            c.fire('render');
                        }
                    });
                }
            }

            return me;
        },

        children: function() {
            return this.tree.children;
        },

        ancestors: function() {
            var me = this, ancestors = [], papa;
            
            while((papa = me.parent()) && ! papa.isPaper()) {
                ancestors.push(papa);
                papa = papa.parent();
            }

            return new Graph.collection.Vector(ancestors);
        },

        descendants: function() {
            var me = this, descendants = [];
            
            me.cascade(function(v){
                if (v !== me) {
                    descendants.push(v);
                }
            });

            return new Graph.collection.Vector(descendants);
        },

        paper: function() {
            if (this.isPaper()) {
                return this;
            } else {
                return Graph.manager.vector.get(this.tree.paper);
            }
        },  

        parent: function() {
            return Graph.manager.vector.get(this.tree.parent);
        },

        prev: function() {
            return Graph.manager.vector.get(this.tree.prev);
        },
        
        next: function() {
            return Graph.manager.vector.get(this.tree.next);
        },

        cascade: function(handler) {
            cascade(this, handler);
        },

        bubble: function(handler) {
            bubble(this, handler);
        },

        remove: function() {
            var parent = this.parent();

            if (parent) {
                parent.children().pull(this);
            }

            this.elem.remove();
            this.elem = null;

            Graph.manager.vector.unregister(this);
        },

        empty: function() {
            var me = this;

            me.cascade(function(c){
                if (c !== me) {
                    Graph.manager.vector.unregister(c);    
                }
            });

            this.children().clear();
            this.elem.empty();

            return this;
        },

        select: function() {
            this.addClass('graph-selected');
            this.props.selected = true;
            this.fire('select');

            // invoke core plugins to increase performance
            if (this.plugins.resizer) {
                this.plugins.resizer.resume();
            }

            // publish
            Graph.topic.publish('vector/select', {vector: this});

            return this;
        },

        deselect: function() {
            this.removeClass('graph-selected');
            this.props.selected = false;
            this.fire('deselect');

            // invoke core plugins to increase performance
            if (this.plugins.resizer) {
                if ( ! this.plugins.resizer.props.suspended) {
                    this.plugins.resizer.suspend();
                }
            }

            if ( ! this.$collector) {
                Graph.topic.publish('vector/deselect', {vector: this});
            }

            return this;
        },

        transform: function(command) {
            return this.plugins.transformer.transform(command);
        },

        translate: function(dx, dy) {
            return this.plugins.transformer.translate(dx, dy);
        },

        scale: function(sx, sy, cx, cy) {
            if (sx === undefined) {
                return this.matrix(true).scale();
            }
            return this.plugins.transformer.scale(sx, sy, cx, cy);
        },

        rotate: function(deg, cx, cy) {
            return this.plugins.transformer.rotate(deg, cx, cy);
        },

        animate: function(params, duration, easing, callback) {
            if (this.plugins.animator) {
                this.plugins.animator.animate(params, duration, easing, callback);
                return this.plugins.animator;
            }
            return null;
        },

        label: function(label) {
            this.elem.text(label);
            return this;
        },

        /**
         * Difference matrix between local and global
         */
        deltaMatrix: function() {
            
        },

        backward: function() {
            var papa = this.parent();
            if (papa) {
                papa.elem.prepend(this.elem);
            }
        },

        forward: function() {
            var papa = this.parent();
            if (papa) {
                papa.elem.append(this.elem);
            }
        },

        front: function() {
            if ( ! this.tree.paper) {
                return this;
            }
            this.paper().elem.append(this.elem);
            return this;
        },  

        back: function() {
            if ( ! this.tree.paper) {
                return this;
            }
            this.paper().elem.prepend(this.elem);
            return this;
        },

        focus: function(state) {
            var paper = this.paper(), timer;
            if (paper && paper.utils.spotlight) {
                state = _.defaultTo(state, true);
                timer = _.delay(function(vector, state){
                    clearTimeout(timer);
                    paper.utils.spotlight.focus(vector, state);
                }, 0, this, state);
            }
        },

        resize: function(sx, sy, cx, cy, dx, dy) {
            return this;
        },

        isGroup: function() {
            return this.props.type == 'g';
        },

        isPaper: function() {
            return this.props.type == 'svg';
        },

        isViewport: function() {
            return this.props.viewport === true;
        },

        isTraversable: function() {
            return this.props.traversable;
        },  

        isSelectable: function() {
            return this.props.selectable;
        },

        isDraggable: function() {
            return this.plugins.dragger !== null;
        },

        isResizable: function() {
            return this.plugins.resizer !== null;
        },

        isLinkable: function() {
            return this.plugins.network ? true : false;
        },

        isRendered: function() {
            return this.props.rendered;
        },

        ///////// TOOLS //////////
        
        tool: function() {
            return this.plugins.toolmgr;
        },

        toString: function() {
            var name = this.cached.stringify;
            if ( ! name) {
                name = this.cached.stringify = 'Graph.svg.' + _.capitalize(this.props.type);
            }
            return name;
        },

        ///////// OBSERVERS /////////

        onResizerResize: function(e) {
            this.dirty(true);
            // forward
            this.fire(e);

            // publish
            Graph.topic.publish('vector/resize', e);
        },

        onDraggerStart: function(e) {
            // forward event
            this.fire(e);

            if (this.$collector) {
                this.$collector.syncDragStart(this, e);
            }

            // invoke core plugins
            if (this.plugins.resizer) {
                this.plugins.resizer.suspend();
            }
        },

        onDraggerMove: function(e) {
            // forward event
            this.fire(e);

            if (this.$collector) {
                this.$collector.syncDragMove(this, e);
            }
        },

        onDraggerEnd: function(e) {
            this.dirty(true);
            // forward
            this.fire(e);

            // publish
            Graph.topic.publish('vector/dragend', e);

            if (this.$collector) {
                this.$collector.syncDragEnd(this, e);
            }

            // invoke plugins
            if (this.plugins.resizer) {
                this.plugins.resizer.resume();
                if ( ! this.props.selected) {
                    this.plugins.resizer.suspend();
                }
            }

        },

        onDropperEnter: function(e) {
            this.fire(e);
        },

        onDropperLeave: function(e) {
            this.fire(e);
        },

        onTransformRotate: function(e) {
            this.dirty(true);

            this.props.rotate = e.deg;
            this.fire('rotate', {deg: e.deg});

            // invoke core plugins
            if (this.plugins.dragger) {
                var rotate = this.matrix(true).rotate();
                this.plugins.dragger.rotate(rotate.deg);
            }
        },

        onTransformTranslate: function(e) {
            this.dirty(true);
            this.fire('translate', {dx: e.dx, dy: e.dy});
        },

        onTransformScale: function(e) {
            this.dirty(true);
            this.props.scaleX = e.sx;
            this.props.scaleY = e.sy;

            this.fire('scale', {sx: e.sx, sy: e.sy});

            if (this.plugins.dragger) {
                var scale = this.matrix(true).scale();
                this.plugins.dragger.scale(scale.x, scale.y);
            }
        },

        onActivateTool: function(e) {
            var data = e.originalData;
            this.fire('activatetool', data);
        },

        onDeactivateTool: function(e) {
            var data = e.originalData
            this.fire('deactivatetool', data);
        },

        onAppendChild: function(e) {
            // forward
            this.fire('appendchild', {child: e.vector});
        },

        onRemoveChild: function(e) {
            // forward
            this.fire('removechild', {child: e.vector});
        },

        onPrependChild: function(e) {
            // forwad
            this.fire('prependchild', {child: e.vector});
        }

    });

    ///////// STATICS /////////
    
    Vector.toString = function() {
        return 'function(tag)';
    };

    Vector.guid = 0;

    ///////// LANGUAGE CHECK /////////
    Graph.isVector = function(obj) {
        return obj instanceof Graph.svg.Vector;
    };
    
    ///////// HELPERS /////////
    
    function cascade(vector, handler) {
        var child = vector.children().toArray();

        handler.call(vector, vector);
        
        if (child.length) {
            _.forEach(child, function(c){
                cascade(c, handler);
            });    
        }
    }

    function bubble(vector, handler) {
        var parent = vector.parent();

        handler.call(vector, vector);

        if (parent) {
            bubble(parent, handler);
        }
    }

    function position(node) {
        if (node.parentNode) {
            if (node.parentNode.nodeName == 'svg') {
                return node.parentNode.getBoundingClientRect();
            }
            return position(node.parentNode);
        }

        return {
            top: 0,
            left: 0
        };  
    }

}());