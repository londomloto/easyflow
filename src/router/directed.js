
(function(){

    Graph.router.Directed = Graph.extend(Graph.router.Router, {

        props: {
            domain: null,
            source: null,
            target: null,
            command: 'M 0 0 L 0 0',
            segments: [['M', 0, 0], ['L', 0, 0]]
        },

        direction: {
            orientation: null,
            verifyStart: false,
            centerStart: false,
            verifyEnd: false,
            centerEnd: false,
            found: false,
            start: null,
            type: null,
            init: true,
            end: null
        },

        docks: {
            lastStart: null,
            start: null,
            lastEnd: null,
            end: null
        },

        bends: [],

        orienting: function(sbox, tbox) {
            if ( ! sbox) {
                sbox = this.source().bbox();
            }

            if ( ! tbox) {
                tbox = this.target().bbox();
            }

            var sori = sbox.origin(),
                tori = tbox.origin(),
                scor = sbox.corner(),
                tcor = tbox.corner();

            var top = scor.props.y <= tori.props.y,
                right = sori.props.x >= tcor.props.x,
                bottom = sori.props.y >= tcor.props.y,
                left = scor.props.x <= tori.props.x;

            var ver = top  ? 'top'  : (bottom ? 'bottom' : null),
                hor = left ? 'left' : (right ? 'right' : null);

            if (hor && ver) {
                this.direction.orientation = ver + '-' + hor;
            } else {
                this.direction.orientation = hor || ver || 'intersect';
            }

            return this;
        },

        directing: function(start, end, sbox, tbox) {
            var orient = this.direction.orientation,
                sdat = sbox.data(), 
                tdat = tbox.data();

            var result, spoint, epoint, dirs, sdot, edot;

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

                spoint = Graph.point(sdot.x, sdot.y);
                epoint = Graph.point(edot.x, edot.y);

                this.direction.found = true;
                this.direction.verifyStart = this.requestVerify(this.direction.start, spoint);
                this.direction.verifyEnd = this.requestVerify(this.direction.end, epoint);
                this.direction.start = spoint;
                this.direction.end   = epoint;

                sdot = spoint = null;
                edot = epoint = null;

            } else {
                _.assign(this.direction, {
                    verifyStart: true,
                    verifyEnd: true
                });
            }

            return this;
        },

        requestVerify: function(p1, p2, old) {
            if ( ! p1 || ! p2) {
                return this.direction.init ? false : true;
            }

            var rv = false;

            if ( ! p1.equals(p2)) {
                rv = true;
            }

            return rv;
        },

        snapping: function(dock, vertex, vector) {
            var box = vector.bbox(),
                seg = vector.pathinfo().transform(vector.matrix()).curve().segments,
                max = seg.length,
                L1 = Graph.line(vertex, box.center()),
                L2 = null;

            var inter, x, y, s, i;

            // for (i = 0; i < max; i++) {
            //     s = seg[i];
            //     if (s[0] == 'M') {
            //         x = s[1];
            //         y = s[2];
            //     } else {
            //         if (s[0] == 'C') {
            //             L2 = Graph.line(x, y, s[5], s[6]);
            //             x = s[5];
            //             y = s[6];
            //         }
                    
            //         inter = L1.intersection(L2);

            //         if (inter) {
            //             vertex.props.x = inter.props.x;
            //             vertex.props.y = inter.props.y;
            //             inter = null;
            //             break;
            //         }
            //     }
            // }
            
            L1 = null;
            L2 = null;
            
            if (dock == 'start') {
                this.docks.start = this.docks.lastStart = vertex;
            } else {
                this.docks.end = this.docks.lastEnd = vertex;
            }

            return vertex;
        },

        docking: function(source, target) {
            var verify = false,
                start = this.direction.start.clone(),
                end = this.direction.end.clone();

            var result, inter, box, seg, ln1, ln2, ii, s, x, y, i, j;

            if (this.direction.verifyStart) {
                verify = true;
                this.direction.verifyStart = false;
            }
            
            if (verify) {
                this.snapping('start', start, source);
            }

            verify = false;

            if (this.direction.verifyEnd) {
                verify = true;
                this.direction.verifyEnd = false;
            }

            if (verify) {
                this.snapping('end', end, target);
            }

            this.docks.start = start;
            this.docks.end = end;

            start = null;
            end = null;

            return result;
        },

        route: function(start, end) {
            var source = this.source(),
                sbox = source.bbox(),
                target = this.target(),
                tbox = target.bbox();

            var segments, vstart, vend;

            if (this.direction.init) {
                this.direction.centerStart = ! start;
                this.direction.centerEnd = ! end;
            }

            start = _.defaultTo(start, sbox.center());
            end = _.defaultTo(end, tbox.center());
            vstart = this.direction.verifyStart;
            vend = this.direction.verifyEnd;

            this.orienting(sbox, tbox);
            this.directing(start, end, sbox, tbox);

            if ( ! this.direction.found) {
                return this;
            }

            this.docking(source, target);

            start = this.docks.start;
            end = this.docks.end;

            if (this.direction.init) {
                var snap = false;

                if (source.props.rotate || ( ! vstart && ! this.direction.centerStart)) {
                    snap = true;
                }

                if (snap) {
                    this.snapping('start', start, source);
                }

                snap = false;

                if (target.props.rotate || ( ! vend && ! this.direction.centerEnd)) {
                    snap = true;
                }

                if (snap) {
                    this.snapping('end', end, target);
                }
            } else {
                if (source.props.rotate && ! vstart) {
                    this.snapping('start', start, source);
                }

                if (target.props.rotate && ! vend) {
                    this.snapping('end', end, target);
                }
            }

            this.direction.init = false;
            this.build();

            this.fire('route', {
                command: this.props.command
            });

            return this;
        },

        reroute: function() {
            var start, end;

            if ( ! this.direction.centerStart) {
                start = this.docks.start;
            }

            if ( ! this.direction.centerEnd) {
                end = this.docks.end;
            }

            this.route(start, end);
        },

        build: function() {
            var start = this.docks.start,
                end = this.docks.end;

            var segments;

            segments = [
                ['M', start.props.x, start.props.y], 
                ['L', end.props.x, end.props.y]
            ];

            this.segments(segments);
            this.commit();

            return this;
        },

        toString: function() {
            return 'Graph.router.Directed';
        },

        ///////// OBSERVERS /////////
        
        onSourceDrag: function(e) {
            this.direction.verifyStart = true;
            this.reroute();
        },

        onSourceDragEnd: function() {
            this.direction.verifyStart = true;
            this.reroute();
        },

        onSourceResize: function() {
            this.direction.verifyStart = true;
            this.reroute();
        },

        onTargetDrag: function() {
            this.direction.verifyEnd = true;
            this.reroute();
        },

        onTargetDragEnd: function() {
            this.direction.verifyEnd = true;
            this.reroute();
        },

        onTargetResize: function() {
            this.direction.verifyEnd = true;
            this.reroute();
        }
    });

}());