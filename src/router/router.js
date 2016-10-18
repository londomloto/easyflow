
(function(){

    var Router = Graph.router.Router = Graph.extend({

        props: {
            domain: null,
            source: null,
            target: null
        },

        values: {
            start: null,
            end: null,
            waypoints: null
        },

        cached: {
            command: null,
            segments: null,
            pathinfo: null,
            bendpoints: null,
            bending: null
        },

        constructor: function(domain, source, target, options) {
            _.assign(this.props, options || {});

            this.props.domain = domain.guid();
            this.props.source = source.guid();
            this.props.target = target.guid();

            this.values.waypoints = [];
        },

        invalidate: function() {
            this.cached.command = null;
            this.cached.segments = null;
            this.cached.pathinfo = null;
            this.cached.bendpoints = null;
        },

        domain: function() {
            return Graph.registry.vector.get(this.props.domain);
        },

        source: function() {
            return Graph.registry.vector.get(this.props.source);
        },

        target: function() {
            return Graph.registry.vector.get(this.props.target);
        },

        layout: function() {
            return this.domain().layout();
        },

        tail: function() {
            var tail = _.first(this.values.waypoints);
            return tail ? _.extend({}, tail) : null;
        },

        head: function() {
            var head = _.last(this.values.waypoints);
            return head ? _.extend({}, head) : null;
        },

        middle: function() {
            var path = this.pathinfo(),
                middle = path.pointAt(path.length() / 2, true);
            
            path = null;
            return middle;
        },
        

        /**
         * Get compiled waypoints, or
         * set waypoint with extracted command strings
         */
        command: function(command) {
            var segments, points;

            if (command === undefined) {
                command = this.cached.command;
                if ( ! command) {
                    segments = this.segments();
                    command  = Graph.util.segments2path(segments);
                    this.cached.command = command;
                }
                return command;
            }

            segments = Graph.util.path2segments(command);

            points = _.map(segments, function(s){
                return {
                    x: s[1], 
                    y: s[2]
                };
            });

            this.values.waypoints = points;
            this.invalidate();

            segments = points = null;

            return this;
        },

        segments: function() {
            var segments = this.cached.segments;
            if ( ! segments) {
                segments = [];
                
                _.forEach(this.values.waypoints, function(p, i){
                    var cmd = i === 0 ? 'M' : 'L';
                    segments.push([cmd, p.x, p.y]);
                });

                this.cached.segments = segments;
            }
            return segments;
        },
        
        waypoints: function() {
            return this.values.waypoints;
        },

        bendpoints: function() {
            var points = this.cached.bendpoints;

            if ( ! points) {
                var segments = this.pathinfo().curve().segments;
                var segment, curve, length, point, x, y;

                points = [];

                for (var i = 0, ii = segments.length; i < ii; i++) {
                    segment = segments[i];
                    if (i === 0) {
                        x = segment[1];
                        y = segment[2];
                    } else {
                        curve = Graph.curve([['M', x, y], segment]);
                        x = segment[5];
                        y = segment[6];
                        length = curve.length() / 2;
                        point = curve.pointAt(curve.t(length), true);
                        point.from = i - 1;
                        point.to = i;

                        points.push(point);
                    }
                }

                this.cached.bendpoints = points;
            }

            return points;
        },
        
        pathinfo: function() {
            var path = this.cached.pathinfo;
            if ( ! path) {
                path = Graph.path(this.command());
                this.cached.pathinfo = path;
            }
            return path;
        },

        modify: function(index, x, y) {
            this.values.waypoints[index].x = x;
            this.values.waypoints[index].y = y;
            return this;
        },

        commit: function() {
            // reset cache;
            this.invalidate();

            // update cache;
            // this.segments();
            // this.command();
            // this.pathinfo();
            // this.bendpoints();

            return this;
        },

        route: function() {
            return this;
        },

        repair: function(component, port) {
            
        },

        reroute: function() {
            return this.route();
        },

        relocate: function(dx, dy) {
            _.forEach(this.values.waypoints, function(p){
                p.x += dx;
                p.y += dy;
            });

            this.commit();
            return this;
        }
        
    });
    
    ///////// HELPERS /////////
    
    Router.portCentering = function(port, center, axis) {
        if (axis == 'x') {
            port.y = center.y;
        }
        
        if (axis == 'y') {
            port.x = center.x;
        }
        
        return port;
    }

    Router.porting = function(routes, shape, source) {
        var index = source ? 0 : routes.length - 1,
            cable = Graph.path(Graph.util.points2path(routes)),
            inter = shape.intersection(cable, true);
        
        var point, port;

        point = routes[index];

        if (inter.length) {
            inter = Router.sortIntersection(inter);
            port  = source ? inter[0] : inter[inter.length - 1];
        }

        return {
            index: index,
            point: point,
            port:  port || point
        };
    };

    Router.possibleRepair = function(routes) {
        var count = routes.length;
        
        if (count < 3) {
            return false;
        }
        
        if (count > 4) {
            return true;
        }
        
        return !_.find(routes, function(p, i){
            var q = routes[i - 1];
            return q && Graph.util.pointDistance(p, q) <= 5;
        });
    };

    Router.pointSegment = function(routes, point) {
        var segment = 0;

        _.forEach(routes, function(p, i){
            if (Graph.util.isPointOnLine(p, routes[i + 1], point)) {
                segment = i;
                return false;
            }
        });
        
        return segment;
    };

    Router.sortIntersection = function(intersection) {
        return _.sortBy(intersection, function(p){
            var d = Math.floor(p.t2 * 100) || 1;
            d = 100 - d;
            d = (d < 10 ? '0' : '') + d;
            return p.segment2 + '#' + d;
        });
    };

    Router.closestIntersection = function(routes, shape, offset) {
        var cable = Graph.path(Graph.util.points2path(routes)),
            inter = shape.intersection(cable, true),
            distance = Infinity;

        var closest;

        if (inter.length) {
            inter = Router.sortIntersection(inter);
            _.forEach(inter, function(p){
                var t = Graph.util.taxicab(p, offset);
                if (t <= distance) {
                    distance = t;
                    closest = p;
                }
            });
        }

        return closest;
    };

    Router.repairBendpoint = function(bend, oldport, newport) {
        var align = Graph.util.pointAlign(oldport, bend);
        
        switch(align) {
            case 'v':
                return {
                    x: bend.x,
                    y: newport.y
                };
            case 'h':
                return {
                    x: newport.x,
                    y: bend.y
                };
        }
        
        return {
            x: bend.x,
            y: bend.y
        };
    };

    Router.repairRoutes = function(bound1, bound2, newport, routes) {
        var oldport = routes[0],
            clonedRoutes = routes.slice();
        
        var slicedRoutes;
        
        clonedRoutes[0] = newport;
        clonedRoutes[1] = Router.repairBendpoint(clonedRoutes[1], oldport, newport);
        
        return clonedRoutes;
    };

}());