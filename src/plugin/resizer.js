
(function(){
    
    Graph.plugin.Resizer = Graph.extend({
        
        props: {
            suspended: true,
            handleImage: Graph.config.base + 'img/resize-control.png',
            handleSize: 17,
            rendered: false
        },

        components: {
            holder: null,
            helper: null,
            handle: {}
        },

        trans: {
            // original offset
            ox: 0,
            oy: 0,

            // original
            ow: 0,
            oh: 0,

            // current
            cw: 0,
            ch: 0,

            // translation
            dx: 0,
            dy: 0
        },

        cached: {
            snapping: null,
            vertices: null
        },

        constructor: function(vector) {
            var me = this;
            
            me.vector = vector;
            me.vector.addClass('graph-resizable');
            me.props.handleImage = Graph.config.base + 'img/resize-control.png';

            me.initComponent();
        },

        initComponent: function() {
            var me = this, comp = me.components;

            comp.holder = (new Graph.svg.Group())
                .addClass('graph-resizer')
                .removeClass('graph-elem graph-elem-group');

            comp.holder.elem.group('graph-resizer');

            comp.holder.on({
                render: _.bind(me.onHolderRender, me)
            });
            
            comp.helper = (new Graph.svg.Rect(0, 0, 0, 0, 0))
                .addClass('graph-resizer-helper')
                .removeClass('graph-elem graph-elem-rect')
                .selectable(false)
                .clickable(false)
                .render(comp.holder);

            comp.helper.elem.group('graph-resizer');

            me.handle = {};

            var handle = {
                ne: {},
                se: {},
                sw: {},
                nw: {},
                 n: {axis: 'y'},
                 e: {axis: 'x'},
                 s: {axis: 'y'},
                 w: {axis: 'x'}
            };

            _.forOwn(handle, function(c, dir){
                (function(dir){

                    comp.handle[dir] = (new Graph.svg.Image(
                        me.props.handleImage,
                        0,
                        0,
                        me.props.handleSize,
                        me.props.handleSize
                    ))
                    .selectable(false)
                    .removeClass('graph-elem graph-elem-image')
                    .addClass('graph-resizer-handle handle-' + dir);

                    comp.handle[dir].elem.group('graph-resizer');
                    comp.handle[dir].props.dir = dir;
                    comp.handle[dir].draggable(c);
                    comp.handle[dir].on('pointerdown', function(e){
                        e.stopPropagation();
                    });
                    
                    comp.handle[dir].on('dragstart', _.bind(me.onHandleMoveStart, me));
                    comp.handle[dir].on('dragmove', _.bind(me.onHandleMove, me));
                    comp.handle[dir].on('dragend', _.bind(me.onHandleMoveEnd, me));

                    comp.handle[dir].render(comp.holder);
                }(dir));
            });
        },

        invalidate: function(cache)  {
            this.cached[cache] = null;
        },

        dirty: function(state) {
            if (state === undefined) {
                return this.cached.vertices ? true : false;
            }

            if (state) {
                this.invalidate('vertices');
            }

            return this;
        },

        render: function() {
            var me = this, 
                comp = me.components,
                vector = me.vector;

            if (me.props.rendered) {
                me.redraw();
                return;
            }

            comp.holder.render(vector.parent());

            me.props.rendered = true;
            me.redraw();
        },

        snap: function(snap) {
            this.cached.snapping = snap;
        },

        vertices: function() {
            var me = this, 
                vector = me.vector,
                vertices = me.cached.vertices;

            var dt, m1, m2, b1, b2, ro, p1, p2, cx, cy;

            if ( ! vertices) {

                m1 = vector.matrix().clone();
                b1 = vector.bbox(true).data();
                p1 = vector.pathinfo().transform(m1);
                
                ro = m1.rotate().deg;
                cx = b1.x + b1.width / 2;
                cy = b1.y + b1.height / 2;
                
                m2 = Graph.matrix();
                m2.rotate(-ro, cx, cy);

                p2 = p1.transform(m2);
                b2 = p2.bbox().data();

                var bx = b2.x,
                    by = b2.y,
                    bw = b2.width,
                    bh = b2.height,
                    hw = bw / 2,
                    hh = bh / 2,
                    hs = me.props.handleSize / 2;

                vertices = {
                    ne: {
                        x: bx + bw - hs,
                        y: by - hs
                    },
                    se: {
                        x: bx + bw - hs,
                        y: by + bh - hs
                    },
                    sw: {
                        x: bx - hs,
                        y: by + bh - hs
                    },
                    nw: {
                        x: bx - hs,
                        y: by - hs
                    },
                    n: {
                        x: bx + hw - hs,
                        y: by - hs
                    },
                    e: {
                        x: bx + bw - hs,
                        y: by + hh - hs
                    },
                    s: {
                        x: bx + hw - hs,
                        y: by + bh - hs
                    },
                    w: {
                        x: bx - hs,
                        y: by + hh - hs
                    },

                    rotate: {
                        deg: ro,
                        cx: cx,
                        cy: cy
                    },

                    box: {
                        x: bx,
                        y: by,
                        width: bw,
                        height: bh
                    },

                    offset: {
                        x: b1.x,
                        y: b1.y
                    }
                };

                me.cached.vertices = vertices;
            }

            return vertices;
        },

        redraw: function() {
            var me = this, comp = me.components, vx;

            if ( ! comp.holder) {
                return;
            }

            vx = this.vertices();
            
            comp.helper.reset();

            comp.helper.attr({
                x: vx.box.x,
                y: vx.box.y,
                width: vx.box.width,
                height: vx.box.height
            });
            
            comp.helper.rotate(vx.rotate.deg, vx.rotate.cx, vx.rotate.cy).apply();

            _.forOwn(comp.handle, function(h, d){
                (function(h, d){
                    h.show();
                    h.reset();
                    h.attr(vx[d]);
                    h.rotate(vx.rotate.deg, vx.rotate.cx, vx.rotate.cy).apply();
                }(h, d));
            });

            me.trans.ox = vx.offset.x;
            me.trans.oy = vx.offset.y;
            me.trans.ow = this.trans.cw = vx.box.width;
            me.trans.oh = this.trans.ch = vx.box.height;
            me.trans.dx = 0;
            me.trans.dy = 0;
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
                    this.vector.parent().elem.append(this.components.holder.elem);
                    this.redraw();
                }
            }
        },

        onHolderRender: function(e) {
            
        },

        onHandleMoveStart: function(e) {
            var me = this, handle = e.publisher;

            _.forOwn(me.components.handle, function(a, b){
                if (a !== handle) {
                    a.hide();
                }
            });

            if (handle.draggable().snap() !== this.cached.snapping) {
                handle.draggable().snap(this.cached.snapping);    
            }
            
            handle.show();
            handle.removeClass('dragging');
        },

        onHandleMove: function(e) {
            var me = this, handle = e.publisher;
            
            var tr = this.trans,
                dx = e.dx,
                dy = e.dy;

            switch(handle.props.dir) {
                case 'ne':
                    tr.cw += dx;
                    tr.ch -= dy;

                    me.trans.dy += dy;
                    me.components.helper.translate(0, dy).apply();
                    break;

                case 'se':
                    tr.cw += dx;
                    tr.ch += dy;

                    break;

                case 'sw':
                    tr.cw -= dx;
                    tr.ch += dy;

                    me.trans.dx += dx;
                    me.components.helper.translate(dx, 0).apply();
                    break;

                case 'nw':
                    tr.cw -= dx;
                    tr.ch -= dy;

                    me.trans.dx += dx;
                    me.trans.dy += dy;
                    me.components.helper.translate(dx, dy).apply();
                    break;

                case 'n':
                    tr.cw += 0;
                    tr.ch -= dy;

                    me.trans.dy += dy;
                    me.components.helper.translate(0, dy).apply();
                    break;

                case 'e':
                    tr.cw += dx;
                    tr.ch += 0;

                    break;

                case 's':
                    tr.cw += 0;
                    tr.ch += dy;
                    break;

                case 'w':
                    tr.cw -= dx;
                    tr.ch += 0;

                    me.trans.dx += dx;
                    me.components.helper.translate(dx, 0).apply();
                    break;
            }

            me.components.helper.attr({
                width:  tr.cw,
                height: tr.ch
            });

        },

        onHandleMoveEnd: function(e) {
            var me = this,
                tr = this.trans,
                handle = e.publisher;

            var sx, sy, cx, cy, dx, dy;

            sx = tr.ow > 0 ? (tr.cw / tr.ow) : 1;
            sy = tr.oh > 0 ? (tr.ch / tr.oh) : 1;
            dx = tr.dx;
            dy = tr.dy;

            switch(handle.props.dir) {
                case 'ne':
                    cx = tr.ox;
                    cy = tr.oy + tr.oh;
                    break;
                case 'se':
                    cx = tr.ox;
                    cy = tr.oy;
                    break;
                case 'sw':
                    cx = tr.ox + tr.ow;
                    cy = tr.oy;
                    break;
                case 'nw':
                    cx = tr.ox + tr.ow;
                    cy = tr.oy + tr.oh;
                    break;
                case 'n':
                    cx = tr.ox + tr.ow / 2;
                    cy = tr.oy + tr.oh;
                    break;
                case 'e':
                    cx = tr.ox;
                    cy = tr.oy + tr.oh / 2;
                    break;
                case 's':
                    cx = tr.ox + tr.ow / 2;
                    cy = tr.oy;
                    break;
                case 'w':
                    cx = tr.ox + tr.ow;
                    cy = tr.oy + tr.oh / 2;
                    break;
            }

            var resize = me.vector.resize(sx, sy, cx, cy, dx, dy);
            
            me.redraw();
            me.fire('resize', resize);
        }
        
    });

}());