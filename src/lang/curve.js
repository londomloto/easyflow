
(function(){
    /**
     * Legendre Gauss (Quadratic Curve)
     * https://pomax.github.io/bezierinfo/legendre-gauss.html
     */
    var LG_N = 12,

        // abscissae
        LG_T = [
           -0.1252,
            0.1252,
           -0.3678,
            0.3678,
           -0.5873,
            0.5873,
           -0.7699,
            0.7699,
           -0.9041,
            0.9041,
           -0.9816,
            0.9816
        ],
        // weights
        LG_C = [
            0.2491,
            0.2491,
            0.2335,
            0.2335,
            0.2032,
            0.2032,
            0.1601,
            0.1601,
            0.1069,
            0.1069,
            0.0472,
            0.0472
        ];

    Graph.lang.Curve = Graph.extend({
        segments: [],
        
        constructor: function(command) {
            this.segments = _.isString(command) ? Graph.util.path2segments(command) : _.cloneDeep(command);
            
            if (this.segments[0][0] != 'M') {
                this.segments.unshift(
                    ['M', this.segments[0][1], this.segments[0][2]]
                );
            }

            if (this.segments.length === 1 && this.segments[0][0] === 'M') {
                var x = this.segments[0][1],
                    y = this.segments[0][2];
                this.segments.push(['C', x, y, x, y, x, y]);
            }
        },

        x: function() {
            return this.segments[1][5];
        },

        y: function() {
            return this.segments[1][6];
        },

        length: function(t) {
            
            t = _.defaultTo(t, 1);
            t = t > 1 ? 1 : t < 0 ? 0 : t;

            var h = t / 2, 
                s = this.segments,
                x1 = s[0][1],
                y1 = s[0][2],
                x2 = s[1][1],
                y2 = s[1][2],
                x3 = s[1][3],
                y3 = s[1][4],
                x4 = s[1][5],
                y4 = s[1][6],
                sum = 0;

            for (var i = 0; i < LG_N; i++) {
                var ct = h * LG_T[i] + h,

                    xb = polynom(ct, x1, x2, x3, x4),
                    yb = polynom(ct, y1, y2, y3, y4),
                    co = xb * xb + yb * yb;

                sum += LG_C[i] * Math.sqrt(co);
            }

            return h * sum;
        },

        t: function(length) {
            if (length < 0 || this.length() < length) {
                return;
            }

            var t = 1,
                step = t / 2,
                t2 = t - step,
                l,
                e = .01;

            l = this.length(t2);

            while (Math.abs(l - length) > e) {
                step /= 2;
                t2 += (l < length ? 1 : -1) * step;
                l = this.length(t2);
            }

            return t2;
        },

        pointAt: function(t, dots) {
            var arr = this.segments,
                p1x = arr[0][1],
                p1y = arr[0][2],
                c1x = arr[1][1],
                c1y = arr[1][2],
                c2x = arr[1][3],
                c2y = arr[1][4],
                p2x = arr[1][5],
                p2y = arr[1][6];

            var t1 = 1 - t,
                t13 = Math.pow(t1, 3),
                t12 = Math.pow(t1, 2),
                t2 = t * t,
                t3 = t2 * t,
                x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
                y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
                mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
                my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
                nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
                ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
                ax = t1 * p1x + t * c1x,
                ay = t1 * p1y + t * c1y,
                cx = t1 * c2x + t * p2x,
                cy = t1 * c2y + t * p2y,
                alpha = (90 - Math.atan2(mx - nx, my - ny) * 180 / Math.PI);
            
            // (mx > nx || my < ny) && (alpha += 180);

            // if (isNaN(x) || isNaN(y)) {
            //     return null;
            // }

            var info = {
                m: {x: mx, y: my},
                n: {x: nx, y: ny},
                start: {x: ax, y: ay},
                end:   {x: cx, y: cy},
                alpha: alpha
            };

            if (dots) {
                return _.extend({x: x, y: y}, info);
            } else {
                var point = Graph.point(x, y);
                _.extend(point, info);
                return point;
            }
        },

        intersection: function(curve, dots) {
            var result = intersection(this, curve, false);
            return dots ? result : _.map(result, function(d){
                return Graph.point(d.x, d.y);
            });
        },

        intersectnum: function(curve) {
            return intersection(this, curve, true);
        },

        bbox: function() {
            var args = [this.segments[0][1], this.segments[0][2]].concat(this.segments[1].slice(1)),
                bbox = Graph.util.curvebox.apply(null, args);
            return Graph.bbox({
                x: bbox.min.x,
                y: bbox.min.y,
                x2: bbox.max.x,
                y2: bbox.max.y,
                width: bbox.max.x - bbox.min.x,
                height: bbox.max.y - bbox.min.y
            });
        },

        clone: function() {
            var segments = _.cloneDeep(this.segments);
            return new Graph.lang.Curve(segments);
        },

        toString: function() {
            return Graph.util.segments2path(this.segments);
        }
    });

    ///////// HELPER /////////
            
    function polynom(t, n1, n2, n3, n4) {
        var t1 = -3 * n1 + 9 * n2 -  9 * n3 + 3 * n4,
            t2 =  t * t1 + 6 * n1 - 12 * n2 + 6 * n3;
        return t * t2 - 3 * n1 + 3 * n2;
    }

    function intersection(curve1, curve2, number) {
        var box1 = curve1.bbox(),
            box2 = curve2.bbox(),
            nres = 0,
            ares = [];

        if ( ! box1.intersect(box2)) {
            box1 = null;
            box2 = null;
            return number ? 0 : [];
        }

        var sampling = 10;

        var l1 = curve1.length(),
            l2 = curve2.length();
        
        var // n1 = ~~(l1 / 8),
            // n2 = ~~(l2 / 8),
            n1 = ~~(l1 / 10),
            n2 = ~~(l2 / 10),
            dots1 = [],
            dots2 = [],
            xy = {};

        var i, j, t, p;

        for (i = 0; i < n1 + 1; i++) {
            t = i / n1;
            p = curve1.pointAt(t, true);
            dots1.push({x: p.x, y: p.y, t: t});
        }

        for (i = 0; i < n2 + 1; i++) {
            t = i / n2;
            p = curve2.pointAt(t, true);
            dots2.push({x: p.x, y: p.y, t: t});
        }

        box1 = null;
        box2 = null;

        curve1 = null;
        curve2 = null;

        for (i = 0; i < n1; i++) {
            
            for (j = 0; j < n2; j++) {

                var di  = dots1[i],
                    di1 = dots1[i + 1],
                    dj  = dots2[j],
                    dj1 = dots2[j + 1],
                    ci  = Math.abs(di1.x - di.x) < .001 ? 'y' : 'x',
                    cj  = Math.abs(dj1.x - dj.x) < .001 ? 'y' : 'x',
                    is  = Graph.util.lineIntersection(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);

                if (is) {
                    
                    if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
                        continue;
                    }

                    xy[is.x.toFixed(4)] = is.y.toFixed(4);
                    
                    var t1 = di.t + Math.abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
                        t2 = dj.t + Math.abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
                    
                    if (t1 >= 0 && t1 <= 1.001 && t2 >= 0 && t2 <= 1.001) {
                        nres++;
                        ares.push(is);
                    }
                }

            }
        }

        return number ? nres : ares;
    }

    ///////// STATIC /////////
    
    Graph.lang.Curve.toString = function() {
        return "function(command)";
    };  

    ///////// SHORTCUT /////////
    
    Graph.curve = function(command) {
        return new Graph.lang.Curve(command);
    };

}());