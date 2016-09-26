
(function(){

    var guid = 0;

    var Vector = Graph.svg.Vector = Graph.lang.Class.extend({

        type: '',
        canvas: null,
        dirty: false,

        transformer: null,
        collector: null,
        history: null,
        dragger: null,
        dropper: null,
        resizer: null,
        sorter: null,
        linker: null,

        rendered: false,

        tree: {
            next: null,
            prev: null,
            parent: null,
            children: null
        },

        props: {
            text: '',
            rotate: 0,
            collectable: true,
            selectable: true,
            selected: false,
            focusable: false
        },

        attrs: {
            'stroke': '#4A4D6E',
            'stroke-width': 1,
            'fill': 'none',
            'style': '',
            'class': ''
        },

        /**
         * Available events
         */
        events: {
            render: true,
            transform: true,
            resize: true,
            reset: true,
            select: true,
            deselect: true,
            collect: true,
            decollect: true,
            dragstart: true,
            dragmove: true,
            dragend: true
        },
        
        constructor: function(type, attrs) {
            var me = this;

            me.cached = {
                touchedBBox: null,
                pristinBBox: null,
                position: null,
                offset: null
            };

            me.matrix = Graph.matrix();

            me.tree.children = new Graph.collection.Vector();
            
            me.tree.children.on({
                push: _.bind(me.onAppendChild, me),
                pull: _.bind(me.onRemoveChild, me),
                unshift: _.bind(me.onPrependChild, me)
            });

            me.type = type;
            me.elem = Graph.$(Graph.doc().createElementNS(Graph.config.xmlns.svg, type));
            me.elem.data('vector', me);

            attrs = _.extend({
                'id': 'graph-node-' + (++guid)
            }, me.attrs, attrs || {});

            // apply initial attributes
            me.attr(attrs);

            me.transformer = new Graph.plugin.Transformer(me);
            // me.history = new Graph.plugin.History(me);

            me.transformer.on({
                transform: _.bind(me.onTransform, me)
            });

        },

        id: function() {
            return this.attrs.id;
        },

        reset: function() {
            this.matrix = Graph.matrix();
            this.removeAttr('transform');
            this.props.angle = 0;
            this.dirty = true;

            this.fire('reset', this.props);
        },

        resizable: function(config) {
            if ( ! this.resizer) {
                this.resizer = new Graph.plugin.Resizer(this, config);
                this.resizer.on({
                    resize: _.bind(this.onResizerResize, this)
                });
            }
            return this.resizer;
        },

        draggable: function(config) {
            if ( ! this.dragger) {
                this.dragger = new Graph.plugin.Dragger(this, config);

                this.dragger.on({
                    dragstart: _.bind(this.onDraggerStart, this),
                    dragmove: _.bind(this.onDraggerMove, this),
                    dragend: _.bind(this.onDraggerEnd, this)
                });
            }
            return this.dragger;
        },

        droppable: function() {
            if ( ! this.dropper) {
                this.dropper = new Graph.plugin.Dropper(this);
            }
            return this.dropper;
        },

        sortable: function(config) {
            if ( ! this.sorter) {
                this.sorter = new Graph.plugin.Sorter(this, config);
            }
            return this.Snapper;
        },

        linkable: function(config) {
            if ( ! this.network) {
                this.network = new Graph.plugin.Network(this, config);
            }
            return this.network;
        },

        collectable: function(value) {
            if (_.isUndefined(value)) {
                return this.props.collectable;
            }
            this.props.collectable = value;
            return this;
        },

        selectable: function(value) {
            if (_.isUndefined(value)) {
                return this.props.selectable;
            }
            this.props.selectable = value;
            return this;
        },

        clickable: function(value) {
            var me = this;

            if (_.isUndefined(value)) {
                return me.attrs['pointer-events'];
            }
            
            if (value) {
                this.attr('pointer-events', '');
            } else {
                this.attr('pointer-events', 'none');
            }
            
            return this;
        },

        node: function() {
            return this.elem.node();
        },

        /**
         * Object properties
         */
        data: function(name, value) {
            var me = this;

            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    me.props[k] = v;
                });
                return this;
            }

            if (_.isUndefined(name) && _.isUndefined(value)) {
                return me.props;
            }

            if (_.isUndefined(value)) {
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
                    me.attr(k, v);
                });
                return me;
            }

            if (_.isUndefined(name)) {
                return me.attrs;
            }

            if (_.isUndefined(value)) {
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

            pa = this.pathinfo().transform((absolute ? this.ctm() : this.matrix));
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
            var mat = this.matrix;
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

        offset: function(flush) {

            flush = _.defaultTo(flush, true);

            if (this.dirty || _.isNull(this.cached.offset)) {
                var node = this.node(),
                    bbox = node.getBoundingClientRect();

                if (flush) {
                    this.dirty = false;
                }

                this.cached.offset = {
                    top: bbox.top,
                    left: bbox.left,
                    bottom: bbox.bottom,
                    right: bbox.right,
                    width: bbox.width,
                    height: bbox.height
                };
            }

            return this.cached.offset;
        },

        position: function(flush) {

            flush = _.defaultTo(flush, true);

            if (this.dirty || _.isNull(this.cached.position)) {
                
                var node = this.node(),
                    nbox = node.getBoundingClientRect(),
                    pbox = bbox(node);
                
                if (flush) {
                    this.dirty = false;
                }

                this.cached.position = {
                    top:    nbox.top    - pbox.top,
                    left:   nbox.left   - pbox.left,
                    bottom: nbox.bottom - pbox.top,
                    right:  nbox.right  - pbox.left,
                    width:  nbox.width,
                    height: nbox.height
                };
            }
            
            return this.cached.position;
        },

        ctm: function() {
            var ctm = this.node().getCTM();
            return ctm ? Graph.matrix(ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f) : this.matrix;
        },

        bbox: function(pristin, flush) {
            var path, bbox;

            pristin = _.defaultTo(pristin, false);
            flush   = _.defaultTo(flush, true);

            if (pristin) {
                bbox = this.cached.pristinBBox;
                if (this.dirty || ! bbox) {
                    path = this.pathinfo();
                    bbox = this.cached.pristinBBox = path.bbox();
                    flush && (this.dirty = false);
                }
            } else {
                bbox = this.cached.touchedBBox;
                if (this.dirty || ! bbox) {
                    path = this.pathinfo().transform(this.matrix);
                    bbox = this.cached.touchedBBox = path.bbox();
                    flush && (this.dirty = false);
                }
            }
            
            path = null;
            return bbox;
        },

        find: function(selector) {
            var elems = this.elem.find(selector),
                vectors = [];

            elems.each(function(i, node){
                vectors.push($(node).data('vector'));
            });

            return new Graph.collection.Vector(vectors);
        },

        holder: function() {
            return this.isCanvas()
                ? Graph.$(this.node().parentNode) 
                : Graph.$(this.canvas.node().parentNode);
        },
        
        append: function(vector) {
            vector.render(this, 'append');
            return vector;
        },

        prepend: function(vector) {
            vector.render(this, 'prepend');
            return vector;
        },

        render: function(parent, method) {
            var me = this, collectable = me.props.collectable;
            
            if (me.rendered) {
                return me;
            }

            parent = _.defaultTo(parent, me.canvas);
            method = _.defaultTo(method, 'append');

            if (parent) {
                
                me.canvas = parent.isCanvas() ? parent : parent.canvas;
                me.tree.parent = parent;

                switch(method) {
                    case 'append':
                        parent.elem.append(me.elem);
                        
                        if (collectable) {
                            parent.children().push(me);
                        }

                        break;

                    case 'prepend':
                        parent.elem.prepend(me.elem);

                        if (collectable) {
                            parent.children().unshift(me);
                        }

                        break;
                }

                // broadcast
                if (parent.rendered) {

                    me.rendered = true;
                    me.dirty = true;
                    me.fire('render', me);

                    me.cascade(function(c){
                        if (c !== me && ! c.rendered) {
                            c.rendered = true;
                            c.canvas = me.canvas;
                            c.fire('render', c);
                        }
                    });
                }
            }

            return me;
        },

        paper: function() {
            return this.isCanvas() ? this : this.canvas;
        },

        children: function() {
            return this.tree.children;
        },

        ancestors: function() {
            var me = this, ancestors = [], papa;
            
            while((papa = me.parent()) && ! papa.isCanvas()) {
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

        parent: function() {
            return this.tree.parent;
        },

        prev: function() {
            return this.tree.prev;
        },
        
        next: function() {
            return this.tree.next;
        },

        cascade: function(handler) {
            var me = this;
            cascade(me, handler);
        },

        remove: function() {
            this.elem.remove();
            return this;
        },

        empty: function() {
            this.elem.empty();
            return this;
        },

        select: function() {
            this.addClass('graph-selected');
            this.props.selected = true;
            this.fire('select', this);
            return this;
        },

        deselect: function() {
            this.removeClass('graph-selected');
            this.props.selected = false;
            this.fire('deselect', this);
            return this;
        },

        transform: function(command) {
            return this.transformer.transform(command);
        },

        translate: function(dx, dy) {
            return this.transformer.translate(dx, dy);
        },

        scale: function(sx, sy, cx, cy) {
            return this.transformer.scale(sx, sy, cx, cy);
        },

        rotate: function(deg, cx, cy) {
            return this.transformer.rotate(deg, cx, cy);
        },

        /**
         * Global matrix
         */
        globalMatrix: function() {
            var native = this.node().getCTM();

            if (native) {
                return Graph.matrix(
                    native.a,
                    native.b,
                    native.c,
                    native.d,
                    native.e,
                    native.f
                );
            } else {
                return Graph.matrix();
            }
        },

        screenMatrix: function() {
            var native = this.node().getScreenCTM();

            return Graph.matrix(
                native.a,
                native.b,
                native.c,
                native.d,
                native.e,
                native.f
            );
        },

        /**
         * Difference matrix between local and global
         */
        deltaMatrix: function() {
            
        },

        backward: function() {

        },

        forward: function() {
            var papa = this.parent();
            if (papa) {
                papa.elem.append(this.node());
            }
        },

        front: function() {
            if ( ! this.canvas) {
                return this;
            }
            this.canvas.elem.append(this.node());
            return this;
        },  

        back: function() {
            if ( ! this.canvas) {
                return this;
            }
            this.canvas.elem.prepend(this.node());
            return this;
        },

        focus: function(state) {
            var canvas = this.canvas, timer;
            if (canvas && canvas.spotlight) {
                state = _.defaultTo(state, true);
                timer = _.delay(function(vector, state){
                    clearTimeout(timer);
                    canvas.spotlight.focus(vector, state);
                }, 0, this, state);
            }
        },

        resize: function(sx, sy, cx, cy, dx, dy) {
            return this;
        },

        isGroup: function() {
            return this.type == 'g';
        },

        isCanvas: function() {
            return this instanceof Graph.svg.Paper;
        },

        isCollectable: function() {
            return this.props.collectable;
        },  

        isSelectable: function() {
            return this.props.selectable;
        },

        isDraggable: function() {
            return this.dragger ? true : false;
        },

        isResizable: function() {
            return this.props.resizable;
        },

        onResizerResize: function(e, p) {
            this.dirty = true;
            this.fire('resize', e, this);
        },

        onDraggerStart: function(e, p) {
            var me = this;

            // forward event
            e.dragger = p;
            me.fire('dragstart', e, me);

            if (me.$collector) {
                me.$collector.syncDragStart(me, e);
            }
        },

        onDraggerMove: function(e, p) {
            // forward event
            e.dragger = p;
            this.fire('dragmove', e, this);

            if (this.$collector) {
                this.$collector.syncDragMove(this, e);
            }
        },

        onDraggerEnd: function(e, p) {
            this.dirty = true;

            // forward event
            e.dragger = p;
            this.fire('dragend', e, this);

            if (this.$collector) {
                this.$collector.syncDragEnd(this, e);
            }
        },

        onTransform: function(e, p) {
            this.dirty = true;

            if (e.rotate) {
                this.props.angle = e.rotate.deg;
                this.props.rotate = e.rotate.deg;
            }

            // forward event
            this.fire('transform', e, this);
        },

        onAppendChild: function(child) {
            // forward
            this.fire('appendchild', child, this);
        },

        onRemoveChild: function(child) {
            // forward
            this.fire('removechild', child, this);
        },

        onPrependChild: function(child) {
            // forwad
            this.fire('prependchild', child, this);
        }

    });
    
    ///////// HELPERS /////////
    
    function cascade(vector, handler) {
        var child = vector.children().items;

        if (vector.props.collectable) {
            handler.call(vector, vector);    
        }
        
        if (child.length) {
            _.forEach(child, function(c){
                cascade(c, handler);
            });    
        }
    }

    function bbox(node) {
        if (node.parentNode) {
            if (node.parentNode.nodeName == 'svg') {
                return node.parentNode.getBoundingClientRect();
            }
            return bbox(node.parentNode);
        }

        return {
            top: 0,
            left: 0
        };  
    }

}());