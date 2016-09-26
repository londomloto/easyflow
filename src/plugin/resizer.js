
(function(){
    
    Graph.plugin.Resizer = Graph.extend({
        
        props: {
            snap: [1, 1],
            suspended: true,
            handlePath: Graph.config.base + 'img/resize-control.png',
            handleSize: 17
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

        constructor: function(vector) {
            var me = this;
            
            me.vector = vector;
            me.vector.addClass('graph-resizable');

            me.props.handlePath = Graph.config.base + 'img/resize-control.png';
            me.props.handleSize = 17;

            me.cached = {
                vertices: null
            };

            me.vector.on({
                select: function() {
                    if ( ! me.components.holder) {
                        me.render();
                        me.resume();
                    } else {
                        me.resume();
                    }
                },
                deselect: function() {
                    if ( ! me.props.suspended) {
                        me.suspend();    
                    }
                },
                dragstart: function(e, v) {
                    me.suspend();
                },
                dragend: function(e, v) {
                    me.resume();
                    if  (v.props.selected) {
                        me.redraw();
                    } else {
                        me.redraw();
                        me.suspend();
                    }
                }
            });
        },

        render: function() {
            var me = this, 
                comp = me.components,
                canvas = me.vector.paper();

            if (comp.holder) {
                me.redraw();
                return;
            }
            
            comp.holder = canvas.group();
            comp.holder.addClass('graph-resizer').removeClass('graph-elem graph-elem-group');
            comp.holder.props.collectable = false;
            comp.holder.props.selectable = false;
            me.vector.parent().append(comp.holder);

            comp.helper = canvas.rect(0, 0, 0, 0);
            comp.helper.addClass('graph-resizer-helper').removeClass('graph-elem graph-elem-rect');
            comp.helper.props.collectable = false;
            comp.helper.props.selectable = false;
            comp.holder.append(comp.helper);

            me.handle = {};

            var snap = me.props.snap;

            var handle = {
                ne: {snap: snap},
                se: {snap: snap},
                sw: {snap: snap},
                nw: {snap: snap},
                 n: {snap: snap, axis: 'y'},
                 e: {snap: snap, axis: 'x'},
                 s: {snap: snap, axis: 'y'},
                 w: {snap: snap, axis: 'x'}
            };

            _.forOwn(handle, function(c, dir){
                (function(dir){

                    comp.handle[dir] = canvas.image(me.props.handlePath, 0, 0, me.props.handleSize, me.props.handleSize);
                    comp.handle[dir].props.collectable = false;
                    comp.handle[dir].props.selectable = false;
                    comp.handle[dir].props.dir = dir;

                    comp.handle[dir].removeClass('graph-elem graph-elem-image');
                    comp.handle[dir].addClass('graph-resizer-handle handle-' + dir);
                    comp.handle[dir].draggable(c).on('pointerdown', function(e){
                        e.stopImmediatePropagation();
                    });
                    
                    comp.handle[dir].on('dragstart', _.bind(me.onHandleMoveStart, me));
                    comp.handle[dir].on('dragmove', _.bind(me.onHandleMove, me));
                    comp.handle[dir].on('dragend', _.bind(me.onHandleMoveEnd, me));

                    comp.holder.append(comp.handle[dir]);
                }(dir));
            });

            me.redraw();
        },

        grid: function(dx, dy) {
            this.props.snap = [dx, dy];
        },

        vertices: function() {
            var me = this, 
                vertices = me.cached.vertices;

            var dt, m1, m2, b1, b2, ro, p1, p2, cx, cy;

            if (this.vector.dirty || ! vertices) {

                m1 = me.vector.matrix.clone();
                b1 = me.vector.bbox(true, false).data();
                p1 = me.vector.pathinfo().transform(m1);
                
                ro = m1.data().rotate;
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
            var me = this, comp = me.components, dirty, vx;

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
                this.components.holder.removeClass('visible');
            }
        },

        resume: function() {
            this.props.suspended = false;

            if (this.components.holder) {
                this.components.holder.addClass('visible');
            }
        },

        onHandleMoveStart: function(e, handle) {
            var me = this;

            _.forOwn(me.components.handle, function(a, b){
                if (a !== handle) {
                    a.hide();
                }
            });

            handle.show();
            handle.removeClass('dragging');
        },

        onHandleMove: function(e, handle) {
            var me = this;
            
            var tr = this.trans,
                dx = _.defaultTo(e.dx, 0),
                dy = _.defaultTo(e.dy, 0);

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
                width: tr.cw,
                height: tr.ch
            });

        },

        onHandleMoveEnd: function(e, handle) {
            var me = this,
                tr = this.trans;

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
            me.fire('resize', resize, me);          
        }

    });

}());