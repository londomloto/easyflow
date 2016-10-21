
(function(){

    Graph.link.Orthogonal = Graph.extend(Graph.link.Link, {
        
        update: function(command, silent) {
            var convex, smooth, radius, routes, maxlen, segments;
            
            silent = _.defaultTo(silent, false);
            
            convex = this.cached.convex;
            smooth = this.props.smooth;
            
            if (convex) {
                
                routes = this.router.waypoints().slice();
                maxlen = routes.length - 1;

                segments = [];
                
                _.forEach(routes, function(curr, i){
                    var prev = curr,
                        next = routes[i + 1];
                        
                    var item;
                    
                    if (i === 0) {
                        item = ['M', curr.x, curr.y];
                    } else {
                        item = ['L', curr.x, curr.y];
                    }
                    
                    segments.push(item);

                    if (convex[i]) {
                        _.forEach(convex[i], function(c){
                            var conseg = Graph.util.convexSegment(c, prev, next);
                            if (conseg) {
                                segments.push(conseg[0], conseg[1]);
                            }
                        });
                    }
                });

                command = Graph.util.segments2path(segments);
            }
            
            if (smooth) {
                radius = this.props.smootness || 6;
                segments = segments || Graph.util.path2segments(command).slice();
                
                var item, prev, next, curr, i;
                var bend;
                
                for (i = 0; i < segments.length; i++) {
                    item = segments[i];
                    next = segments[i + 1];
                    
                    bend = !!(item[0] == 'L' && next && next[0] != 'Q');
                    
                    if (bend) {
                        curr = {
                            x: item[item.length - 2],
                            y: item[item.length - 1]
                        };
                        
                        prev = segments[i - 1];
                        
                        if (prev && next) {
                            var ss = Graph.util.smoothSegment(
                                curr, 
                                { x: prev[prev.length - 2], y: prev[prev.length - 1] },
                                { x: next[next.length - 2], y: next[next.length - 1] },
                                radius
                            );
                            
                            if (ss) {
                                segments.splice(i, 1, ss[0], ss[1]);
                                i++;
                            }
                        }
                    }
                }
                command = Graph.util.segments2path(segments);
                // var p = Graph.path(command);
                // this.router.source().paper().path(p).style('stroke', 'red');
                
            }

            this.component('coat').attr('d', command).dirty(true);
            this.component('path').attr('d', command);
            
            this.invalidate();
            
            if ( ! silent) {
                
                this.redraw();
                
                this.fire('update');
                Graph.topic.publish('link/update');
            }
        },
        
        renderControl: function() {
            var me = this, editor = me.component('editor');

            if (me.cached.controls) {
                _.forEach(me.cached.controls, function(c){
                    c = Graph.registry.vector.get(c);
                    c.remove();
                });
                me.cached.controls = null;
            }

            var points = this.cached.bendpoints,
                linkid = me.guid(),
                maxlen = points.length - 1,
                controls = [];

            _.forEach(points, function(dot, i){
                var control, cursor, align, axis, drag;
                
                control = (new Graph.svg.Image(
                    Graph.config.base + 'img/resize-control.png',
                    dot.x - 17 / 2,
                    dot.y - 17 / 2,
                    17,
                    17
                ));
                
                control.selectable(false);
                control.removeClass(Graph.string.CLS_VECTOR_IMAGE);
                control.elem.group('graph-link');
                control.elem.data(Graph.string.ID_LINK, linkid);
                
                drag = {};
                axis = null;
                cursor = 'default';
                
                if (i === 0) {
                    control.addClass(Graph.string.CLS_LINK_TAIL);
                    control.elem.data('pole', 'tail');
                } else if (i === maxlen) {
                    control.addClass(Graph.string.CLS_LINK_HEAD);
                    control.elem.data('pole', 'head');
                } else {
                    align  = Graph.util.pointAlign(dot.start, dot.end);
                    axis   = align == 'v' ? 'y' : 'x';
                    cursor = axis  == 'x' ? 'ew-resize' : 'ns-resize';
                    
                    drag = {axis: axis};
                }
                
                var context = {
                    
                    trans: (i === 0 || i === maxlen) ? 'CONNECT' : 'BENDING',
                    index: dot.index,
                    axis: axis,
                    cursor: cursor,
                    point: {
                        x: dot.x,
                        y: dot.y
                    },
                    
                    ranges: {
                        start: dot.range[0],
                        end:   dot.range[1]
                    },
                    
                    event: {
                        x: dot.x,
                        y: dot.y
                    },
                    
                    snap: {
                        hor: [],
                        ver: []
                    },
                    
                    delta: {
                        x: 0,
                        y: 0
                    }
                };
                
                
                control.draggable(drag);
                control.cursor(cursor);
                
                control.on('dragstart', _.bind(me.onControlStart, me, _, context, control));
                control.on('dragmove',  _.bind(me.onControlMove,  me, _, context));
                control.on('dragend',   _.bind(me.onControlEnd,   me, _, context, control));
 
                control.render(editor);
                controls.push(control.guid());
            });
            
            me.cached.controls = controls;
            controls = null;
        },

        onControlStart: function(e, context, control) {
            this.component('coat').cursor(context.cursor);
            this.router.initTrans(context);
            
            // snapping
            var snaphor = context.snap.hor,
                snapver = context.snap.ver;
                
            control.draggable().snap([
                function(x, y) {
                    var sx = Graph.util.snapValue(x, snapver),
                        sy = Graph.util.snapValue(y, snaphor);
                    
                    return {
                        x: sx,
                        y: sy,
                        range: 10
                    };
                }
            ]);
            
            _.forEach(this.cached.controls, function(id){
                var c = Graph.registry.vector.get(id);
                if (c && c !== control) {
                    c.hide();
                }
            });
            
            control.show();
            this.removeConvex();
        },

        onControlMove: function(e, context) {
            var me = this;
            
            context.delta.x += e.dx;
            context.delta.y += e.dy;
            
            var x1, y1, x2, y2, dx, dy;
            
            x1 = context.event.x;
            y1 = context.event.y;
            
            if (context.trans == 'BENDING') {
                me.router.bending(context, function(result){
                    me.update(result.command, true);
                });
            } else {
                me.router.connecting(context, function(result){
                    me.update(result.command, true);
                });
            }

            x2 = context.event.x;
            y2 = context.event.y;
            
            dx = x2 - x1;
            dy = y2 - y1;
            
            // update dragger
            e.originalData.dx = dx;
            e.originalData.dy = dy;
        },

        onControlEnd: function(e, context, control) {
            this.component('coat').cursor('pointer');
            this.router.stopTrans(context);
            this.update(this.router.command());
            this.invalidate();
            this.resumeControl();
        }

    });
    
}());