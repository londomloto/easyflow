
(function(){

    var Router = Graph.router.Router;

    Graph.router.Orthogonal = Graph.extend(Router, {
        
        route: function(start, end) {

            var source = this.source(),
                target = this.target(),
                srcnet = source.connectable(),
                tarnet = target.connectable(),
                srcbox = srcnet.bbox(),
                sbound = srcbox.data(),
                tarbox = tarnet.bbox(),
                tbound = tarbox.data(),
                orient = srcnet.orientation(tarnet),
                direct = srcnet.direction(tarnet),
                tuneup  = false;
            
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
                                x: sbound.x + 1, 
                                y: start.y 
                            };
                            
                            edot = { 
                                x: tbound.x + tbound.width - 1, 
                                y: end.y 
                            };

                            break;
                        case 'top-left':
                        case 'left':
                        case 'bottom-left':
                            sdot = { 
                                x: sbound.x + sbound.width - 1, 
                                y: start.y 
                            };

                            edot = { 
                                x: tbound.x + 1, 
                                y: end.y 
                            };

                            break;
                    }
                    tuneup = true;
                }

                if (direct == 'v:v') {
                    switch (orient) {
                        case 'top-left':
                        case 'top':
                        case 'top-right':
                            sdot = {
                                x: start.x, 
                                y: sbound.y + sbound.height - 1 
                            };

                            edot = { 
                                x: end.x, 
                                y: tbound.y + 1
                            };
                            break;
                        case 'bottom-left':
                        case 'bottom':
                        case 'bottom-right':
                            sdot = { 
                                x: start.x, 
                                y: sbound.y + 1
                            };

                            edot = { 
                                x: end.x, 
                                y: tbound.y + tbound.height - 1
                            };
                            break;
                    }
                    tuneup = true;
                }
                
            }
            
            var bends, shape, cable, inter;
            
            if (tuneup) {
                
                shape = srcnet.pathinfo();
                cable = Graph.path(Graph.util.points2path([sdot, edot]));
                inter = shape.intersection(cable, true);
                
                if (inter.length) {
                    inter = inter[0];
                    if ( ! Graph.util.isPointEquals(inter, sdot)) {
                        sdot = inter;
                    }
                }
                
                shape = tarnet.pathinfo();
                inter = shape.intersection(cable, true);
                
                if (inter.length) {
                    inter = inter[inter.length - 1];
                    if ( ! Graph.util.isPointEquals(inter, edot)) {
                        edot = inter;
                    }
                }
                
                bends = Graph.util.lineBendpoints(sdot, edot, direct);
                this.values.waypoints = [sdot].concat(bends).concat([edot]);
                
            } else {
                
                sdot = start;
                edot = end;
                
                // get bending point from center
                bends = Graph.util.lineBendpoints(sdot, edot, direct);
                cable = Graph.path(Graph.util.points2path([sdot].concat(bends).concat([edot])));
                shape = srcnet.pathinfo();
                
                // get source inter
                inter = shape.intersection(cable, true);
                
                if (inter.length) {
                    sdot = inter[0];
                }
                
                shape = tarnet.pathinfo();
                inter = shape.intersection(cable, true);
                
                if (inter.length) {
                    edot = inter[inter.length - 1];
                }
                
                this.values.waypoints = [sdot].concat(bends).concat([edot]);
            }
            
            this.commit();
            
            this.fire('route', { command: this.command() });
            
            return this;
        },
        
        repair: function(component, port) {
            var routes = this.values.waypoints.slice();
            
            if ( ! Router.possibleRepair(routes)) {
                return this.route();
            }
            
            var target = this.target(),
                tarnet = target.connectable(),
                tarbox = tarnet.bbox(),
                source = this.source(),
                srcnet = source.connectable(),
                srcbox = srcnet.bbox();
                
            var bound1, bound2, center, points, axis, repaired;
            
            if (component === source) {
                bound1 = srcbox.toJson();
                bound2 = tarbox.toJson();
                center = srcbox.center(true);
                points = routes;
            } else {
                bound1 = tarbox.toJson();
                bound2 = srcbox.toJson();
                center = tarbox.center(true);
                points = routes.slice();
                points.reverse();
            }
            
            axis = Graph.util.pointAlign(points[0], points[1]) == 'h' ? 'x' : 'y';
            Router.portCentering(port, center, axis);

            repaired = Router.repairRoutes(
                bound1,
                bound2,
                port,
                points
            );
            
            var cropped, closest, rangeStart, rangeEnd;

            if (repaired) {

                if (component === target) {
                    repaired.reverse();
                }
                
                cropped = repaired.slice();
                closest = Router.closestIntersection(repaired, srcnet.pathinfo(), tarbox.center(true));

                if (closest) {
                    rangeStart = Router.pointSegment(repaired, closest);
                    cropped = cropped.slice(rangeStart + 1);
                    cropped.unshift(closest);
                }

                closest = Router.closestIntersection(cropped, tarnet.pathinfo(), srcbox.center(true));

                if (closest) {
                    rangeEnd = Router.pointSegment(cropped, closest);
                    cropped = cropped.slice(0, rangeEnd + 1);
                    cropped.push(closest);

                    if (cropped.length === 2) {
                        var align = Graph.util.pointAlign(cropped[0], cropped[1]);
                        if (align == 'h') {
                            cropped[1].x = cropped[0].x;
                        } else if (align == 'v') {
                            cropped[1].y = cropped[0].y;
                        }
                    }
                }

                this.values.waypoints = cropped;
                this.commit();
                this.fire('route', {command: this.command()});

                return this;
            } else {
                return this.route();
            }
        },
        
        initBending: function(trans) {
            var waypoints = this.waypoints(),
                source = this.source(),
                target = this.target(),
                rangeStart = trans.ranges.start,
                rangeEnd = trans.ranges.end,
                srcnet = source.connectable(),
                tarnet = target.connectable(),
                sourceBox = srcnet.bbox(),
                targetBox = tarnet.bbox(),
                segmentStart = waypoints[rangeStart],
                segmentEnd = waypoints[rangeEnd];
            
            // force start & end to center
            if (rangeStart === 0) {
                Router.portCentering(segmentStart, sourceBox.center(true), trans.axis);
            }
            
            if (rangeEnd === waypoints.length - 1) {
                Router.portCentering(segmentEnd, targetBox.center(true), trans.axis);
            }
            
            // snapping
            var snaps = [
                waypoints[rangeStart - 1],
                segmentStart,
                segmentEnd,
                waypoints[rangeEnd + 1]
            ];
            
            if (rangeStart < 2) {
                snaps.unshift(sourceBox.center(true));
            }
            
            if (rangeEnd > waypoints.length - 3) {
                snaps.unshift(targetBox.center(true));
            }
            
            var offset = this.layout().offset(),
                snapH = [],
                snapV = [];
            
            trans.snap.hor = [];
            trans.snap.ver = [];
            
            _.forEach(snaps, function(p){
                if (p) {
                    if (trans.axis == 'y') {
                        snapH.push(p.y);
                        trans.snap.hor.push(p.y + offset.top);
                    }
                    
                    if (trans.axis == 'x') {
                        snapV.push(p.x);
                        trans.snap.ver.push(p.x + offset.left);
                    }
                }
            });
            
            this.cached.bending = {
                source: source,
                target: target,
                original: waypoints,
                rangeStart: rangeStart,
                rangeEnd: rangeEnd,
                segmentStart: segmentStart,
                segmentEnd: segmentEnd,
                sourceBound: sourceBox.toJson(),
                targetBound: targetBox.toJson(),
                sourcePath: srcnet.pathinfo(),
                targetPath: tarnet.pathinfo(),
                snapH: snapH,
                snapV: snapV
            };
        },
        
        /**
         * Segment bending
         */
        bending: function(trans, callback) {
            
            var bending = this.cached.bending,
                routes = bending.original.slice(),
                segmentStart = bending.segmentStart,
                segmentEnd = bending.segmentEnd,
                rangeStart = bending.rangeStart,
                rangeEnd = bending.rangeEnd;
            
            var newStart, newEnd;
            
            newStart = {
                x: segmentStart.x + trans.delta.x,
                y: segmentStart.y + trans.delta.y
            };
            
            newEnd = {
                x: segmentEnd.x + trans.delta.x,
                y: segmentEnd.y + trans.delta.y
            };
            
            // snapping //
            
            if (trans.axis == 'x') {
                trans.event.x = (newStart.x + newEnd.x) / 2;
            }
            
            if (trans.axis == 'y') {
                trans.event.y = (newStart.y + newEnd.y) / 2;
            }
            
            var sx = Graph.util.snapValue(trans.event.x, bending.snapV),
                sy = Graph.util.snapValue(trans.event.y, bending.snapH);
                
            trans.event.x = sx;
            trans.event.y = sy;
            
            if (trans.axis == 'x') {
                newStart.x = sx;
                newEnd.x = sx;
            }
            
            if (trans.axis == 'y') {
                newStart.y = sy;
                newEnd.y = sy;
            }
            
            routes[rangeStart] = newStart;
            routes[rangeEnd]   = newEnd;
            
            var dotlen = routes.length,
                offset = 0;
                
            var sourceOrient, targetOrient;
            
            if (rangeStart < 2) {
                sourceOrient = Graph.util.boxOrientation(
                    bending.sourceBound,
                    Graph.util.pointbox(newStart)
                );
                
                if (rangeStart === 1) {
                    if (sourceOrient == 'intersect') {
                        routes.shift();
                        routes[0] = newStart;
                        offset--;
                    }
                } else {
                    if (sourceOrient != 'intersect') {
                        routes.unshift(segmentStart);
                        offset++;
                    }
                }
            }
            
            if (rangeEnd > dotlen - 3) {
                
                targetOrient = Graph.util.boxOrientation(
                    bending.targetBound,
                    Graph.util.pointbox(newEnd)
                );

                if (rangeEnd === dotlen - 2) {
                    if (targetOrient == 'intersect') {
                        routes.pop();
                        routes[routes.length - 1] = newEnd;
                    }
                } else {
                    if (targetOrient != 'intersect') {
                        routes.push(segmentEnd);
                    }
                }
            }
            
            
            bending.routes = routes;
            bending.newRangeStart = rangeStart + offset;  
            
            this.cropping(callback);
        },
        
        stopBending: function () {
            var bending = this.cached.bending;
            
            this.tidify();
            this.values.waypoints = bending.waypoints;
            this.commit();
        },
        
        cropping: _.debounce(function(callback) {
            
            var bending = this.cached.bending,
                routes = bending.routes,
                srcport = Router.porting(routes, bending.sourcePath, true),
                tarport = Router.porting(routes, bending.targetPath),
                cropped = routes.slice(srcport.index + 1, tarport.index);
            
            var command;
            
            cropped.unshift(srcport.port);
            cropped.push(tarport.port);
            
            bending.waypoints = cropped;
            
            if (callback) {
                command = Graph.util.points2path(bending.waypoints);
                callback({
                    command: command
                });
            }
        }, 0),
        
        tidify: function() {
            var bending = this.cached.bending,
                points = bending.waypoints,
                offset = 0;
                
            var concised = _.filter(points, function(p, i){
                if (Graph.util.isPointOnLine(points[i - 1], points[i + 1], p)) {
                    offset = i <= bending.newRangeStart ? offset - 1 : offset;
                    return false;
                }
                return true;
            });
            
            bending.waypoints = concised;
            bending.newRangeStart = bending.newRangeStart + offset;
            
        },
        
        toString: function() {
            return 'Graph.router.Orthogonal';
        }

    });

}());