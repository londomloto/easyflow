
(function(){

    Graph.svg.Ellipse = Graph.svg.Vector.extend({
        attrs: {
            // 'stroke': '#696B8A',
            // 'stroke-width': 1,
            // 'fill': '#ffffff',
            // 'style': '',
            'class': 'graph-elem graph-elem-ellipse'
        },

        constructor: function(cx, cy, rx, ry) {
            this.$super('ellipse', {
                cx: cx,
                cy: cy,
                rx: rx,
                ry: ry
            });
        },

        pathinfo: function() {
            var a = this.attrs;

            return Graph.path([
                ['M', a.cx, a.cy],
                ['m', 0, -a.ry],
                ['a', a.rx, a.ry, 0, 1, 1, 0,  2 * a.ry],
                ['a', a.rx, a.ry, 0, 1, 1, 0, -2 * a.ry],
                ['z']
            ]);
        },
        
        resize: function(sx, sy, cx, cy, dx, dy) {
            var matrix = this.matrix.clone().scale(sx, sy, cx, cy),
                rotate = this.props.rotate;

            var mx = matrix.x(this.attrs.cx, this.attrs.cy),
                my = matrix.y(this.attrs.cx, this.attrs.cy),
                rx = this.attrs.rx * sx,
                ry = this.attrs.ry * sy;

            var gx, gy;

            this.reset();

            this.attr({
                cx: mx,
                cy: my,
                rx: rx,
                ry: ry
            });

            if (rotate) {
                this.rotate(rotate, mx, my).apply();    
            }

            var bb = this.bbox(false, false).data();

            gx = mx - rx - dx;
            gy = my - ry - dy;

            gx = bb.x;
            gy = bb.y;

            return  {
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
                    cx: mx,
                    cy: my
                },
                magnify: {
                    cx: gx,
                    cy: gy
                }
            };
        }
    });

}());