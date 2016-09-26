
(function(){

    Graph.svg.Rect = Graph.svg.Vector.extend({

        attrs: {
            // 'stroke': '#333333',
            // 'stroke-width': 1,
            // 'fill': '#ffffff',
            'style': '',
            // 'shape-rendering': 'crispEdges',
            'class': 'graph-elem graph-elem-rect'
        },

        constructor: function(x, y, width, height, r) {
            var me = this;
            r = _.defaultTo(r, 0);

            me.$super('rect', {
                x: _.defaultTo(x, 0),
                y: _.defaultTo(y, 0),
                rx: r,
                ry: r,
                width: _.defaultTo(width, 0),
                height: _.defaultTo(height, 0)
            });
            
            me.origpath = me.pathinfo();
        },

        attr: function() {
            var args = _.toArray(arguments);

            this.$super.apply(this, args);
            this.attrs.r = this.attrs.rx;

            return this;
        },

        pathinfo: function() {
            var a = this.attrs;

            if (a.r) {
                return Graph.path([
                    ['M', a.x + a.r, a.y], 
                    ['l', a.width - a.r * 2, 0], 
                    ['a', a.r, a.r, 0, 0, 1, a.r, a.r], 
                    ['l', 0, a.height - a.r * 2], 
                    ['a', a.r, a.r, 0, 0, 1, -a.r, a.r], 
                    ['l', a.r * 2 - a.width, 0], 
                    ['a', a.r, a.r, 0, 0, 1, -a.r, -a.r], 
                    ['l', 0, a.r * 2 - a.height], 
                    ['a', a.r, a.r, 0, 0, 1, a.r, -a.r], 
                    ['z']
                ]);
            } else {
                return Graph.path([
                    ['M', a.x, a.y], 
                    ['l', a.width, 0], 
                    ['l', 0, a.height], 
                    ['l', -a.width, 0], 
                    ['z']
                ]);
            }
        },
        
        resize: function(sx, sy, cx, cy, dx, dy) {
            var matrix = this.matrix.clone(),
                rotate = this.props.rotate;

            var x, y, w, h;

            matrix.scale(sx, sy, cx, cy);

            this.reset();

            x = matrix.x(this.attrs.x, this.attrs.y);
            y = matrix.y(this.attrs.x, this.attrs.y);
            w = this.attrs.width  * sx;
            h = this.attrs.height * sy;

            this.attr({
                x: x,
                y: y,
                width: w,
                height: h
            });

            if (rotate) {
                this.rotate(rotate, x, y).apply();    
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
                    cx: x,
                    cy: y
                }
            };
        }
    });

}());