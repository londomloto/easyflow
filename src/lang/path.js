
(function(){

    var REGEX_PATH_STR = /,?([achlmqrstvxz]),?/gi;
    
    var Path = Graph.lang.Path = Graph.extend({

        __CLASS__: 'Graph.lang.Path',
        
        paths: [],

        constructor: function(paths) {
             if (_.isString(paths)) {
                paths = Graph.cmd2path(paths);
             }
             this.paths = paths;
        },

        absolute: function() {
            if ( ! this.paths.length) {
                return new Path([['M', 0, 0]]);
            }

            var cached = Graph.lookup(this.__CLASS__, 'absolute', this.toString()),
                paths = this.paths;

            if (cached.absolute) {
                return cached.absolute;
            }

            var result = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;

            if (paths[0][0] == 'M') {
                x = +paths[0][1];
                y = +paths[0][2];
                mx = x;
                my = y;
                start++;
                result[0] = ['M', x, y];
            }

            var z = paths.length == 3 && 
                    paths[0][0] == 'M' && 
                    paths[1][0].toUpperCase() == 'R' && 
                    paths[2][0].toUpperCase() == 'Z';
            
            for (var dots, seg, itm, i = start, ii = paths.length; i < ii; i++) {
                result.push(seg = []);
                itm = paths[i];

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

        relative: function() {
            var cached = Graph.lookup(this.__CLASS__, 'relative', this.toString()),
                paths = this.paths;

            if (cached.relative) {
                return cached.relative;
            }

            var result = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;

            if (paths[0][0] == 'M') {
                x = paths[0][1];
                y = paths[0][2];
                mx = x;
                my = y;
                start++;
                result.push(['M', x, y]);
            }

            for (var i = start, ii = paths.length; i < ii; i++) {
                var seg = result[i] = [], itm = paths[i];

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
            
            var p1 = _.cloneDeep(this.absolute().paths),
                p2 = to && _.cloneDeep((new Path(to)).absolute().paths),
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

            /////// 
            
            /**
             * @param  Array    segment  segment
             * @param  Object   attr  attribute
             * @param  String   prev  previous toString
             * @return Array        paths
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

            function fixarc(paths, i) {
                if (paths[i].length > 7) {
                    paths[i].shift();
                    var pi = paths[i];

                    while (pi.length) {
                        com1[i] = 'A';
                        p2 && (com2[i] = 'A');
                        paths.splice(i++, 0, ['C'].concat(pi.splice(0, 6)));
                    }
                    
                    paths.splice(i, 1);
                    ii = _.max([p1.length, p2 && p2.length || 0]);
                }
            }

            function fixmove(paths1, paths2, a1, a2, i) {
                if (paths1 && paths2 && paths1[i][0] == 'M' && paths2[i][0] != 'M') {
                    paths2.splice(i, 0, ['M', a2.x, a2.y]);
                    a1.bx = 0;
                    a1.by = 0;
                    a1.x = paths1[i][1];
                    a1.y = paths1[i][2];
                    ii = _.max([p1.length, p2 && p2.length || 0]);
                }
            }

        },

        bbox: function(){
            if ( ! this.paths.length) {
                return new Graph.lang.BBox({x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0});
            }

            var cached = Graph.lookup(this.__CLASS__, 'bbox', this.toString());

            if (cached.bbox) {
                return cached.bbox;
            }

            var paths = this.curve().paths,
                x = 0,
                y = 0,
                X = [],
                Y = [],
                p;

            for (var i = 0, ii = paths.length; i < ii; i++) {
                p = paths[i];
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
                bbox = {
                    x: xmin,
                    y: ymin,
                    x2: xmax,
                    y2: ymax,
                    width: width,
                    height: height,
                    cx: xmin + width / 2,
                    cy: ymin + height / 2
                };

            cached.bbox = new Graph.lang.BBox(bbox);
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

            var paths = _.cloneDeep(this.curve().paths);
            var x, y, i, ii, j, jj, seg;
            
            for (i = 0, ii = paths.length; i < ii; i++) {
                seg = paths[i];
                for (j = 1, jj = seg.length; j < jj; j += 2) {
                    x = matrix.x(seg[j], seg[j + 1]);
                    y = matrix.y(seg[j], seg[j + 1]);
                    seg[j] = x;
                    seg[j + 1] = y;
                }
            }
            
            cached.transform = new Path(paths);
            return cached.transform;
        },

        toString: function() {
            return _.join(this.paths, ',').replace(REGEX_PATH_STR, '$1');
        },

        toArray: function() {
            return this.paths;
        },

        clone: function() {
            var paths = _.cloneDeep(this.paths);
            return new Path(paths);
        }
    });
    
}());