
(function(){

    Graph.util.Collector = Graph.extend({
        
        props: {
            x: 0,
            y: 0,
            x2: 0,
            y2: 0,
            dir: null,
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            offset: [0, 0],
            suspended: true
        },

        canvas: null,
        collection: [],

        components: {
            rubber: null
        },

        events: {
            beforedrag: true,
            afterdrag: true
        },

        constructor: function() {
            this.components.rubber = Graph.$('<div class="graph-rubberband">');
        },

        setup: function() {
            var me = this, canvas = me.canvas;

            if (me.plugin) {
                return;
            }
            // me.container.on('scroll', function(){
            //     var top = me.container.scrollTop(),
            //         left = me.container.scrollLeft(),
            //         dy = top - me.props.top,
            //         dx = left - me.props.left;

            //     me.props.height += dy;
            //     me.props.width += dx;

            //     me.props.top = top;
            //     me.props.left = left;
            // });

            me.plugin = interact(canvas.node()).draggable({
                manualStart: true,

                onstart: function(e) {
                    me.reset();
                    me.resize(0, 0);

                    var offset = canvas.container.offset(),   
                        x = e.pageX - offset.left,
                        y = e.pageY - offset.top;

                    me.translate(x, y);
                    me.props.offset = [x, y];
                },
                
                onmove: function(e) {
                    var dw = 0,
                        dh = 0,
                        dx = 0,
                        dy = 0;

                    if ( ! me.props.dir) {
                        switch(true) {
                            case (e.dx > 0 && e.dy > 0):
                                me.props.dir = 'nw';
                                break;
                            case (e.dx < 0 && e.dy < 0):
                                me.props.dir = 'se';
                                break;
                            case (e.dx < 0 && e.dy > 0):
                                me.props.dir = 'ne';
                                break;
                            case (e.dx > 0 && e.dy < 0):
                                me.props.dir = 'sw';
                                break;
                        }
                    } else {
                        switch(me.props.dir) {
                            case 'nw':
                                dw = e.dx;
                                dh = e.dy;
                                dx = 0;
                                dy = 0;
                                break;
                            case 'ne':
                                dw = -e.dx;
                                dh =  e.dy;
                                dx =  e.dx;
                                dy =  0;
                                break;
                            case 'se':
                                dw = -e.dx;
                                dh = -e.dy;
                                dx =  e.dx;
                                dy =  e.dy;
                                break;
                            case 'sw':
                                dw =  e.dx;
                                dh = -e.dy;
                                dx =  0;
                                dy =  e.dy;
                                break;
                        }
                        
                        me.props.width  += dw;
                        me.props.height += dh;

                        if (me.props.width >= 0 && me.props.height >= 0) {
                            me.translate(dx, dy); 
                            me.resize(me.props.width, me.props.height);
                        } else {
                            me.props.width  -= dw;
                            me.props.height -= dh;
                        }
                        
                    }
                },

                onend: function() {
                    var bbox

                    me.props.x2 = me.props.x + me.props.width;
                    me.props.y2 = me.props.y + me.props.height;

                    bbox = me.bbox();
                    
                    canvas.cascade(function(c){
                        if (c !== canvas && c.selectable() && ! c.isGroup()) {
                            if (bbox.contain(c)) {
                                me.collect(c);
                            }
                        }
                    });

                    me.resize(0, 0);
                    me.suspend();
                }
            })
            .on('down', function(e){
                var single = ! (e.ctrlKey || e.shiftKey),
                    vector = Graph.get(e.target);

                if ( ! vector.selectable()) {
                    single && me.clearCollection();    
                    return;
                }
            })
            .on('tap', function(e){
                var vector = Graph.get(e.target),
                    single = ! (e.ctrlKey || e.shiftKey);

                if (vector.selectable()) {
                    single && me.clearCollection(vector);
                    me.collect(vector);
                    return;
                }

            }, true)
            .on('move', function(e){
                var action = e.interaction,
                    target = e.target;
                if (action.pointerIsDown && action.interacting() === false && target === canvas.node()) {
                    if (me.props.suspended) {
                        me.resume();
                    }
                    action.start({name: 'drag'}, e.interactable, me.components.rubber.node());
                }
            });

            me.plugin.styleCursor(false);
        },

        render: function(canvas) {
            var me = this;

            me.canvas = canvas;
            me.canvas.container.append(me.components.rubber);

            me.canvas.on({
                render: function() {
                    me.setup();
                }
            });
            
            if (me.canvas.rendered) {
                me.setup();
            }
        },

        bbox: function() {
            var props = this.props;
            
            return new Graph.lang.BBox({
                x: props.x,
                y: props.y,
                x2: props.x2,
                y2: props.y2,
                width: props.width,
                height: props.height
            });
        },

        collect: function(vector, silent) {
            var me = this, offset;

            vector.$collector = this;
            vector.select();

            silent = _.defaultTo(silent, false);
            offset = _.indexOf(this.collection, vector);

            if (offset === -1) {
                this.collection.push(vector);
                if ( ! silent) {
                    vector.fire('collect', this, vector);
                }
            }
        },

        decollect: function(vector) {
            var offset;
            
            vector.$collector = null;
            vector.deselect();

            offset = _.indexOf(this.collection, vector);

            if (offset > -1) {
                this.collection.splice(offset, 1);
                vector.fire('decollect', this, vector);
            }
        },

        clearCollection: function(vector) {
            var me = this;
            me.canvas.cascade(function(c){
                if (c !== me.canvas && c.props.selected) {
                    me.decollect(c);
                }
            });
        },

        resume: function() {
            this.components.rubber.addClass('visible');
            this.props.suspended = false;
        },

        suspend: function() {
            this.components.rubber.removeClass('visible');
            this.props.suspended = true;
        },

        reset: function() {
            var top = this.canvas.container.scrollTop(),
                left = this.canvas.container.scrollLeft();

            this.props.x = 0;
            this.props.y = 0;
            this.props.x2 = this.props.x,
            this.props.y2 = this.props.y,
            this.props.top = top;
            this.props.left = left;
            this.props.dir = null;
            this.props.width = 0;
            this.props.height = 0;
            this.props.offset = [0, 0];
        },

        translate: function(dx, dy) {
            this.props.x += dx;
            this.props.y += dy;
            
            this.components.rubber.css({
                transform: 'translate(' + this.props.x + 'px,' + this.props.y + 'px)'
            });
        },

        resize: function(width, height) {
            this.components.rubber.width(width).height(height);
        },

        syncDragStart: function(origin, e) {
            var me = this;

            _.forEach(me.collection, function(v){
                if (v.dragger && v.dragger.props.enabled && v !== origin) {
                    (function(){
                        var mat = v.matrix.data(),
                            sin = mat.sin,
                            cos = mat.cos;

                        if (v.resizer) {
                            v.resizer.suspend();
                        }

                        if (v.dragger.components.helper) {
                            v.dragger.resume();
                        }

                        v.syncdrag = {
                            sin: sin,
                            cos: cos,
                            tdx: 0,
                            tdy: 0
                        };

                        v.addClass('dragging');
                        
                        v.fire('dragstart', {
                            dx: e.dx *  cos + e.dy * sin,
                            dy: e.dx * -sin + e.dy * cos
                        }, v);

                    }());
                }
            });

            me.fire('beforedrag');
        },

        syncDragMove: function(origin, e) {
            var me = this, dx, dy;

            _.forEach(me.collection, function(v){
                if (v.dragger && v.dragger.props.enabled && v !== origin) {
                    (function(v, e){
                        var dx = e.ox *  v.syncdrag.cos + e.oy * v.syncdrag.sin,
                            dy = e.ox * -v.syncdrag.sin + e.oy * v.syncdrag.cos;

                        if (v.dragger.components.helper) {
                            v.dragger.components.helper.translate(e.ox, e.oy).apply();
                        } else {
                            v.translate(dx, dy).apply();
                        }

                        v.syncdrag.tdx += dx;
                        v.syncdrag.tdy += dy;

                        v.fire('dragmove', {
                            dx: dx,
                            dy: dy
                        }, v);

                    }(v, e));    
                }
            });

        },

        syncDragEnd: function(origin, e) {
            var me = this;

            _.forEach(me.collection, function(v){
                if (v.dragger && v.dragger.props.enabled && v !== origin) {
                    (function(v, e){
                        
                        if (v.dragger.components.helper) {
                            v.translate(v.syncdrag.tdx, v.syncdrag.tdy).apply();
                            v.dragger.suspend();
                        }

                        if (v.resizer) {
                            v.resizer.resume();
                            v.resizer.redraw();
                        }

                        v.fire('dragend', {
                            dx: v.syncdrag.tdx,
                            dy: v.syncdrag.tdy
                        }, v);
                        
                        v.removeClass('dragging');

                        delete v.syncdrag;
                        v.dirty = true;

                    }(v, e));
                }
            });

            e.origin = origin;
            me.fire('afterdrag', e, me);
        }
    });

}());