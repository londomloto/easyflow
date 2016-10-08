
(function(){

    Graph.svg.Path = Graph.extend(Graph.svg.Vector, {

        attrs: {
            // 'stroke': '#696B8A',
            // 'stroke-width': 1,
            // 'fill': 'none',
            'style': '',
            'class': Graph.string.CLS_VECTOR_PATH
        },

        constructor: function(d) {
            var s;

            d = _.defaultTo(d, 'M 0 0');
            s = _.isArray(d) ? Graph.seg2cmd(d) : d;
            
            // this.$super('path', {
            //     d: Graph.path(s).absolute().toString()
            // });

            this.superclass.prototype.constructor.call(this, 'path', {
                d: Graph.path(s).absolute().toString()
            });

            this.cached.segments = null;
        },

        pathinfo: function() {
            return new Graph.lang.Path(this.attrs.d);
        },

        segments: function() {
            if ( ! this.cached.segments) {
                this.cached.segments = this.pathinfo().segments;
            }
            return this.cached.segments;
        },

        intersection: function(path) {
            return this.pathinfo().intersection(path.pathinfo());
        },

        intersectnum: function(path) {
            return this.pathinfo().intersectnum(path.pathinfo());
        },

        angle: function() {
            var segments = _.clone(this.segments()),
                max = segments.length - 1;

            if (segments[max][0] == 'Z') {
                max--;
                segments.pop();
            }

            if (segments.length === 1) {
                max++;
                segments.push(['L', segments[0][1], segments[0][2]]);
            }

            var dx = segments[max][1] - segments[max - 1][1],
                dy = segments[max][2] - segments[max - 1][2];

            return (180 + Math.atan2(-dy, -dx) * 180 / Math.PI + 360) % 360;
        },

        slice: function(from, to) {
            return this.pathinfo().slice(from, to);
        },

        pointAt: function(length) {
            return this.pathinfo().pointAt(length);
        },

        length: function() {
            return this.pathinfo().length();
        },

        addVertext: function(vertext) {
            var command = this.pathinfo().addVertext(vertext).toString();
            this.attr('d', command);
            return this;
        },
        
        resize: function(sx, sy, cx, cy, dx, dy) {
            var ms = this.graph.matrix.clone(),
                ro = this.graph.matrix.data().rotate,
                rd = Graph.rad(ro),
                si = Math.sin(rd),
                co = Math.cos(rd),
                pa = this.pathinfo(),
                ps = pa.segments,
                rx = ps[0][1],
                ry = ps[0][2];

            if (ro) {
                ms.rotate(-ro, rx, ry);    
            }
            
            rx = ms.x(ps[0][1], ps[0][2]);
            ry = ms.y(ps[0][1], ps[0][2]);

            ms.scale(sx, sy, cx, cy);

            _.forEach(ps, function(seg){
                var ox, oy, nx, ny;
                if (seg[0] != 'Z') {
                    ox = seg[seg.length - 2];
                    oy = seg[seg.length - 1];

                    nx = ms.x(ox, oy);
                    ny = ms.y(ox, oy);
                    
                    seg[seg.length - 2] = nx;
                    seg[seg.length - 1] = ny;
                }
            });

            this.reset();
            
            this.attr('d', _.toString(pa));

            if (ro) {
                this.rotate(ro, rx, ry).apply(true);    
            }

            return {
                matrix: ms,
                x: rx,
                y: ry
            };
        },

        toString: function() {
            return 'Graph.svg.Path';
        }
    });

    ///////// STATIC /////////
    
    Graph.svg.Path.toString = function() {
        return 'function(d)';
    };

}());