
(function(){
    
    Graph.router.Manhattan = Graph.extend({

        props: {
            step: 10,
            grid: 10,

            maxLoops: 500,
            maxAngle: 180,

            angle: null
        },

        source: null,
        target: null,
        canvas: null,

        obstacle: null,
        directions: [],
        penalties: {},

        constructor: function(canvas, source, target, options) {
            var me = this;

            _.extend(me.props, options || {});

            me.canvas   = canvas;
            me.source   = source;
            me.target   = target;

            me.obstacle = new Obstacle(canvas, source, target);
            me.obstacle.props.step = me.props.step;
            me.obstacle.props.grid = me.props.grid;

            var step = me.props.step;

            me.directions = [
                {dx:  step, dy:  0   , cost: step, angle: null},
                {dx:  0   , dy: -step, cost: step, angle: null},
                {dx: -step, dy:  0   , cost: step, angle: null},
                {dx:  0   , dy:  step, cost: step, angle: null}
            ];

            _.forEach(me.directions, function(dir){
                dir.angle = Graph.theta(0, 0, dir.dx, dir.dy);
            });

            me.penalties = {
                  0: 0,
                 90: step / 2,
                180: 0,
                270: step / 2
            };

        },

        dirangle: function(start, end) {
            // var q = 360 / this.directions.length;
            var q = 90;
            return Math.floor((start.theta(end) + q / 2) / q) * q;
        },

        dirchange: function(from, to) {
            var delta = Math.abs(from - to);
            return delta > 180 ? 360 - delta : delta;
        },

        backtrace: function(parents, point) {
            var me = this,
                vertices = [],
                prevdiff = new Graph.lang.Point(0, 0),
                current = point,
                parent;

            while ((parent = parents[current])) {   
                var currdiff = parent.difference(current);
                
                if ( ! currdiff.equals(prevdiff)) {
                    vertices.unshift(current);
                    prevdiff = currdiff;
                }

                current = parent;
            }

            vertices.unshift(current);

            // refine
            var size = vertices.length,
                maxs = size - 1,
                head = vertices[0],
                tail = vertices[maxs],
                step = me.props.step;

            if (size >= 2) {
                var sdot = me.source.location(),
                    tdot = me.target.location();

                var sbox, sdeg, tbox, tdeg;

                if ( ! head.equals(sdot)) {
                    if (me.source.vector) {
                        sbox = me.source.vector.bbox(false, false);
                        if ( ! sbox.contain(head)) {
                            sdeg = me.dirangle(sdot, head);
                            if (sdeg === 90 || sdeg === 270) {
                                head.props.x = sdot.props.x;
                            } else {
                                head.props.y = sdot.props.y;
                            }
                            vertices.unshift(sdot);
                        } else {
                            sdeg = head.theta(vertices[1]);
                            if (sdeg === 90 || sdeg === 270) {
                                vertices[1].props.x = sdot.props.x;
                            } else {
                                vertices[1].props.y = sdot.props.y;
                            }
                            vertices.splice(0, 1, sdot);
                        }
                    }
                }

                if ( ! tail.equals(tdot)) {
                    if (me.target.vector) {
                        tbox = me.target.vector.bbox(false, false);
                        if ( ! tbox.contain(tail)) {
                            tdeg = me.dirangle(tdot, tail);
                            if (tdeg === 90 || tdeg === 270) {
                                tail.props.x = tdot.props.x;
                            } else {
                                tail.props.y = tdot.props.y;
                            }
                            vertices.push(tdot);
                        } else {
                            tdeg = tail.theta(vertices[maxs - 1]);
                            if (tdeg === 90 || tdeg === 270) {
                                vertices[maxs - 1].props.x = tdot.props.x;
                            } else {
                                vertices[maxs - 1].props.y = tdot.props.y;
                            }
                            vertices.splice(maxs, 1, tdot);
                        }
                    }
                }
            }

            return vertices;
        },

        route: function() {
            var me = this,
                step = me.props.step,
                ways = me.directions.length,
                loop = me.props.maxLoops,
                sdot = me.source.location(),
                tdot = me.target.location(),
                spoint = sdot.clone().snap(step, step),
                tpoint = tdot.clone().snap(step, step);

            me.obstacle.build();
            me.props.angle = null;

            if (me.obstacle.permit(spoint) && me.obstacle.permit(tpoint)) {
                
                var heap = new Heap(),
                    parents = {},
                    distances = {};

                var srckey = spoint.toString(),
                    tarkey = tpoint.toString();

                var prevangle;
                var currkey, currpoint, currdist, currangle;
                var nextkey, nextpoint;
                var deltadir, dist;
                var dir, i;

                heap.add(srckey, spoint.manhattan(tpoint));
                distances[srckey] = 0;

                while( ! heap.isEmpty() && loop > 0) {
                    
                    currkey   = heap.pop();
                    currpoint = new Graph.lang.Point(currkey);
                    currdist  = distances[currkey];
                    prevangle = currangle;

                    currangle = parents[currkey]
                        ? me.dirangle(parents[currkey], currpoint)
                        : (me.props.angle !== null ? me.props.angle : me.dirangle(spoint, currpoint));

                    if (tarkey == currkey) {
                        me.props.angle = currangle;
                        return me.backtrace(parents, currpoint);

                        // deltadir = dirchange(currangle, dirangle(currpoint, target, ways));
                        // if (currpoint.equals(target) || deltadir < 180) {
                        //     me.props.angle = currangle;
                        //     console.log(n);
                        //     return backtrace(parents, currpoint);
                        // }
                    }

                    for (i = 0; i < ways; i++) {
                        dir = me.directions[i];
                        deltadir = me.dirchange(currangle, dir.angle);
                        
                        if (deltadir > me.props.maxAngle) {
                            continue;
                        }   

                        nextpoint = currpoint.clone().expand(dir.dx, dir.dy);
                        nextkey   = nextpoint.toString();

                        if (heap.isClose(nextkey) || ! me.obstacle.permit(nextpoint)) {
                            continue;
                        }

                        if (tarkey == nextkey) {
                            parents[nextkey] = currpoint;
                            me.props.angle = me.dirangle(currpoint, nextpoint);
                            return me.backtrace(parents, nextpoint);
                        }

                        dist = currdist + dir.cost + me.penalties[deltadir];

                        if ( ! heap.isOpen(nextkey) || dist < distances[nextkey]) {
                            parents[nextkey] = currpoint;
                            // distances[nextkey] = dist;
                            distances[nextkey] = dist - me.penalties[deltadir];
                            heap.add(nextkey, dist + nextpoint.manhattan(tpoint));
                        }
                    }
                    loop--;
                }

                heap = null;

            }

            return me.fallback();
        },

        fallback: function() {
            var router = new Graph.router.Orthogonal(
                this.canvas,
                this.source,
                this.target
            );

            var routes = router.route();
            router = null;
            return routes;
        }

    });

    ///////// INTERNAL HEAP /////////
    
    var Heap = Graph.extend({

        items: [],
        state: {},
        costs: {},

        constructor: function() {},

        add: function(key, value) {
            var me = this, insert;

            if (me.state[key]) {
                me.items.splice(me.items.indexOf(key), 1);
            } else {
                me.state[key] = 'OPEN';
            }

            me.costs[key] = value;

            insert = _.sortedIndexBy(me.items, key, function(k){
                return me.costs[k];
            });

            this.items.splice(insert, 0, key);
        },

        has: function(key) {
            return !!this.state[key];
        },

        remove: function(key) {
            this.state[key] = 'CLOSE';
        },

        isOpen: function(key) {
            return this.state[key] == 'OPEN';
        },

        isClose: function(key) {
            return this.state[key] == 'CLOSE';  
        },

        isEmpty: function() {
            return this.items.length === 0;
        },

        pop: function() {
            var key = this.items.shift();
            this.remove(key);
            return key;
        }
    });

    ///////// INTERNAL OBSTACLE /////////
    
    var Obstacle = Graph.extend({

        props: {
            step: 10,
            grid: 10
        },

        hash: {},

        source: null,
        target: null,
        canvas: null,

        sourceDot: null,
        targetDot: null,

        sourceBox: null,
        targetBox: null,

        constructor: function(canvas, source, target, options) {
            _.extend(this.props, options || {});

            this.canvas = canvas;
            this.source = source;
            this.target = target;
        },

        build: function() {
            var me = this,
                step = me.props.step,
                grid = me.props.grid,
                canvas = me.canvas,
                excludes = [];

            me.hash = {};

            var margin = {
                x: -step,
                y: -step,
                width:  2 * step,
                height: 2 * step
            };

            if (me.source && me.source.vector) {
                me.sourceBox = me.source.vector.bbox(false, false);
                me.sourceDot = me.source.location().clone().snap(step, step);

                excludes.push(me.source.vector);
            }

            if (me.target && me.source.vector) {
                me.targetBox = me.target.vector.bbox(false, false);
                me.targetDot = me.target.location().clone().snap(step, step);
                excludes.push(me.target.vector);
            }

            _.chain(canvas.children().items)
                .difference(excludes)
                .filter(function(c){
                    return c.props.collectable === true;
                })
                .map(function(c){
                    var box = c.bbox(false, false).clone().expand(margin.x, margin.y, margin.width, margin.height);
                    return box;
                })
                .reduce(function(hash, box){
                    var origin, corner, x, y, k;

                    origin = box.origin().snap(grid, grid),
                    corner = box.corner().snap(grid, grid);

                    for (x = origin.props.x; x <= corner.props.x; x += grid) {
                        for (y = origin.props.y; y <= corner.props.y; y += grid) {
                            k = x + ',' + y;
                            hash[k] = hash[k] || [];
                            hash[k].push(box);
                        }
                    }
                    
                    return hash;

                }, me.hash).value();
        },

        clear: function() {
            this.hash = {};
        },

        permit: function(point) {
            var me = this,
                grid = me.props.grid,
                key = point.clone().snap(grid, grid).toString();

            if (me.sourceDot && me.sourceBox) {
                if (me.sourceBox.contain(point) && ! me.sourceDot.equals(point)) {
                    return false;
                }
            }

            if (me.targetDot && me.targetBox) {
                if (me.targetBox.contain(point) && ! me.targetDot.equals(point)) {
                    return false;
                }
            }

            return _.every(me.hash[key], function(box) {
                return ! box.contain(point);
            });
        }
    });

}());