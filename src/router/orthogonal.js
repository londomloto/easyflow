
(function(){

    var R = Graph.router.Router;

    Graph.router.Orthogonal = R.extend({
        props: {
            type: 'orthogonal',
            step: 10,
            maxLoops: 500,
            maxAngle: 270,
            angle: 0,
            command: 'M 0 0 L 0 0',
            segments: [['M', 0, 0], ['L', 0, 0]]
        },
        constructor: function(paper, source, target, options) {
            var me = this, step;

            // me.$super(paper, source, target, options);
            me.superclass.prototype.constructor.call(me, paper, source, target, options);

            step = me.props.step;

            me.directions = [
                {dx:  step, dy:  0   , cost: step, angle: null},
                {dx:  0   , dy:  step, cost: step, angle: null},
                {dx:  0   , dy: -step, cost: step, angle: null},
                {dx: -step, dy:  0   , cost: step, angle: null}
            ];

            _.forEach(me.directions, function(dir){
                dir.angle = Graph.math.theta(0, 0, dir.dx, -dir.dy);
            });

            me.penalties = {
                  0: 0,
                 90: step / 2,
                180: 0,
                270: step / 2
            };
        },
        backtrace: function(parents, point, from, to, patch) {
            var me = this,
                step = me.props.step,
                ways = me.directions.length,
                routes = [],
                prevdiff = Graph.point(0, 0),
                current = point,
                parent;

            while ((parent = parents[current])) {   
                var currdiff = parent.difference(current);
                
                if ( ! currdiff.equals(prevdiff)) {
                    routes.unshift(current);
                    prevdiff = currdiff;
                }

                current = parent;
            }

            routes.unshift(current);

            // refine
            var size = routes.length,
                maxs = size - 1;

            var first, last, orient;

            if (size >= 2) {

                first = routes[0];

                if ( ! from.equals(first)) {
                    routes[0].props.x = from.props.x;
                    routes[0].props.y = from.props.y;

                    orient = R.dirorient(routes[0], routes[1], ways);

                    if (orient == 'H') {
                        routes[1].props.y = routes[0].props.y;
                    } else if (orient == 'V') {
                        routes[1].props.x = routes[0].props.x;
                    }
                }

                last = routes[maxs];

                if ( ! to.equals(last)) {
                    
                    if (size === 2) {
                        orient = R.dirorient(routes[maxs - 1], routes[maxs], ways);
                        if (orient == 'H') {
                            routes[maxs].props.x = to.props.x;
                        } else {
                            routes[maxs].props.y = to.props.y;
                        }
                        routes.push(to.clone());
                    } else {
                        routes[maxs].props.x = to.props.x;
                        routes[maxs].props.y = to.props.y;

                        orient = R.dirorient(routes[maxs - 1], routes[maxs], ways);

                        if (orient == 'H') {
                            routes[maxs - 1].props.y = routes[maxs].props.y;
                        } else {
                            routes[maxs - 1].props.x = routes[maxs].props.x;
                        }
                    }
                }
                
            }

            var segments = [];

            if (patch) {
                segments = me.props.segments;

                if (patch == 'start') { 
                    segments[0][0] = 'L';
                    
                    segments = _.map(routes, function(r){
                        return ['L', r.props.x, r.props.y];
                    }).concat(segments);

                    segments[0][0] = 'M';
                } else {
                    segments = segments.concat(_.map(routes, function(r){
                        return ['L', r.props.x, r.props.y];
                    }));
                }

                me.props.segments = segments;
                me.commit();
                me.tidify();

            } else {
                segments = _.map(routes, function(p){
                    return ['L', p.props.x, p.props.y];
                });

                segments[0][0] = 'M';
                
                me.props.segments = segments;
                me.commit();
            }

            return me;    
        },

        fallback: function(from, to, patch) {
            return this;
        },

        route: function(from, to, patch) {
            var me = this,
                step = me.props.step,
                ways = me.directions.length,
                loop = me.props.maxLoops;

            var heap, fpoint, tpoint;
            
            heap = new R.util.Heap();

            patch = _.defaultTo(patch, false);

            if ( ! from) {
                from = me.ports.source.location();
            }

            if ( ! to) {
                to = me.ports.target.location();
            }

            fpoint = from.clone().snap(step, step);
            tpoint = to.clone().snap(step, step);

            var parents = {},
                distances = {},
                srckey = fpoint.toString(),
                tarkey = tpoint.toString();

            var prevangle, currkey, currpoint, currdist, currangle,
                nextkey, nextpoint, deltadir, dist, dir, i;

            heap.add(srckey, fpoint.manhattan(tpoint));
            distances[srckey] = 0;

            while( ! heap.isEmpty() && loop > 0) {
                
                currkey   = heap.pop();
                currpoint = Graph.point(currkey);
                currdist  = distances[currkey];
                prevangle = currangle;

                currangle = parents[currkey]
                    ? R.dirangle(parents[currkey], currpoint, ways)
                    : (me.props.angle !== null ? me.props.angle : R.dirangle(fpoint, currpoint, ways));

                if (tarkey == currkey) {
                    me.props.angle = currangle;
                    return me.backtrace(parents, currpoint, from, to, patch);
                }
                
                for (i = 0; i < ways; i++) {
                    dir = me.directions[i];
                    deltadir = R.dirchange(currangle, dir.angle);
                    
                    if (deltadir > me.props.maxAngle) {
                        continue;
                    }

                    nextpoint = currpoint.clone().expand(dir.dx, dir.dy);
                    nextkey   = nextpoint.toString();

                    if (heap.isClose(nextkey)) {
                        continue;
                    }

                    if (tarkey == nextkey) {
                        parents[nextkey] = currpoint;
                        me.props.angle = R.dirangle(currpoint, nextpoint, ways);
                        return me.backtrace(parents, nextpoint, from, to, patch);
                    }

                    dist = currdist + dir.cost + me.penalties[deltadir];

                    if ( ! heap.isOpen(nextkey) || dist < distances[nextkey]) {
                        parents[nextkey] = currpoint;
                        distances[nextkey] = dist;
                        heap.add(nextkey, dist + nextpoint.manhattan(tpoint));
                    }
                }
                loop--;
            }

            heap = null;

            me.fallback(from, to, patch);
            return me;
        },

        patch: function() {
            this.route();
            return this;
        },

        tidify: function() {
            var me = this,
                ss = this.props.segments, 
                ws = this.directions.length,
                rs = [];

            var size, last, prev, curr, cdir, pdir,
                prnd, crnd, x, y;

            _.forEach(ss, function(s, i){
                
                if ( ! rs.length) {
                    rs.push(s);
                    x = s[1];
                    y = s[2];
                } else {
                    last = rs.length - 1;
                    rs.push(s);

                    prev = Graph.point(x, y);
                    curr = Graph.point(s[1], s[2]);

                    prnd = prev.clone().round();
                    crnd = curr.clone().round();

                    cdir = R.dirangle(prnd, crnd, ws);
                    cdir = [0, 180, 360].indexOf(cdir) !== -1 ? 'H' : 'V';

                    if (prnd.equals(crnd)) {
                        if (rs[last][0] != 'M') {
                            rs.splice(last, 1);
                        } else {
                            rs.pop();
                        }
                        cdir = pdir;
                    } else {
                        if (cdir == pdir) {
                            if (rs[last][0] != 'M') {
                                rs.splice(last, 1);
                            } else {
                                rs.pop();
                            }
                            cdir = pdir;
                        }
                    }
                    
                    pdir = cdir;

                    x = s[1];
                    y = s[2];
                }
            });

            this.props.segments = rs;
            this.commit();

            return this;
        }
    });

}());