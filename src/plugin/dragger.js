
(function(){

    Graph.plugin.Dragger = Graph.extend({
        
        props: {
            enabled: true,
            suspended: false,
            inertia: false,
            ghost: false,
            bound: false,
            grid: [10, 10],
            axis: false,
            hint: false
        },

        rotate: {
            deg: 0,
            rad: 0,
            sin: 0,
            cos: 1
        },

        snaps: [

        ],

        trans: {
            dx: 0,
            dy: 0
        },

        vector: null,
        canvas: null,
        
        components: {
            holder: null,
            helper: null
        },

        constructor: function(vector, options) {
            var me = this;

            me.vector = vector;
            me.vector.addClass('graph-draggable');

            options = _.extend({
                enabled: true,
                inertia: false
            }, options || {});

            _.forEach(['axis', 'grid', 'bbox', 'ghost', 'hint'], function(name){
                if ( ! _.isUndefined(options[name])) {
                    me.props[name] = options[name];
                }
            });

            _.extend(me.props, options);

            if (me.vector.rendered) {
                me.setup();
            } else {
                me.vector.on({
                    transform: _.bind(me.onVectorTransform, me),
                    render: _.bind(me.onVectorRender, me),
                    reset: _.bind(me.onVectorReset, me)
                });
            }

        },

        setup: function() {
            var me = this, 
                canvas = me.vector.paper(),
                options = {};

            if (me.plugin) {
                return;
            }

            me.canvas = canvas;

            if (canvas.scroller) {
                // options.autoScroll = {
                //     container: canvas.scroller.node()
                // };
            }

            if (me.props.hint && canvas.hinter) {
                canvas.hinter.register(me.vector);
            }

            _.extend(options, {
                manualStart: me.props.ghost ? true : false,
                onstart: _.bind(me.onDragStart, me),
                onmove: _.bind(me.onDragMove, me),
                onend: _.bind(me.onDragEnd, me)
            });

            me.plugin = interact(me.vector.node()).draggable(options);
            me.plugin.styleCursor(false);

            me.plugin.on({
                down: _.bind(me.onPointerDown, me),
                move: _.bind(me.onPointerMove, me)
            });

            me.dragRotate(me.vector.props.rotate);

            me.dragSnap({
                mode: 'grid',
                x: me.props.grid[0],
                y: me.props.grid[1]
            });

            me.plugin.draggable(me.props.enabled);

            me.render();
            me.suspend();
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

        suspend: function() {
            this.props.suspended = true;
            if (this.components.holder) {
                this.components.holder.removeClass('visible');
            }
        },

        resume: function() {
            this.props.suspended = false;
            if (this.components.holder) {
                this.components.holder.addClass('visible');
            }
        },

        render: function() {
            var canvas = this.canvas, // this.vector.paper(),
                comp = this.components;

            if (this.props.ghost) {
                if ( ! comp.holder) {
                    comp.holder = canvas.group();
                    comp.holder.props.collectable = false;
                    comp.holder.props.selectable = false;
                    comp.holder.addClass('graph-dragger').removeClass('graph-elem graph-elem-group');
                    this.vector.parent().append(comp.holder);
                }

                if ( ! comp.helper) {
                    comp.helper = canvas.rect(0, 0, 0, 0);
                    comp.helper.addClass('graph-dragger-helper').removeClass('graph-elem graph-elem-rect');
                    comp.helper.props.collectable = false;
                    comp.helper.props.selectable = false;
                    comp.holder.append(comp.helper);

                    comp.helper.attr({
                        'fill': 'transparent',
                        'stroke': '#333',
                        'stroke-width': 1,
                        'stroke-dasharray': '4 3'
                    });
                }
            }

            this.redraw();
        },

        redraw: function() {
            var comp = this.components;

            this.resume();

            if (comp.helper) {
                var vbox = this.vector.bbox(false, false).data(),
                    hbox = comp.helper.bbox(false, false).data();

                var dx = vbox.x - hbox.x,
                    dy = vbox.y - hbox.y;

                comp.helper.translate(dx, dy).apply();

                comp.helper.attr({
                    width: vbox.width,
                    height: vbox.height
                });
            }
        },

        dragRotate: function(deg) {
            var rad = Graph.rad(deg);

            this.rotate.deg = deg;
            this.rotate.rad = rad;
            this.rotate.sin = Math.sin(rad);
            this.rotate.cos = Math.cos(rad);
        },

        dragSnap: function(snap) {
            var me = this, snaps = me.snaps;

            if (_.isArray(snap)) {
                _.forEach(snap, function(s){
                    snaps.unshift(fixsnap(s));
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
                } else if (snap.mode == 'anchor') {
                    snap.range = _.defaultTo(snap.range, 20);
                }
                return snap;
            }
        },

        resetSnap: function() {
            this.snaps = [];

            this.dragSnap({
                mode: 'grid',
                x: this.props.grid[0],
                y: this.props.grid[1]
            });
        },

        dragBound: function(bound) {
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

        onVectorTransform: function(e) {
            if (e.rotate) {
                this.dragRotate(this.rotate.deg + e.rotate.deg);
            }
        },

        onVectorReset: function() {
            this.dragRotate(0);
        },

        onPointerDown: function(e) {
            this.fire('pointerdown', e, this);    
        },

        onPointerMove: function(e) {
            var i = e.interaction;

            if (this.props.ghost) {
                if (i.pointerIsDown && ! i.interacting() && e.currentTarget === this.vector.node()) {
                    if (this.props.suspended) {
                        this.resume();
                        this.redraw();
                    }
                    i.start({name: 'drag'}, e.interactable, this.components.helper.node());    
                }    
            }
        },

        onDragStart: function(e) {
            this.vector.addClass('dragging');

            this.trans.dx = 0;
            this.trans.dy = 0;

            var edata = {
                dx: 0,
                dy: 0,
                ghost: this.props.ghost
            };

            if (this.props.hint && this.canvas.hinter) {
                this.canvas.hinter.activate(this.vector);
            }

            this.fire('dragstart', edata, this);
        },

        onDragMove: function(e) {
            var axs = this.props.axis,
                deg = this.rotate.deg,
                sin = this.rotate.sin,
                cos = this.rotate.cos;

            var dx, dy, hx, hy, tx, ty;
            
            dx = dy = hx = hy = tx = ty = 0;

            if (axs == 'x') {
                dx = hx = e.dx;
                dy = hy = 0;

                tx = e.dx *  cos + 0 * sin;
                ty = e.dx * -sin + 0 * cos;
            } else if (axs == 'y') {
                dx = hx = 0;
                dy = hy = e.dy;

                tx = 0 *  cos + e.dy * sin;
                ty = 0 * -sin + e.dy * cos;
            } else {
                hx = e.dx;
                hy = e.dy;

                dx = tx = e.dx *  cos + e.dy * sin;
                dy = ty = e.dx * -sin + e.dy * cos;  
            }

            this.trans.dx += tx;
            this.trans.dy += ty;

            if (this.props.hint && this.canvas.hinter) {
                this.canvas.hinter.watch(dx, dy);
            }

            if (this.components.helper) {
                this.components.helper.translate(hx, hy).apply();
            } else {
                this.vector.translate(dx, dy).apply(); 
            }
            
            var edata = {
                pageX: _.defaultTo(e.pageX, e.x0),
                pageY: _.defaultTo(e.pageY, e.y0),

                dx: dx,
                dy: dy,
                
                ox: hx, // _.defaultTo(e.dx, 0),
                oy: hy, // _.defaultTo(e.dy, 0),
                
                ghost: this.props.ghost
            };

            this.fire('dragmove', edata, this);
        },

        onDragEnd: function(e) {
            var dx = this.trans.dx,
                dy = this.trans.dy;

            if (this.props.hint && this.canvas.hinter) {
                this.canvas.hinter.deactivate();
            }

            if (this.components.helper) {
                this.vector.translate(dx, dy).apply();
                this.redraw();
                this.suspend();
            }

            this.vector.removeClass('dragging');

            var edata = {
                dx: dx,
                dy: dy,
                ghost: this.props.ghost
            };

            this.fire('dragend', edata, this);

            this.trans.dx = 0;
            this.trans.dy = 0;
        }
    });

}());