(function(){

    var Path = Graph.lang.Path = Graph.extend({

        __CLASS__: 'Graph.lang.Path',
        
        segments: [],

        constructor: function(command) {
            var segments = [];
            
            if (Graph.isPath(command)) {
                segments = _.cloneDeep(command.segments);
            } else if (_.isArray(command)) {
                segments = _.cloneDeep(command);
            } else {
                segments = Graph.cmd2seg(command);
            }

            this.segments = segments;
        },

        absolute: function() {
            if ( ! this.segments.length) {
                return new Path([['M', 0, 0]]);
            }

            var cached = Graph.lookup(this.__CLASS__, 'absolute', this.toString()),
                segments = this.segments;

            if (cached.absolute) {
                return cached.absolute;
            }

            var result = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;

            if (segments[0][0] == 'M') {
                x = +segments[0][1];
                y = +segments[0][2];
                mx = x;
                my = y;
                start++;
                result[0] = ['M', x, y];
            }

            var z = segments.length == 3 && 
                    segments[0][0] == 'M' && 
                    segments[1][0].toUpperCase() == 'R' && 
                    segments[2][0].toUpperCase() == 'Z';
            
            for (var dots, seg, itm, i = start, ii = segments.length; i < ii; i++) {
                result.push(seg = []);
                itm = segments[i];

                if (itm[0] != _.toUpper(itm[0])) {
                    seg[0] = _.toUpper(itm[0]);

                    switch(seg[0]) {
                        case 'A':
                            seg[1] = itm[1];
                            seg[2] = itm[2];
                            seg[3] = itm[3];
                            seg[4] = itm[4];
                            seg[5] = itm[5];
                            seg[6] = +(itm[6] + x);
                            seg[7] = +(itm[7] + y);
                            break;
                        case 'V':
                            seg[1] = +itm[1] + y;
                            break;
                        case 'H':
                            seg[1] = +itm[1] + x;
                            break;
                        case 'R':
                            dots = _.concat([x, y], itm.slice(1));
                            for (var j = 2, jj = dots.length; j < jj; j++) {
                                dots[j] = +dots[j] + x;
                                dots[++j] = +dots[j] + y;
                            }
                            result.pop();
                            result = _.concat(result, [['C'].concat(Graph.catmull2bezier(dots, z))])
                            break;
                        case 'M':
                            mx = +itm[1] + x;
                            my = +itm[2] + y;
                        default:
                            for (var k = 1, kk = itm.length; k < kk; k++) {
                                seg[k] = +itm[k] + ((k % 2) ? x : y);
                            }
                    }

                } else if (itm[0] == 'R') {
                    dots = _.concat([x, y], itm.slice(1));
                    result.pop();
                    result = _.concat(result, [['C'].concat(Graph.catmull2bezier(dots, z))]);
                    seg = _.concat(['R'], itm.slice(-2));
                } else {
                    for (var l = 0, ll = itm.length; l < ll; l++) {
                        seg[l] = itm[l];
                    }
                }

                switch (seg[0]) {
                    case 'Z':
                        x = mx;
                        y = my;
                        break;
                    case 'H':
                        x = seg[1];
                        break;
                    case 'V':
                        y = seg[1];
                        break;
                    case 'M':
                        mx = seg[seg.length - 2];
                        my = seg[seg.length - 1];
                    default:
                        x = seg[seg.length - 2];
                        y = seg[seg.length - 1];
                }
            }
            
            cached.absolute = result = new Path(result);
            return result;
        },

        start: function() {
            return this.pointAt(0);
        },

        end: function() {
            return this.pointAt(this.length());
        },

        relative: function() {
            var cached = Graph.lookup(this.__CLASS__, 'relative', this.toString()),
                segments = this.segments;

            if (cached.relative) {
                return cached.relative;
            }

            var result = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;

            if (segments[0][0] == 'M') {
                x = segments[0][1];
                y = segments[0][2];
                mx = x;
                my = y;
                start++;
                result.push(['M', x, y]);
            }

            for (var i = start, ii = segments.length; i < ii; i++) {
                var seg = result[i] = [], itm = segments[i];

                if (itm[0] != _.toLower(itm[0])) {
                    seg[0] = _.toLower(itm[0]);

                    switch (seg[0]) {
                        case 'a':
                            seg[1] = itm[1];
                            seg[2] = itm[2];
                            seg[3] = itm[3];
                            seg[4] = itm[4];
                            seg[5] = itm[5];
                            seg[6] = +(itm[6] - x).toFixed(3);
                            seg[7] = +(itm[7] - y).toFixed(3);
                            break;
                        case 'v':
                            seg[1] = +(itm[1] - y).toFixed(3);
                            break;
                        case 'm':
                            mx = itm[1];
                            my = itm[2];
                        default:
                            for (var j = 1, jj = itm.length; j < jj; j++) {
                                seg[j] = +(itm[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    seg = res[i] = [];
                    if (itm[0] == 'm') {
                        mx = itm[1] + x;
                        my = itm[2] + y;
                    }
                    for (var k = 0, kk = itm.length; k < kk; k++) {
                        res[i][k] = itm[k];
                    }
                }

                var len = result[i].length;

                switch (result[i][0]) {
                    case 'z':
                        x = mx;
                        y = my;
                        break;
                    case 'h':
                        x += +result[i][len - 1];
                        break;
                    case 'v':
                        y += +result[i][len - 1];
                        break;
                    default:
                        x += +result[i][len - 2];
                        y += +result[i][len - 1];
                }
            }

            cached.relative = result = new Path(result);
            return result;
        },

        curve: function(to){
            var cached = to ? {} : Graph.lookup(this.__CLASS__, 'curve', this.toString());
            
            if (cached.curve) {
                return cached.curve;
            }
            
            var p1 = _.cloneDeep(this.absolute().segments),
                p2 = to && _.cloneDeep((new Path(to)).absolute().segments),
                a1 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                a2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                com1 = [],
                com2 = [],
                init = '',
                prev = '';

            for (var i = 0, ii = _.max([p1.length, p2 && p2.length || 0]); i < ii; i++) {
                p1[i] && (init = p1[i][0]);
                
                if (init != 'C') {
                    com1[i] = init;
                    i && (prev = com1[i - 1]);
                }
                
                p1[i] = process(p1[i], a1, prev);

                if (com1[i] != 'A' && init == 'C') com1[i] = 'C';

                fixarc(p1, i);

                if (p2) {
                    p2[i] && (init = p2[i][0]);

                    if (init != 'C') {
                        com2[i] = init;
                        i && (prev = com2[i - 1]);
                    }

                    p2[i] = processPath(p2[i], attrs2, pcom);
                    if (com2[i] != 'A' && init == 'C') com2[i] = 'C';

                    fixArc(p2, i);
                }

                fixmove(p1, p2, a1, a2, i);
                fixmove(p2, p1, a2, a1, i);

                var s1 = p1[i],
                    s2 = p2 && p2[i],
                    l1 = s1.length,
                    l2 = p2 && s2.length;

                a1.x = s1[l1 - 2];
                a1.y = s1[l1 - 1];
                a1.bx = _.float(s1[l1 - 4]) || a1.x;
                a1.by = _.float(s1[l1 - 3]) || a1.y;

                a2.bx = p2 && (_.float(s2[l2 - 4]) || a2.x);
                a2.by = p2 && (_.float(s2[l2 - 3]) || a2.y);
                a2.x = p2 && s2[l2 - 2];
                a2.y = p2 && s2[l2 - 1];

            }

            if ( ! p2) {
                cached.curve = new Path(p1);
                return cached.curve;
            }

            return [new Path(p1), new Path(p2)];

            ///////// HELPER /////////
            
            /**
             * @param  Array    segment  segment
             * @param  Object   attr  attribute
             * @param  String   prev  previous toString
             * @return Array        segments
             */
            function process(segment, attr, prev) {
                var nx, ny, tq = {T:1, Q:1};

                if ( ! segment) {
                    return ['C', attr.x, attr.y, attr.x, attr.y, attr.x, attr.y];
                }

                ! ( segment[0] in tq) && (attr.qx = attr.qy = null);

                switch (segment[0]) {
                    case 'M':
                        attr.X = segment[1];
                        attr.Y = segment[2];
                        break;
                    case 'A':
                        segment = ['C'].concat(Graph.arc2curve.apply(0, [attr.x, attr.y].concat(segment.slice(1))));
                        break;
                    case 'S':
                        if (prev == 'C' || prev == 'S') {
                            nx = attr.x * 2 - attr.bx;
                            ny = attr.y * 2 - attr.by;
                        } else {
                            nx = attr.x;
                            ny = attr.y;
                        }
                        segment = ['C', nx, ny].concat(segment.slice(1));
                        break;
                    case 'T':
                        if (prev == 'Q' || prev == 'T') {
                            attr.qx = attr.x * 2 - attr.qx;
                            attr.qy = attr.y * 2 - attr.qy;
                        } else {
                            attr.qx = attr.x;
                            attr.qy = attr.y;
                        }
                        path = ['C'].concat(Graph.quad2curve(attr.x, attr.y, attr.qx, attr.qy, segment[1], segment[2]));
                        break;
                    case 'Q':
                        attr.qx = segment[1];
                        attr.qy = segment[2];
                        path = ['C'].concat(Graph.quad2curve(attr.x, attr.y, segment[1], segment[2], segment[3], segment[4]));
                        break;
                    case 'L':
                        segment = ['C'].concat(Graph.line2curve(attr.x, attr.y, segment[1], segment[2]));
                        break;
                    case 'H':
                        segment = ['C'].concat(Graph.line2curve(attr.x, attr.y, segment[1], attr.y));
                        break;
                    case 'V':
                        segment = ['C'].concat(Graph.line2curve(attr.x, attr.y, attr.x, segment[1]));
                        break;
                    case 'Z':
                        segment = ['C'].concat(Graph.line2curve(attr.x, attr.y, attr.X, attr.Y));
                        break;
                }
                return segment;
            }

            function fixarc(segments, i) {
                if (segments[i].length > 7) {
                    segments[i].shift();
                    var pi = segments[i];

                    while (pi.length) {
                        com1[i] = 'A';
                        p2 && (com2[i] = 'A');
                        segments.splice(i++, 0, ['C'].concat(pi.splice(0, 6)));
                    }
                    
                    segments.splice(i, 1);
                    ii = _.max([p1.length, p2 && p2.length || 0]);
                }
            }

            function fixmove(segments1, segments2, a1, a2, i) {
                if (segments1 && segments2 && segments1[i][0] == 'M' && segments2[i][0] != 'M') {
                    segments2.splice(i, 0, ['M', a2.x, a2.y]);
                    a1.bx = 0;
                    a1.by = 0;
                    a1.x = segments1[i][1];
                    a1.y = segments1[i][2];
                    ii = _.max([p1.length, p2 && p2.length || 0]);
                }
            }

        },

        bbox: function(){
            if ( ! this.segments.length) {
                return Graph.bbox({x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0});
            }

            var cached = Graph.lookup(this.__CLASS__, 'bbox', this.toString());

            if (cached.bbox) {
                return cached.bbox;
            }

            var segments = this.curve().segments,
                x = 0,
                y = 0,
                X = [],
                Y = [],
                p;

            for (var i = 0, ii = segments.length; i < ii; i++) {
                p = segments[i];
                if (p[0] == 'M') {
                    x = p[1];
                    y = p[2];
                    X.push(x);
                    Y.push(y);
                } else {
                    var box = Graph.curvebox(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                    X = X.concat(box.min.x, box.max.x);
                    Y = Y.concat(box.min.y, box.max.y);
                    x = p[5];
                    y = p[6];
                }
            }

            var xmin = _.min(X),
                ymin = _.min(Y),
                xmax = _.max(X),
                ymax = _.max(Y),
                width = xmax - xmin,
                height = ymax - ymin,
                bounds = {
                    x: xmin,
                    y: ymin,
                    x2: xmax,
                    y2: ymax,
                    width: width,
                    height: height,
                    cx: xmin + width / 2,
                    cy: ymin + height / 2
                };

            cached.bbox = Graph.bbox(bounds);
            return cached.bbox;
        },
        
        transform: function(matrix) {
            if ( ! matrix) {
                return;
            }

            var cached = Graph.lookup(this.__CLASS__, 'transform', this.toString(), matrix.toString());

            if (cached.transform) {
                return cached.transform;
            }

            var segments = _.cloneDeep(this.curve().segments);
            var x, y, i, ii, j, jj, seg;
            
            for (i = 0, ii = segments.length; i < ii; i++) {
                seg = segments[i];
                for (j = 1, jj = seg.length; j < jj; j += 2) {
                    x = matrix.x(seg[j], seg[j + 1]);
                    y = matrix.y(seg[j], seg[j + 1]);
                    seg[j] = x;
                    seg[j + 1] = y;
                }
            }
            
            cached.transform = new Path(segments);
            return cached.transform;
        },

        lengthAt: function(point) {

        },

        pointAt: function(length) {
            var ps = this.curve().segments;
            var point, s, x, y, l, c, d;

            l = 0;

            for (var i = 0, ii = ps.length; i < ii; i++) {
                s = ps[i];
                if (s[0] == 'M') {
                    x = s[1];
                    y = s[2];
                } else {
                    c = Graph.curve([['M', x, y], s]);
                    d = c.length();
                    if (l + d > length) {
                        point = c.pointAt(c.t(length - l));
                        c = null;
                        return point;
                    }

                    l += d;
                    x = s[5];
                    y = s[6];

                    c = null;
                }
            }

            c = Graph.curve([['M', x, y], s]);
            point = c.pointAt(1);

            c = null;

            return point;
        },

        segmentAt: function(length) {
            var segments = this.curve().segments,
                index = -1,
                total = 0;
            
            var x, y, l, c;

            _.forEach(segments, function(s, i){
                if (s[0] == 'M') {
                    x = s[1];
                    y = s[2];
                } else {
                    c = Graph.curve([['M', x, y], s]);
                    x = c.x();
                    y = c.y();
                    l = c.length();

                    if (l + total > length) {
                        index = i;
                        return false;
                    }

                    total += l;
                    c = null;
                }
            });

            return index;
        },

        length: function() {
            var ps = this.curve().segments;
            var point, s, x, y, l, c;

            l = 0;

            for (var i = 0, ii = ps.length; i < ii; i++) {
                s = ps[i];
                if (s[0] == 'M') {
                    x = s[1];
                    y = s[2];
                } else {
                    c = Graph.curve([['M', x, y], s]);
                    l = l + c.length();
                    x = s[5];
                    y = s[6];
                    c = null;
                }
            }
            return l;
        },

        slice: function(from, to) {
            var ps = this.curve().segments;
            var sub = {};
            var point, sp, s, x, y, l, c, d;

            l = 0;
            sp = '';

            for (var i = 0, ii = ps.length; i < ii; i++) {
                s = ps[i];
                if (s[0] == 'M') {
                    x = s[1];
                    y = s[2];
                } else {
                    c = Graph.curve([['M', x, y], s]);
                    d = c.length();
                    
                    if (l + d > length) {
                        point = c.pointAt(c.t(length - l));
                        sp += ['C' + point.start.x, point.start.y, point.m.x, point.m.y, point.props.x, point.props.y];
                        sub.start = Graph.path(sp);
                        sp = ['M' + point.props.x, point.props.y + 'C' + point.n.x, point.n.y, point.end.x, point.end.y, s[5], s[6]].join();
                    }

                    l += d;
                    x = s[5];
                    y = s[6];

                    c = null;
                }
                sp += s.shift() + s;
            }

            sub.end = Graph.path(sp);
            return sub;
        },

        vertices: function() {
            var cached = Graph.lookup(this.__CLASS__, 'vertices', this.toString());
            
            if (cached.vertices) {
                return cached.vertices;
            }

            var ps = this.segments,
                vs = [];

            _.forEach(ps, function(s){
                var l = s.length, x, y;
                if (s[0] != 'Z') {
                    if (s[0] == 'M') {
                        x = s[1];
                        y = s[2];
                    } else {
                        x = s[l - 2];
                        y = s[l - 1];
                    }
                    vs.push(Graph.point(x, y));
                }
            });

            cached.vertices = vs;
            return cached.vertices;
        },

        addVertext: function(vertext) {
            var simple = this.isSimple(),
                segments = simple ? _.cloneDeep(this.segments) : this.curve().segments,
                index = -1,
                vx = vertext.props.x,
                vy = vertext.props.y,
                l1 = 0,
                l2 = 0;

            var x, y, c1, c2;

            _.forEach(segments, function(s, i){
                if (s[0] != 'Z') {
                    if (s[0] == 'M') {
                        x = s[1];
                        y = s[2];
                    } else {
                        if (s[0] == 'L') {
                            c1 = Graph.curve([['M', x, y], ['C', x, y, x, y, s[1], s[2]]]);
                            x = s[1];
                            y = s[2];
                        } else {
                            c1 = Graph.curve([['M', x, y], s]);
                            x = c1.x();
                            y = c1.y();
                        }

                        c2 = c1.clone();
                        c2.segments[1][5] = vx;
                        c2.segments[1][6] = vy;  

                        l1 += c1.length();
                        l2 += c2.length();

                        if (l2 <= l1) {
                            index = i;
                            return false;
                        }
                    }
                }
            });

            if (index > -1) {
                if (simple) {
                    segments.splice(index, 0, ['L', vx, vy]);
                } else {
                    segments.splice(index, 0, ['C', vx, vy, vx, vy, vx, vy]);    
                }
                this.segments = segments;
            }

            return this;
        },

        intersect: function(path) {
            return intersection(this, path, true) > 0;
        },

        intersection: function(path) {
            return intersection(this, path);
        },

        intersectnum: function(path) {
            return intersection(this, path, true);
        },

        alpha: function(point) {

        },

        contains: function(point) {
            var b, p, d, x, y;

            x = point.props.x;
            y = point.props.y;
            b = this.bbox();
            d = b.data();
            
            p = new Path([['M', x, y], ['H', d.x2 + 10]]);

            return b.contains(point) && this.intersectnum(p) % 2 == 1;
        },

        /**
         * Get point on path that closest to target point
         */
        nearest: function(point) {
            var length  = this.length(),
                tolerance = 20,
                bestdist = Infinity;

            var best, bestlen, currpoint, currdist, i;

            for (i = 0; i < length; i += tolerance) {
                currpoint = this.pointAt(i);
                currdist  = taxicab(currpoint, point);

                if (currdist < bestdist) {
                    bestdist = currdist;
                    best = currpoint;
                    bestlen = i;
                }
            }

            tolerance /= 2;

            var prev, next, prevlen, nextlen, prevdist, nextdist;
            
            while(tolerance > .5) {
                if ((prevlen = bestlen - tolerance) >= 0 && (prevdist = taxicab((prev = this.pointAt(prevlen)), point)) < bestdist) {
                    best = prev;
                    bestlen = prevlen;
                    bestdist = prevdist;
                } else if ((nextlen = bestlen + tolerance) <= length && (nextdist = taxicab((next = this.pointAt(nextlen)), point)) < bestdist) {
                    best = next;
                    bestlen = nextlen;
                    bestdist = nextdist;
                } else {
                    tolerance /= 2;
                }
            }

            best.props.distance = bestlen;
            return best;
        },  

        isSimple: function() {
            var simple = true;

            _.forEach(this.segments, function(s){
                if ( ! /[MLZ]/i.test(s[0])) {
                    simple = false;
                    return false;
                }
            });

            return simple;
        },

        toString: function() {
            return Graph.seg2cmd(this.segments);
        },

        toArray: function() {
            return this.segments;
        },

        clone: function() {
            var segments = _.cloneDeep(this.segments);
            return new Path(segments);
        }
    });
    
    ///////// HELPERS /////////
    
    function taxicab(point1, point2) {
        var dx = point1.props.x - point2.props.x,
            dy = point1.props.y - point2.props.y;
        return dx * dx + dy * dy;
    }

    function intersection(path1, path2, number) {
        var curve1 = path1.curve(),   
            segments1 = curve1.segments,
            length1 = segments1.length,
            curve2 = path2.curve(),
            segments2 = curve2.segments,
            length2 = segments2.length,
            result = number ? 0 : [];

        var x1, y1, x2, y2, x1m, y1m, x2m, y2m, bz1, bz2;
        var si, sj, i, j;
        var inter;

        for (i = 0; i < length1; i++) {
            si = segments1[i];
            if (si[0] == 'M') {
                x1 = x1m = si[1];
                y1 = y1m = si[2];
            } else {
                if (si[0] == 'C') {
                    bz1 = Graph.curve([['M', x1, y1], si]);
                    x1 = bz1.x();
                    y1 = bz1.y();
                } else {
                    bz1 = Graph.curve([['M', x1, y1], ['C', x1, y1, x1m, y1m, x1m, x1m]]);
                    x1 = x1m;
                    y1 = y1m;
                }

                for (j = 0; j < length2; j++) {
                    sj = segments2[j];
                    if (sj[0] == 'M') {
                        x2 = x2m = sj[1];
                        y2 = y2m = sj[2];
                    } else {
                        if (sj[0] == 'C') {
                            bz2 = Graph.curve([['M', x2, y2], sj]);
                            x2 = bz2.x();
                            y2 = bz2.y();
                        } else {
                            bz2 = Graph.curve([['M', x2, y2],['C', x2, y2, x2m, y2m, x2m, y2m]]);
                            x2 = x2m;
                            y2 = y2m;
                        }

                        if (number) {
                            result += bz1.intersectnum(bz2);
                        } else {
                            inter = bz1.intersection(bz2);
                            for (var k = 0, kk = inter.length; k < kk; k++) {
                                inter[k].props.segment1 = i;
                                inter[k].props.segment2 = j;
                                inter[k].bezier1 = bz1;
                                inter[k].bezier2 = bz2;
                            }
                            result = result.concat(inter);
                        }
                    }
                }
            }
        }

        return result;
    }

    ///////// STATIC /////////
    
    Graph.lang.Path.toString = function() {
        return "function(command)";
    };  

    ///////// SHORTCUT /////////
    
    Graph.path = function(command) {
        return new Graph.lang.Path(command);
    };

    ///////// LANGUAGE CHECK /////////
    
    Graph.isPath = function(obj) {
        return obj instanceof Graph.lang.Point;
    };

}());