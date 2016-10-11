
(function(){

    Graph.router.Ortho = Graph.extend(Graph.router.Directed, {
        
        waypoints: function() {
            return [this.docks.start].concat(this.bends).concat([this.docks.end]);
        },

        bendpoints: function(start, end, direction) {
            var args = _.toArray(arguments);

            if ( ! args.length) {
                return this.bends;
            }

            var points = [];
            
            if ( ! start.alignment(end)) {
                var x1 = start.props.x,
                    y1 = start.props.y,
                    x2 = end.props.x,
                    y2 = end.props.y;   

                var xm, ym;

                direction = _.defaultTo(direction, 'h:h');

                if (direction == 'h:v') {
                    points = [
                        { x: x2, y: y1 }
                    ];
                } else if (direction == 'v:h') {
                    points = [
                        { x: x1, y: y2 }
                    ];
                } else if (direction == 'h:h') {
                    xm = Math.round((x2 - x1) / 2 + x1);
                    points = [
                        { x: xm, y: y1 },
                        { x: xm, y: y2 }
                    ];
                } else if (direction == 'v:v') {
                    ym = Math.round((y2 - y1) / 2 + y1);
                    points = [
                        { x: x1, y: ym },
                        { x: x2, y: ym }
                    ];
                } else {
                    points = [];
                }

                points = _.map(points, function(o){
                    return Graph.point(o.x, o.y);
                });
            }

            this.bends = points;

            return points;
        },

        directing: function(start, end) {
            var orient = this.direction.orientation,
                source = this.source(),
                target = this.target();

            var sbox = source.bbox(),
                tbox = target.bbox();

            var sdat = sbox.data(), 
                tdat = tbox.data();

            var spath, tpath, lpath, cpath, dirs, sdot, edot;
            var inter, imaxs, found;

            switch(orient) {
                case 'intersect':
                    dirs = null;
                    break;
                case 'top':
                case 'bottom':
                    dirs = 'v:v';
                    break;
                case 'left':
                case 'right':
                    dirs = 'h:h';
                    break;
                default:
                    dirs = 'h:h';
                    break;
            }

            this.direction.type = dirs;

            if (dirs) {
                if (dirs == 'h:h') {
                    switch (orient) {
                        case 'top-right':
                        case 'right':
                        case 'bottom-right':
                            sdot = { 
                                x: sdat.x, 
                                y: start.props.y 
                            };
                            
                            edot = { 
                                x: tdat.x + tdat.width, 
                                y: end.props.y 
                            };

                            break;
                        case 'top-left':
                        case 'left':
                        case 'bottom-left':
                            sdot = { 
                                x: sdat.x + sdat.width, 
                                y: start.props.y 
                            };

                            edot = { 
                                x: tdat.x, 
                                y: end.props.y 
                            };

                            break;
                    }
                }

                if (dirs == 'v:v') {
                    switch (orient) {
                        case 'top-left':
                        case 'top':
                        case 'top-right':
                            sdot = { 
                                x: start.props.x, 
                                y: sdat.y + sdat.height 
                            };

                            edot = { 
                                x: end.props.x, 
                                y: tdat.y 
                            };
                            break;
                        case 'bottom-left':
                        case 'bottom':
                        case 'bottom-right':
                            sdot = { 
                                x: start.props.x, 
                                y: sdat.y 
                            };

                            edot = { 
                                x: end.props.x, 
                                y: tdat.y + tdat.height 
                            };
                            break;
                    }
                }

                sdot = Graph.point(sdot.x, sdot.y);
                edot = Graph.point(edot.x, edot.y);

                found = true;

            } else {
                sdot = this.ports.start || start;
                edot = this.ports.end   || end;

                found = false;
            }

            // validate
            spath = source.pathinfo().transform(source.matrix());
            tpath = target.pathinfo().transform(target.matrix());
            
            lpath = Graph.path([
                ['M', sdot.props.x, sdot.props.y],
                ['L', edot.props.x, edot.props.y]
            ]);

            inter = spath.intersectnum(lpath);
            
            if ( ! inter || ! found) {
                cpath = Graph.path([
                    ['M', start.props.x, start.props.y],
                    ['L', end.props.x, end.props.y]
                ]);

                inter = spath.intersection(cpath, true);

                if (inter.length) {
                    imaxs = inter.length - 1;
                    this.docks.start = Graph.point(inter[imaxs].x, inter[imaxs].y);
                }
            } else {
                this.docks.start = sdot;
            }

            inter = tpath.intersectnum(lpath);

            if ( ! inter || ! found) {
                cpath = Graph.path([
                    ['M', start.props.x, start.props.y],
                    ['L', end.props.x, end.props.y]
                ]);

                inter = tpath.intersection(cpath, true);

                if (inter.length) {
                    imaxs = inter.length - 1;
                    this.docks.end = Graph.point(inter[imaxs].x, inter[imaxs].y);
                }
            } else {
                this.docks.end = edot;
            }

            return this;
        },

        route: function(start, end) {
            var source = this.source(),
                target = this.target();

            var sbox = source.bbox(),
                tbox = target.bbox();

            if (start) {
                this.ports.start = start;
            }

            if (end) {
                this.ports.end = end;
            }

            start = sbox.center();
            end   = tbox.center();

            this.orienting(sbox, tbox);
            this.directing(start, end);

            this.build();

            this.fire('route', {
                command: this.props.command
            });

            return this;
        },

        build: function() {
            var start = this.docks.start,
                end = this.docks.end,
                points = [],
                segments = [];

            points = this.bendpoints(start, end, this.direction.type);

            points.unshift(start);
            points.push(end);

            _.forEach(points, function(v, i){
                var x = v.props.x, 
                    y = v.props.y;

                if (i === 0) {
                    segments.push(['M', x, y])
                } else {
                    segments.push(['L', x, y])
                }
            });

            this.props.segments = segments;
            this.commit();

            return this;
        }

    });

}());