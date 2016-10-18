
(function(){

    Graph.link.Orthogonal = Graph.extend(Graph.link.Link, {
        
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
                controls = [];

            _.forEach(points, function(dot){
                var control, cursor, align, axis, x, y;

                x = dot.x;
                y = dot.y;

                control = (new Graph.svg.Image(
                    Graph.config.base + 'img/resize-control.png',
                    x - 17 / 2,
                    y - 17 / 2,
                    17,
                    17
                ));

                control.selectable(false);
                control.elem.group('graph-link');

                align  = Graph.util.pointAlign(dot.start, dot.end);
                axis   = align == 'v' ? 'y' : 'x';
                cursor = axis  == 'x' ? 'ew-resize' : 'ns-resize';

                control.draggable({
                    axis: axis
                });
                    

                var trans = {
                    axis: axis,
                    
                    cursor: cursor,

                    ranges: {
                        start: dot.from,
                        end: dot.to
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

                control.cursor(cursor);

                control.on('dragstart', _.bind(me.onControlStart, me, _, trans, control));
                control.on('dragmove',  _.bind(me.onControlMove,  me, _, trans));
                control.on('dragend',   _.bind(me.onControlEnd,   me, _, trans, control));
 
                control.render(editor);
                controls.push(control.guid());
            });
            
            me.cached.controls = controls;
            controls = null;
        },

        onControlStart: function(e, trans, control) {
            this.component('coat').cursor(trans.cursor);
            this.router.initBending(trans);
            
            // snapping
            var snaphor = trans.snap.hor,
                snapver = trans.snap.ver;
                
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
        },

        onControlMove: function(e, trans) {
            var me = this;
            
            trans.delta.x += e.dx;
            trans.delta.y += e.dy;
            
            var x1, y1, x2, y2, dx, dy;
            
            x1 = trans.event.x;
            y1 = trans.event.y;
            
            me.router.bending(trans, function(result){
                me.update(result.command);
            });
            
            x2 = trans.event.x;
            y2 = trans.event.y;
            
            dx = x2 - x1;
            dy = y2 - y1;
            
            // update dragger
            e.originalData.dx = dx;
            e.originalData.dy = dy;
        },

        onControlEnd: function(e, trans, control) {
            this.component('coat').cursor('pointer');
            this.router.stopBending();
            
            this.update(this.router.command());
            
            this.invalidate();
            this.resumeControl();
            
        }

    });

}());