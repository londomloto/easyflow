
(function(){

    Graph.svg.Polygon = Graph.svg.Vector.extend({
        
        attrs: {
            // 'stroke': '#696B8A',
            // 'stroke-width': 1,
            // 'fill': '#ffffff',
            'style': '',
            'class': 'graph-elem graph-elem-polygon'
        },

        constructor: function(points) {
            this.$super('polygon', {
                points: points
            });

            var me = this;

        },

        draggable: function(config) {
            this.$super(config);
        },

        pathinfo: function() {
            var command = Graph.polygon2path(this.attrs.points);
            return Graph.path(command);
        },
        
        resize: function(sx, sy, cx, cy, dx, dy) {
            var matrix = this.matrix.clone(),
                origin = this.matrix.clone(),
                rotate = this.props.rotate,
                ps = this.pathinfo().segments,
                dt = [],
                rx = ps[0][1],
                ry = ps[0][2];

            if (rotate) {
                origin.rotate(-rotate, ps[0][1], ps[0][2]); 
                rx = origin.x(ps[0][1], ps[0][2]);
                ry = origin.y(ps[0][1], ps[0][2]);
            }

            origin.scale(sx, sy, cx, cy);
            matrix.scale(sx, sy, cx, cy);

            _.forEach(ps, function(seg){
                var ox, oy, x, y;
                if (seg[0] != 'Z') {
                    ox = seg[seg.length - 2];
                    oy = seg[seg.length - 1];
                    x = origin.x(ox, oy);
                    y = origin.y(ox, oy);
                    dt.push(x + ',' + y);
                }
            });

            dt = _.join(dt, ' ');

            this.reset();
            this.attr('points', dt);

            if (rotate) {
                this.rotate(rotate, rx, ry).apply();
            }
            
            return {
                matrix: matrix,
                translate: {
                    dx: dx,
                    dy: dy
                },
                scale: {
                    sx: sx,
                    sy: sy,
                    cx: cx,
                    cy: cy
                },
                rotate: {
                    deg: rotate,
                    cx: rx,
                    cy: ry
                }
            };
        }
    });

}());