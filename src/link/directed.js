
(function(){

    Graph.link.Directed = Graph.extend(Graph.link.Link, {
        
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
                var x = dot.x, y = dot.y;
                
                var control = (new Graph.svg.Image(
                    Graph.config.base + 'img/resize-control.png',
                    x - 17 / 2,
                    y - 17 / 2,
                    17,
                    17
                ));
                
                /*
                control = (new Graph.svg.Circle(x, y, 5));
                control.removeClass(Graph.string.CLS_VECTOR_CIRCLE);
                control.addClass('graph-link-bend');
                */
                
                control.selectable(false);
                control.elem.group('graph-link');
                
                var trans = {
                    
                    space: dot.space,
                    
                    segment: {
                        x: dot.x,
                        y: dot.y
                    },
                    
                    event: {
                        x: dot.x,
                        y: dot.y
                    },
                    
                    range: {
                        start: dot.from,
                        end: dot.to
                    },
                    
                    delta: {
                        x: 0,
                        y: 0
                    },
                    
                    snap: {
                        hor: [],
                        ver: []
                    }
                };
                
                control.draggable();
                control.cursor('default');
                
                control.on('dragstart', _.bind(me.onControlStart, me, _, trans, control));
                control.on('dragmove',  _.bind(me.onControlMove,  me, _, trans, control));
                control.on('dragend',   _.bind(me.onControlEnd,   me, _, trans, control));
                
                control.render(editor);
                
                controls.push(control.guid());
            });
            
            me.cached.controls = controls;
            controls = null;
        },
        
        onControlStart: function(e, trans, control) {
            this.router.initBending(trans);
            
            var snaphor = trans.snap.hor,
                snapver = trans.snap.ver;
            
            control.draggable().snap([
                function(x, y){
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
        
        onControlMove: function(e, trans, control) {
            var me = this;
            
            trans.delta.x += e.dx;
            trans.delta.y += e.dy;
            
            var x1, y1, x2, y2;
            
            x1 = trans.event.x,
            y1 = trans.event.y;
                
            me.router.bending(trans, function(result){
                me.update(result.command);
            });
            
            x2 = trans.event.x,
            y2 = trans.event.y;
            
            // update dragger
            e.originalData.dx = (x2 - x1);
            e.originalData.dy = (y2 - y1);
        },
        
        onControlEnd: function(e, trans, control) {
            this.router.stopBending(trans);
            this.update(this.router.command());
            this.invalidate();
            this.resumeControl();
        }

    });

}());