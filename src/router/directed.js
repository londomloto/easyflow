
(function(){
    
    var Router = Graph.router.Router;
    
    Graph.router.Directed = Graph.extend(Router, {
        
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
                        
                        length = curve.length();
                        
                        point = curve.pointAt(curve.t(length / 2), true);
                        point.from = i - 1;
                        point.to = i;
                        point.space = 0;

                        points.push(point);
                            
                        if (i < ii - 1) {
                            point = curve.pointAt(curve.t(length), true);
                            point.from = i - 1;
                            point.to = i + 1;
                            point.space = 1;
                            
                            points.push(point);
                        }
                    }
                }

                this.cached.bendpoints = points;
            }

            return points;
        },
        
        route: function(start, end) {
            var source = this.source(),
                srcnet = source.connectable(),
                srcbox = srcnet.bbox(),
                sbound = srcbox.toJson(),
                target = this.target(),
                tarnet = target.connectable(),
                tarbox = tarnet.bbox(),
                tbound = tarbox.toJson(),
                orient = srcnet.orientation(tarnet),
                direct = srcnet.direction(tarnet),
                tuneup = false,
                routes = [];
            
            if ( ! start) {
                start = srcbox.center(true);
            }
            
            if ( ! end) {
                end = tarbox.center(true);
            }
            
            var sdot, edot;
            
            if (direct) {
                if (direct == 'h:h') {
                    switch (orient) {
                        case 'top-right':
                        case 'right':
                        case 'bottom-right':
                            sdot = { 
                                x: sbound.x, 
                                y: start.y 
                            };
                            
                            edot = { 
                                x: tbound.x + tbound.width, 
                                y: end.y 
                            };

                            break;
                        case 'top-left':
                        case 'left':
                        case 'bottom-left':
                            sdot = { 
                                x: sbound.x + sbound.width, 
                                y: start.y 
                            };

                            edot = { 
                                x: tbound.x, 
                                y: end.y 
                            };

                            break;
                    }
                    tuneup = true;
                }
                
                if (direct == 'v:v') {
                    switch(orient) {
                        case 'top-left':
                        case 'top':
                        case 'top-right':
                            sdot = {
                                x: start.x, 
                                y: sbound.y + sbound.height
                            };

                            edot = { 
                                x: end.x, 
                                y: tbound.y
                            };
                            break;
                        case 'bottom-left':
                        case 'bottom':
                        case 'bottom-right':
                            sdot = { 
                                x: start.x, 
                                y: sbound.y
                            };

                            edot = { 
                                x: end.x, 
                                y: tbound.y + tbound.height
                            };
                            break;
                    }
                    tuneup = true;
                }
            }
            
            if (tuneup) {
                routes = [sdot, edot];
            } else {
                routes = [start, end];
            }
            
            // cropping
            var cable = Graph.path(Graph.util.points2path(routes));
            var inter;
            
            inter = srcnet.pathinfo().intersection(cable, true);
            
            if (inter.length) {
                routes[0] = inter[0];
            }
            
            inter = tarnet.pathinfo().intersection(cable, true);
            
            if (inter.length) {
                routes[1] = inter[inter.length - 1];
            }
            
            this.values.waypoints = routes;
            this.commit();
             
            this.fire('route', {
                command: this.command()
            });
            
            return this;
        },
        
        repair: function(component, port) {
            var source = this.source(),
                srcnet = source.connectable(),
                srcbox = srcnet.bbox(),
                target = this.target(),
                tarnet = target.connectable(),
                tarbox = tarnet.bbox(),
                routes = this.values.waypoints,
                maxlen = routes.length - 1;
            
            if (component === source) {
                routes[0] = port;
            } else if (component === target) {
                routes[maxlen] = port;
            }
            
            // cropping
            var closest;
            
            closest = Router.closestIntersection(routes, srcnet.pathinfo(), tarbox.center(true));
            
            if (closest) {
                routes[0] = closest;
            }
            
            closest = Router.closestIntersection(routes, tarnet.pathinfo(), srcbox.center(true));
            
            if (closest) {
                routes[maxlen] = closest;
            }
            
            this.commit();
            this.fire('route', {command: this.command()});
        },
        
        initBending: function(trans) {
            var source = this.source(),
                target = this.target(),
                srcnet = source.connectable(),
                tarnet = target.connectable(),
                sourcePath = srcnet.pathinfo(),
                targetPath = tarnet.pathinfo(),
                waypoints = this.waypoints(),
                rangeStart = trans.range.start,
                rangeEnd = trans.range.end,
                segmentStart = waypoints[rangeStart],
                segmentEnd = waypoints[rangeEnd];
            
            var snaps = [
                waypoints[rangeStart],
                waypoints[rangeEnd]
            ];
            
            var offset  = this.layout().offset();
            
            trans.snap.hor = [];
            trans.snap.ver = [];
            
            _.forEach(snaps, function(p){
                if (p) {
                    trans.snap.hor.push(p.y + offset.top);
                    trans.snap.ver.push(p.x + offset.left);
                }
            });
            
            this.cached.bending = {
                source: source,
                target: target,
                rangeStart: rangeStart,
                rangeEnd: rangeStart,
                segmentStart: segmentStart,
                segmentEnd: segmentEnd,
                original: waypoints.slice(),
                sourcePath: sourcePath,
                targetPath: targetPath
            };
        },
        
        bending: function(trans, callback) {
            var bending = this.cached.bending,
                routes = bending.original.slice(),
                rangeStart = bending.rangeStart,
                rangeEnd = bending.rangeEnd,
                segmentStart = bending.segmentStart,
                segmentEnd = bending.segmentEnd;
            
            var segment = {
                x: trans.segment.x + trans.delta.x,
                y: trans.segment.y + trans.delta.y
            };
            
            var align1 = Graph.util.pointAlign(segmentStart, segment, 10),
                align2 = Graph.util.pointAlign(segmentEnd, segment, 10);
                
            if (align1 == 'h' && align2 == 'v') {
                segment.x = segmentStart.x;
                segment.y = segmentEnd.y;
            } else if (align1 == 'v' && align2 == 'h') {
                segment.y = segmentStart.y;
                segment.x = segmentEnd.x;
            } else if (align1 == 'h') {
                segment.x = segmentStart.x;
            } else if (align1 == 'v') {
                segment.y = segmentStart.y;
            } else if (align2 == 'h') {
                segment.x = segmentEnd.x;
            } else if (align2 == 'v') {
                segment.y = segmentEnd.y;
            }
            
            trans.event.x = segment.x;
            trans.event.y = segment.y;
            
            routes.splice(rangeStart + 1, trans.space, segment);
            bending.routes = routes;
            
            this.cropping(trans, callback);
        },
        
        stopBending: function(trans) {
            var bending = this.cached.bending;
            
            this.tidify();
            this.values.waypoints = bending.waypoints;
            this.commit();
        },
        
        cropping: _.debounce(function(trans, callback){
            var bending = this.cached.bending,
                routes  = bending.routes,
                srcport = Router.porting(routes, bending.sourcePath, true),
                tarport = Router.porting(routes, bending.targetPath),
                cropped = routes.slice(srcport.index + 1, tarport.index);
            
            var command;
            
            cropped.unshift(srcport.port);
            cropped.push(tarport.port);
            
            bending.waypoints = cropped;
            
            if (callback) {
                command = Graph.util.points2path(bending.waypoints);
                callback({command: command});
            }
            
        }, 0),
        
        tidify: function() {
            var bending = this.cached.bending,
                points = bending.waypoints;
                
            var concised = _.filter(points, function(p, i){
                if (Graph.util.isPointOnLine(points[i - 1], points[i + 1], p)) {
                    return false;
                }
                return true;
            });
            
            bending.waypoints = concised;   
        },

        toString: function() {
            return 'Graph.router.Directed';
        }
        
    });

}());