
(function(){

    Graph.router.Orthogonal = Graph.extend({
        
        canvas: null,
        source: null,
        target: null,

        constructor: function(canvas, source, target) {
            this.canvas = canvas;
            this.source = source;
            this.target = target;

            this.opposite = {
                N: 'S',
                S: 'N',
                E: 'W',
                W: 'E'
            };

            this.radians = {
                N: -Math.PI / 2 * 3,
                S: -Math.PI / 2,
                E: 0,
                W: Math.PI
            };
        },

        bearing: function(from, to) {
            if (from.props.x == to.props.x) return from.props.y > to.props.y ? 'N' : 'S';
            if (from.props.y == to.props.y) return from.props.x > to.props.x ? 'W' : 'E';
            return null;
        },

        pointbox: function(point) {
            return new Graph.lang.BBox({
                x: point.props.x,
                y: point.props.y,
                x2: point.props.x,
                y2: point.props.y,
                width: 0,
                height: 0
            });
        },

        expandbox: function(box, val) {
            return box.expand(-val, -val, 2 * val, 2 * val);
        },

        boundary: function(box1, box2) {
            var x1, y1, x2, y2;

            box1 = box1.data();
            box2 = box2.data();

            x1 = Math.min(box1.x, box2.x);
            y1 = Math.min(box1.y, box2.y);
            x2 = Math.max(box1.x + box1.width, box2.x + box2.width);
            y2 = Math.max(box1.y + box1.height, box2.y + box2.height);

            return new Graph.lang.BBox({
                x: x1,
                y: y1,
                x2: x2,
                y2: y2,
                width: x2 - x1,
                height: y2 - y1  
            });
        },

        boxsize: function(box, bearing) {
            var data = box.data();
            return data[(bearing == 'W' || bearing == 'E') ? 'width' : 'height'];
        },

        midpoint: function(from, to) {
            var x = (from.props.x + to.props.x) / 2,
                y = (from.props.y + to.props.y) / 2;
            return new Graph.lang.Point(x, y);
        },

        pick: function(p1, p2, box) {
            var point = new Graph.lang.Point(p1.props.x, p2.props.y);
            if (box.contain(point)) {
                point = new Graph.lang.Point(p2.props.x, p1.props.y);
            }
            return point;
        },

        i2e: function(from, to, fromBox, toBox, bearing) {
            var me = this,
                boundary = me.expandbox(me.boundary(fromBox, toBox), 1),
                reversed = boundary.center().distance(to) > boundary.center().distance(from),
                start = reversed ? to : from,
                end = reversed ? from : to,
                route = {};

            var p1, p2, p3;

            if (bearing) {
                p1 = Graph.polar2point(boundary.width() + boundary.height(), me.radians[bearing], start);
                p1 = boundary.pointNearestPoint(p1).move(p1, -1);
            } else {
                p1 = boundary.pointNearestPoint(start).move(start, 1);
            }

            p2 = me.pick(p1, end, boundary);

            if (p1.round().equals(p2.round())) {
                p2 = Graph.polar2point(boundary.width() + boundary.height(), Graph.rad(p1.theta(start)) + Math.PI / 2, end);
                p2 = boundary.pointNearestPoint(p2).move(end, 1).round();
                p3 = me.pick(p1, p2, boundary);
                route.points = reversed ? [p2, p3, p1] : [p1, p3, p2];
            } else {
                route.points = reversed ? [p2, p1] : [p1, p2];
            }

            route.direction = reversed ? me.bearing(p1, to) : me.bearing(p2, to);
            return route;
        },

        e2v: function(from, to, fromBox) {
            var me = this,
                po = me.pick(from, to, fromBox);
            
            me.canvas.circle(po.props.x, po.props.y, 3).render();
            
            return {
                points: [po],
                direction: me.bearing(po, to)
            };
        },

        e2e: function(from, to, fromBox, toBox) {
            var me = this,
                route = me.e2v(to, from, toBox),
                p1 = route.points[0];
            
            var p2;

            if (fromBox.contain(p1)) {
                route = me.e2v(from, to, fromBox);
                p2 = route.points[0];

                if (toBox.contain(p2)) {
                    var fb = from.move(p2, -me.boxsize(fromBox, me.bearing(from, p2)) / 2),
                        tb = to.move(p1, -me.boxsize(toBox, bearing(to, p1)) / 2),
                        md = me.midpoint(fb, tb);

                    var sr = me.e2v(from, md, fromBox),
                        er = me.v2v(md, to, sr.direction);

                    route.points = [sr.points[0], er.points[0]];
                    route.direction = er.direction;
                }
            }

            return route;
        },

        v2v: function(from, to, bearing) {
            var me = this,
                p1 = new Graph.lang.Point(from.props.x, to.props.y),
                p2 = new Graph.lang.Point(to.props.x, from.props.y),
                d1 = me.bearing(from, p1),
                d2 = me.bearing(from, p2),
                ob = me.opposite[bearing];

            var po = (d1 == bearing || (d1 != ob && (d2 == ob || d2 != bearing))) ? p1 : p2;

            return  {
                points: [po],
                direction: me.bearing(po, to)
            };
        },

        route: function() {
            var me = this,
                sdot = me.source.location().clone(),
                tdot = me.target.location().clone(),
                sbox = me.source.vector ? me.source.vector.bbox(false, false).clone() : null,
                tbox = me.target.vector ? me.target.vector.bbox(false, false).clone() : null,
                vertices = [],
                routes = [];

            var bearing;

            if (sbox && tbox) {
                vertices = [
                    sbox.center(),
                    sdot,
                    tdot,
                    tbox.center()
                ];

                var vmax = vertices.length - 1;
                var route, ortho, from, to, i;

                for (i = 0; i < vmax; i++) {
                    route = null;
                    from = vertices[i];
                    to = vertices[i + 1];
                    ortho = !!me.bearing(from, to);

                    if (i === 0) {
                        if (i + 1 === vmax) {
                            if (sbox.intersect(me.expandbox(tbox, 1))) {
                                route = me.i2e(from, to, sbox, tbox);
                            } else if ( ! ortho) {
                                route = me.e2e(from, to, sbox, tbox);
                            }
                        } else {
                            if (sbox.contain(to)) {
                                //route = me.i2e(from, to, sbox, me.expandbox(me.pointbox(to), 20));
                            } else if ( ! ortho) {
                                route = me.e2v(from, to, sbox);
                            }
                        }
                    } else if (i + 1 == vmax) {
                        var loop = ortho && me.bearing(to, from) == bearing;
                        if (tbox.contain(from) || loop) {
                            //route = me.i2e(from, to, me.expandbox(me.pointbox(from), 20), tbox, bearing);
                        } else if ( ! ortho) {
                            route = me.v2e(from, to, tbox, bearing);
                        }
                    } else if ( ! ortho) {
                        route = me.v2v(from, to, bearing);
                    }

                    if (route) {
                        Array.prototype.push.apply(routes, route.points);
                        bearing = route.direction;
                    } else {
                        bearing = me.bearing(from, to);
                    }

                    if (i + 1 < vmax) {
                        routes.push(to);
                    }

                }
            }
            return routes;
        }
    });

}());