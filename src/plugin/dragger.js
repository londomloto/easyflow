
(function(){

    Graph.plugin.Dragger = Graph.extend({
        
        props: {
            vector: null,
            enabled: true,
            rendered: false,
            suspended: true,
            inertia: false,
            ghost: false,
            bound: false,
            grid: [10, 10],
            axis: false,
            hint: false
        },

        rotation: {
            deg: 0,
            rad: 0,
            sin: 0,
            cos: 1
        },

        scaling: {
            x: 1,
            y: 1
        },

        trans: {
            vector: null,
            paper: null,
            dx: 0,
            dy: 0
        },

        components: {
            holder: null,
            helper: null
        },

        cached: {
            snapping: null
        },

        constructor: function(vector, options) {
            var me = this;

            vector.addClass('graph-draggable');
            me.props.vector = vector.guid();

            options = _.extend({
                enabled: true,
                inertia: false
            }, options || {});

            _.forEach(['axis', 'grid', 'bbox', 'ghost', 'hint'], function(name){
                if (options[name] !== undefined) {
                    me.props[name] = options[name];
                }
            });

            _.assign(me.props, options);

            me.initComponent();

            vector.on({
                render: _.bind(me.onVectorRender, me)
            });

            if (vector.props.rendered) {
                me.setup();
            }
        },

        vector: function() {
            return Graph.manager.vector.get(this.props.vector);
        },

        initComponent: function() {
            var me = this, comp = me.components;

            if (me.props.ghost) {
                comp.holder = (new Graph.svg.Group())
                    .addClass('graph-dragger')
                    .removeClass('graph-elem graph-elem-group')
                    .traversable(false)
                    .selectable(false);

                comp.helper = (new Graph.svg.Rect(0, 0, 0, 0, 0))
                    .addClass('graph-dragger-helper')
                    .removeClass('graph-elem graph-elem-rect')
                    .traversable(false)
                    .selectable(false)
                    .render(comp.holder);
            }
        },

        setup: function() {
            var me = this, 
                vector = me.vector(),
                paper = vector.paper(),
                options = {};

            if (me.plugin) {
                return;
            }

            if (paper.utils.scroller) {
                // options.autoScroll = {
                //     container: paper.utils.scroller.node()
                // };
            }

            if (me.props.hint && paper.utils.hinter) {
                paper.utils.hinter.register(me.vector);
            }

            _.extend(options, {
                manualStart: me.props.ghost ? true : false,
                onstart: _.bind(me.onDragStart, me),
                onmove: _.bind(me.onDragMove, me),
                onend: _.bind(me.onDragEnd, me)
            });

            me.plugin = vector.interactable().draggable(options);
            me.plugin.styleCursor(false);
            me.plugin.on('move', _.bind(me.onPointerMove, me));

            var matrix = vector.matrix(true),
                rotate = matrix.rotate(),
                scale = matrix.scale();

            me.rotate(rotate.deg);
            me.scale(scale.x, scale.y);

            me.snap({
                mode: 'grid',
                x: me.props.grid[0],
                y: me.props.grid[1]
            });

            me.plugin.draggable(me.props.enabled);
        },

        enable: function() {
            this.props.enabled = true;
            if (this.plugin) {
                this.plugin.draggable(true);
            }
        },

        disable: function() {
            this.props.enabled = false;
            if (this.plugin) {
                this.plugin.draggable(false);
            }
        },

        ghost: function(ghost) {
            if (ghost === undefined) {
                return this.props.ghost;
            }
            this.props.ghost = ghost;
            return this;
        },

        render: function() {
            var me = this, 
                comp = me.components,
                vector = me.vector();

            if ( ! me.props.rendered) {
                me.props.rendered = true;
                me.components.holder.render(vector.parent());
            }

            if (me.props.ghost) {
                me.redraw();
            }   
            
        },

        suspend: function() {
            this.props.suspended = true;
            if (this.components.holder) {
                this.components.holder.elem.detach();
                // this.components.holder.removeClass('visible');
            }
        },

        resume: function() {
            this.props.suspended = false;

            if (this.components.holder) {
                if ( ! this.props.rendered) {
                    this.render();
                } else {
                    this.vector().parent().elem.append(this.components.holder.elem);
                    this.redraw();
                }
            }
        },

        redraw: function() {
            var comp = this.components;

            if (comp.helper) {
                var vbox = this.vector().bbox().data(),
                    hbox = comp.helper.bbox().data();

                var dx = vbox.x - hbox.x,
                    dy = vbox.y - hbox.y;

                comp.helper.translate(dx, dy).apply();

                comp.helper.attr({
                    width: vbox.width,
                    height: vbox.height
                });
            }
        },

        rotate: function(deg) {
            var rad = Graph.rad(deg);
            this.rotation.deg = deg;
            this.rotation.rad = rad;
            this.rotation.sin = Math.sin(rad);
            this.rotation.cos = Math.cos(rad);
        },

        scale: function(sx, sy) {
            sy = _.defaultTo(sy, sx);
            this.scaling.x = sx;
            this.scaling.y = sy;
        },

        snap: function(snap) {

            if (snap === undefined) {
                return this.cached.snapping;
            }

            var me = this, snaps = [];

            // save original request
            this.cached.snapping = snap;

            if (_.isArray(snap)) {
                _.forEach(snap, function(s){
                    snaps.push(fixsnap(s));
                });
            } else {
                snaps.push(fixsnap(snap));
            }

            if (this.plugin) {
                this.plugin.setOptions('snap', {
                    targets: snaps
                });
                // this.plugin.setOptions('snap', {
                //     targets: snaps
                //     relativePoints: [
                //         {x: .5, y: .5}
                //     ]
                // });
            }

            /////////
            
            function fixsnap(snap) {
                snap.mode = _.defaultTo(snap.mode, 'anchor');

                if (snap.mode == 'grid') {
                    if (me.props.axis == 'x') {
                        snap.y = 0;
                    } else if (me.props.axis == 'y') {
                        snap.x = 0;
                    }
                    snap = interact.createSnapGrid({x: snap.x, y: snap.y});
                } else {
                    snap.range = _.defaultTo(snap.range, 20);
                }
                return snap;
            }
        },

        resetSnap: function() {
            this.snaps = [];

            this.snap({
                mode: 'grid',
                x: this.props.grid[0],
                y: this.props.grid[1]
            });
        },

        bound: function(bound) {
            /*if ( ! this.plugin) {
                return;
            }

            if (_.isBoolean(bound) && bound === false) {
                this.props.bound = false;
                this.plugin.setOptions('restrict', null);
                return;
            }

            bound = _.extend({
                top: Infinity,
                right: Infinity,
                bottom: Infinity,
                left: Infinity
            }, bound || {});
            
            this.props.bound = _.extend({}, bound);

            this.plugin.setOptions('restrict', {
                restriction: bound
            });

            return;*/
        },

        onVectorRender: function() {
            this.setup();
        },

        onPointerMove: function(e) {
            var i = e.interaction;
            if (this.props.ghost) {
                if (i.pointerIsDown && ! i.interacting()) {
                    if (e.currentTarget === this.vector().node()) {
                        if (this.props.suspended) {
                            this.resume();
                        }
                        i.start({name: 'drag'}, e.interactable, this.components.helper.node());        
                    }
                }
            }
        },

        onDragStart: function(e) {
            var vector = this.vector(),
                paper = vector.paper();

            vector.addClass('dragging');

            this.trans.vector = vector;
            this.trans.paper = paper;
            this.trans.dx = 0;
            this.trans.dy = 0;

            var edata = {
                dx: 0,
                dy: 0,
                ghost: this.props.ghost
            };

            if (this.props.hint && paper.utils.hinter) {
                paper.utils.hinter.activate(vector);
            }

            this.fire('dragstart', edata);
        },

        onDragMove: function(e) {
            var trans = this.trans,
                paper = trans.paper,
                vector = trans.vector,
                helper = this.components.helper,
                axs = this.props.axis,
                deg = this.rotation.deg,
                sin = this.rotation.sin,
                cos = this.rotation.cos,
                scaleX = this.scaling.x,
                scaleY = this.scaling.y;

            var edx = _.defaultTo(e.dx, 0),
                edy = _.defaultTo(e.dy, 0);

            var dx, dy, hx, hy, tx, ty;
            
            dx = dy = hx = hy = tx = ty = 0;
                
            edx /= scaleX;
            edy /= scaleY;

            if (axs == 'x') {
                dx = hx = edx;
                dy = hy = 0;

                tx = edx *  cos + 0 * sin;
                ty = edx * -sin + 0 * cos;
            } else if (axs == 'y') {
                dx = hx = 0;
                dy = hy = edy;

                tx = 0 *  cos + edy * sin;
                ty = 0 * -sin + edy * cos;
            } else {
                hx = edx;
                hy = edy;

                dx = tx = edx *  cos + edy * sin;
                dy = ty = edx * -sin + edy * cos;  
            }

            this.trans.dx += tx;
            this.trans.dy += ty;

            if (this.props.hint && paper.utils.hinter) {
                paper.utils.hinter.watch(dx, dy);
            }

            if (helper) {
                helper.translate(hx, hy).apply();
            } else {
                vector.translate(dx, dy).apply(); 
            }

            var pgx = _.defaultTo(e.pageX, e.x0),
                pgy = _.defaultTo(e.pageY, e.y0);

            pgx /= scaleX;
            pgy /= scaleY;

            var edata = {
                pageX: pgx,
                pageY: pgy,

                dx: dx,
                dy: dy,
                
                ox: hx, // _.defaultTo(e.dx, 0),
                oy: hy, // _.defaultTo(e.dy, 0),
                
                ghost: this.props.ghost
            };

            this.fire('dragmove', edata);
        },

        onDragEnd: function(e) {
            var trans = this.trans,
                paper = trans.paper,
                vector = trans.vector,
                helper = this.components.helper,
                dx = trans.dx,
                dy = trans.dy;
                
            if (this.props.hint && paper.utils.hinter) {
                paper.utils.hinter.deactivate();
            }

            if (helper) {
                vector.translate(dx, dy).apply();
                this.redraw();
                this.suspend();
            }

            vector.removeClass('dragging');

            var edata = {
                dx: dx,
                dy: dy,
                ghost: this.props.ghost
            };
            
            this.fire('dragend', edata);
            
            this.trans.vector = null;
            this.trans.paper = null;
            this.trans.dx = 0;
            this.trans.dy = 0;

        }
    });

}());