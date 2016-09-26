
(function(){

    Graph.plugin.Network = Graph.extend({

        props: {
            segments: 4
        },

        cached: {
            vertices: null
        },

        components: {
            block: null
        },

        ports: [],

        vector: null,
        canvas: null,
        rendered: false,
        dragging: false,

        constructor: function(vector, options) {
            var me = this, delay;
            
            _.extend(me.props, options || {});

            me.vector = vector;
            me.vector.addClass('graph-linkable');

            me.initComponent();

            me.vector.on({
                render: function() {
                    delay = _.delay(function(){
                        clearTimeout(delay);
                        me.render();
                    }, 0);
                }
            });

            if (me.vector.rendered) {
                delay = _.delay(function(){
                    clearTimeout(delay);
                    me.render();
                }, 0);
            }
        },

        initComponent: function() {
            var me = this, comp = me.components;

            comp.block = new Graph.svg.Group();
            comp.block.selectable(false);
            comp.block.collectable(false);
            comp.block.addClass('graph-network');
            comp.block.removeClass('graph-elem graph-elem-group');
            
            var vertices = me.vertices();
            
            _.forEach(vertices, function(v, i){
                var p = me.createPort(v);
                me.ports.push(p);
            });

        },

        createPort: function(point) {
            var matrix = this.vector.ctm(),
                x = matrix.x(point.props.x, point.props.y),
                y = matrix.y(point.props.x, point.props.y);

            var port = new Graph.util.Port(x, y);
            
            port.props.weight  = point.weight;
            port.props.segment = point.segment;
            port.network = this;
            port.vector = this.vector;
            
            return port;
        },

        render: function() {
            var me = this, 
                comp = me.components,
                vector = me.vector,
                canvas = me.vector.paper();

            if (me.rendered) {
                return;
            }

            me.rendered = true;
            me.canvas = canvas;

            comp.block.render(canvas);

            _.forEach(me.ports, function(p){
                p.render(); 
            });

            vector.elem.on({
                mouseenter: function(e) {
                    me.resume();
                },
                mouseleave: function(e) {
                    var t = Graph.$(e.relatedTarget),
                        v = t.hasClass('graph-util-port') || 
                            t.hasClass('graph-util-port-slot') || 
                            t.hasClass('graph-util-pointer') || 
                            t.hasClass('graph-util-connector-marker');

                    if ( ! v && ! me.vector.props.selected) {
                        me.suspend();
                    }

                    t = null;
                }
            });

            vector.on({
                dragstart: _.bind(me.onVectorDragStart, me),
                dragend: _.bind(me.onVectorDragEnd, me),
                select: _.bind(me.onVectorSelect, me),
                deselect: _.bind(me.onVectorDeselect, me),
                resize: _.bind(me.onVectorResize, me)
            });
            
            canvas.on('click', function(e){
                var t = Graph.$(e.target);
                if (t.hasClass('graph-linkable')) {
                    return;
                }
                me.suspend();
                t = null;
            });
        },

        vertices: function() {
            var me = this, 
                vector = me.vector, 
                matrix = me.vector.ctm(),
                vertices = [];

            var path, width, step, point;

            if (me.vector.dirty || _.isNull(me.cached.vertices)) {
                
                path = vector.pathinfo().transform(vector.matrix);

                switch(me.vector.type) {
                    case 'ellipse':
                    case 'circle':
                        width = path.length();
                        step = width / 8;

                        point = Graph.point(path.segments[1][1], path.segments[1][2]);
                        point.segment = 0;
                        point.weight = 0;    
                        vertices.push(point);

                        for (var i = step; i <= width - step; i += step) {
                            point = path.pointAt(i);
                            point.segment = 0;
                            point.weight = i / width;

                            vertices.push(point);
                        }

                        break;
                    default:
                        _.forEach(path.segments, function(s, i){
                            var c, l, q, p, n;
                            if (s[0] != 'M') {
                                c = Graph.curve([s]);
                                l = c.length();
                                q = l / me.props.segments;
                                for (n = q; n <= l; n +=q) {
                                    p = c.pointAt(c.t(n));
                                    p.segment = i;
                                    p.weight = n / l;
                                    vertices.push(p);
                                }
                            }
                        });
                }
                this.cached.vertices = vertices;
            }
            return this.cached.vertices;
        },

        component: function() {
            return this.components.block;
        },

        suspend: function() {
            if (this.components.block) {
                this.components.block.removeClass('visible');    
            }
        },

        resume: function() {
            if (this.dragging) {
                return;
            }

            if (this.vector.props.selected) {
                return;
            }

            if (this.components.block) {
                this.components.block.addClass('visible');        
            }
        },

        port: function(index) {
            return this.ports[index];
        },

        onVectorDragStart: function() {
            this.dragging = true;
            this.suspend();
        },

        onVectorDragEnd: function(e) {
            var me = this,
                ro = this.vector.props.rotate;

            var rad, sin, cos, dx, dy;

            if (ro) {
                rad = Graph.rad(-ro),
                sin = Math.sin(rad),
                cos = Math.cos(rad);
                dx = e.dx *  cos + e.dy * sin;
                dy = e.dx * -sin + e.dy * cos;
            } else {
                dx = e.dx;
                dy = e.dy;
            }

            _.forEach(me.ports, function(p){
                p.translate(dx, dy);
                p.refreshLinks();
            });

            me.dragging = false;
            me.resume();
        },

        onVectorSelect: function() {
            this.suspend();
        },

        onVectorDeselect: function() {
            // this.suspend();
        },

        onVectorResize: function(e) {
            var me = this,
                path = me.vector.pathinfo().transform(me.vector.ctm());
                
            var current, distance, segment, curve, width, point, width, path;

            switch(me.vector.type) {
                case 'ellipse':
                case 'circle':
                    width = path.length();

                    _.forEach(me.ports, function(port){
                        distance = port.props.weight * width;
                        point = path.pointAt(distance);
                        
                        if (point) {
                            port.relocate(point.props.x, point.props.y);
                            point = null;
                        }
                    });
                    break;
                default:
                    _.forEach(me.ports, function(port){
                        segment = path.segments[port.props.segment];
                        if (segment) {
                            if (port.props.segment !== current || ! curve) {
                                curve = Graph.curve([segment]);
                                width = curve.length();
                            }

                            distance = width * port.props.weight;
                            point = curve.pointAt(distance, curve.t(distance));
                            
                            if (point) {
                                port.relocate(point.props.x, point.props.y);
                                point = null;
                            }
                        }

                        current = port.props.segment;
                    });
            }

            curve = null;
        }

    });

}());