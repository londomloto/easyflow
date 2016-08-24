
/**
 * Lodash polyfill
 */
(function(){
    var global = this;

    _.int = parseInt;
    _.float = parseFloat;

    _.format = function() {
        var params = _.toArray(arguments),
            format = params.shift();
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof params[number] != 'undefined'
                ? params[number]
                : match;
        });
    }

    _.isIE = function() {
        var na = global.navigator,
            ua = (na && na.userAgent || '').toLowerCase(),
            ie = ua.indexOf('MSIE ');

        if (ie > 0 || !!ua.match(/Trident.*rv\:11\./)) {
            return parseInt(ua.substring(ie + 5, ua.indexOf('.', ie)));
        }
        return false;
    };
}());

/**
 * Graph core
 */
(function(_){
    var REGEX_PATH_CMD = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        REGEX_PATH_VAL = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig,
        REGEX_TRAN_CMD = /((matrix|translate|rotate|scale|skewX|skewY)\((\-?\d+\.?\d*e?\-?\d*[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+\))+/g,
        REGEX_TRAN_SUB = /[\w\.\-]+/g,
        GLOBAL = this;

    GLOBAL.Graph = GLOBAL.Graph || {};
    
    // declare consts
    _.extend(Graph, {
        XMLNS_SVG: 'http://www.w3.org/2000/svg',
        XMLNS_XLINK: 'http://www.w3.org/1999/xlink',
        SVG_VERSION: '1.1'
    });

    _.extend(Graph, {
        version: '1.0.0',
        cached: {},

        ns: function(namespace) {
            var parts = _.split(namespace, '.'),
                parent = GLOBAL,
                len = parts.length,
                current,
                i;

            for (i = 0; i < len; i++) {
                current = parts[i];
                parent[current] = parent[current] || {};
                parent = parent[current];
            }

            return parent;
        },

        factory: function(clazz, args) {
            args = [clazz].concat(args);
            return new (Function.prototype.bind.apply(clazz, args));
        },

        expand: function(target, source, scope) {
            var tproto = target.constructor.prototype,
                sproto = source.constructor.prototype;

            scope = _.defaultTo(source);

            _.forOwn(sproto, function(value, key){
                if (_.isFunction(value) && _.isUndefined(tproto[key])) {
                    (function(key, value){
                        tproto[key] = _.bind(value, scope);
                    }(key, value));    
                }
            });
        },

        mixin: function(target, source) {
            this.extend(target, source, target);
        },

        lookup: function(/* tag, ...tokens */) {
            var args = _.toArray(arguments),
                tag = args.shift(),
                token = _.join(args, '|'),
                cached = Graph.cached[tag] = Graph.cached[tag] || {};

            if (cached[token]) {
                cached[token].credit = 100;
            } else {
                cached[token] = {
                    credit: 100
                }
            }

            _.debounce(function(){
                _.forOwn(cached, function(v, k){
                    if (k != token) {
                        cached[k].credit--;
                        if ( ! cached[k]) {
                            delete cached[k];
                        }
                    }
                });
            });

            return cached[token];
        },

        memoize: function(func) {
            return function memo() {
                var param = _.toArray(arguments),
                    token = _.join(param, "\u2400"),
                    cache = memo.cache = memo.cache || {},
                    saved = memo.saved = memo.saved || [];

                if ( ! _.isUndefined(cache[token])) {
                    for (var i = 0, ii = saved.length; i < ii; i++) {
                        if (saved[i] == token) {
                            saved.push(saved.splice(i, 1)[0]);
                            break;
                        }
                    }
                    return cache[token];
                }

                if (saved.length >= 1e3) {
                    delete cache[saved.shift()];
                }

                saved.push(token);
                cache[token] = func.apply(this, param);

                return cache[token];
            }
        } 
    });

    /**
     * Element (jQuery)
     */
    _.extend(Graph, {
        $: $,
        doc: document
    });

    /**
     * Math
     */
    _.extend(Graph, {
        deg: function(rad) {
            return Math.round ((rad * 180 / Math.PI % 360) * 1000) / 1000;
        },  
        /**
         * Convert degree to radian
         */
        rad: function(deg) {
            return deg % 360 * Math.PI / 180;
        }
    });

    /**
     * Lang
     */
    _.extend(Graph, {
        extend: function(clazz, props) {
            if (_.isPlainObject(clazz)) {
                props = clazz;
                clazz = Graph.lang.Class;
            }
            return clazz.extend(props);
        },
        point: function(x, y) {
            return new Graph.lang.Point(x, y);
        },
        path: function(paths) {
            return new Graph.lang.Path(paths);
        },
        matrix: function(a, b, c, d, e, f) {
            return new Graph.lang.Matrix(a, b, c, d, e, f);
        }
    });


    /**
     * Vector
     */
    _.extend(Graph, {
        vector: function(type, attrs) {
            var vector = new Graph.svg.Vector(type, attrs);
            return vector;
        },
        paper: function() {
            var args = _.toArray(arguments);
            args.unshift(Graph.svg.Paper);
            return new (Function.prototype.bind.apply(Graph.svg.Paper, args));
        },
        find: function(selector, context) {
            var elems = Graph.$(selector, context),
                items = [];
            
            elems.each(function(i, dom){
                var vector = Graph.$(dom).data('vector');
                vector && items.push(vector);
            });

            return new Graph.svg.Collection(items);
        },
        /**
         * Convert path command into paths (segments)
         */
        cmd2path: function(command) {
            if ( ! command) {
                return null;
            }

            var cached = Graph.lookup('Graph', 'cmd2path', command),
                sizes = {a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0},
                paths = [];
            
            if (cached.paths) {
                return _.cloneDeep(cached.paths);
            }

            command.replace(REGEX_PATH_CMD, function(match, cmd, val){
                var 
                    params = [],
                    name = cmd.toLowerCase();

                val.replace(REGEX_PATH_VAL, function(match, v){
                    if (v) {
                        params.push(+v);
                    }
                });

                if (name == 'm' && params.length > 2) {
                    paths.push(_.concat([cmd], params.splice(0, 2)));
                    name = 'l';
                    cmd = cmd == 'm' ? 'l' : 'L';
                }

                if (name == 'r') {
                    paths.push(_.concat([cmd], params));
                } else while (params.length >= sizes[name]) {
                    paths.push(_.concat([cmd], params.splice(0, sizes[name])));
                    if ( ! sizes[name]) {
                        break;
                    }
                }
            });
            
            cached.paths = paths;
            return paths;
        },
        cmd2transform: Graph.memoize(function(command) {
            var valid = {
                matrix: true,
                translate: true,
                rotate: true,
                scale: true,
                skewX: true,
                skewY: true
            };

            var transform = [],
                matches = command.match(REGEX_TRAN_CMD);

            if (matches) {
                _.forEach(matches, function(sub){
                    var args = sub.match(REGEX_TRAN_SUB),
                        name = args.shift();
                    if (valid[name]) {
                        args = _.map(args, function(v){ return +v; })
                        transform.push([name].concat(args));    
                    }
                });  
            }

            return transform;
        }),
        /**
         * Convert catmull-rom to bezier segment
         * https://advancedweb.hu/2014/10/28/plotting_charts_with_svg/
         */
        catmull2bezier: function(dots, z) {
            var segments = [],
                def = _.defaultTo;

            for (var i = 0, ii = dots.length; ii - 2 * !z > i; i += 2) {
                var p = [
                    {x: def(dots[i - 2], 0), y: def(dots[i - 1], 0)},
                    {x: def(dots[i], 0),     y: def(dots[i + 1], 0)},
                    {x: def(dots[i + 2], 0), y: def(dots[i + 3], 0)},
                    {x: def(dots[i + 4], 0), y: def(dots[i + 5], 0)}
                ];  

                if (z) {
                    if (!i) {
                        p[0] = {x: def(dots[ii - 2], 0), y: def(dots[ii - 1], 0)};
                    } else if (ii - 4 == i) {
                        p[3] = {x: def(dots[0], 0), y: def(dots[1], 0)};
                    } else if (ii - 2 == i) {
                        p[2] = {x: def(dots[0], 0), y: def(dots[1], 0)};
                        p[3] = {x: def(dots[2], 0), y: def(dots[3], 0)};
                    }
                } else {
                    if (ii - 4 == i) {
                        p[3] = p[2];
                    } else if (!i) {
                        p[0] = {x: def(dots[i], 0), y: def(dots[i + 1], 0)};
                    }
                }

                segments = [
                    (-p[0].x + 6 * p[1].x + p[2].x) / 6,
                    (-p[0].y + 6 * p[1].y + p[2].y) / 6,
                    ( p[1].x + 6 * p[2].x - p[3].x) / 6,
                    ( p[1].y + 6 * p[2].y - p[3].y) / 6,
                    p[2].x,
                    p[2].y
                ];
            }

            return segments;
        },

        line2curve: function(x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },

        quad2curve: function(x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3, _23 = 2 / 3;
            return [
                _13 * x1 + _23 * ax,
                _13 * y1 + _23 * ay,
                _13 * x2 + _23 * ax,
                _13 * y2 + _23 * ay,
                x2,
                y2
            ];
        },

        arc2curve: function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            var 
                _120 = Math.PI * 120 / 180,
                rad = Math.PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = Graph.memoize(function (x, y, rad) {
                    var X = x * Math.cos(rad) - y * Math.sin(rad),
                        Y = x * Math.sin(rad) + y * Math.cos(rad);
                    return {x: X, y: Y};
                });

            if ( ! recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = Math.cos(Math.PI / 180 * angle),
                    sin = Math.sin(Math.PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                if (h > 1) {
                    h = Math.sqrt(h);
                    rx = h * rx;
                    ry = h * ry;
                }
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = Math.asin(((y1 - cy) / ry).toFixed(9)),
                    f2 = Math.asin(((y2 - cy) / ry).toFixed(9));

                f1 = x1 < cx ? Math.PI - f1 : f1;
                f2 = x2 < cx ? Math.PI - f2 : f2;
                f1 < 0 && (f1 = Math.PI * 2 + f1);
                f2 < 0 && (f2 = Math.PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - Math.PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - Math.PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (Math.abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * Math.cos(f2);
                y2 = cy + ry * Math.sin(f2);
                res = Graph.arc2curve(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = Math.cos(f1),
                s1 = Math.sin(f1),
                c2 = Math.cos(f2),
                s2 = Math.sin(f2),
                t = Math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];

            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];

            if (recursive) {
                return [m2, m3, m4].concat(res);
            } else {
                res = [m2, m3, m4].concat(res).join().split(",");
                var result = [];
                for (var i = 0, ii = res.length; i < ii; i++) {
                    result[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return result;
            }
        },

        curvebox: Graph.memoize(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var 
                a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + Math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - Math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            Math.abs(t1) > "1e12" && (t1 = .5);
            Math.abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = finddot(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = finddot(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + Math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - Math.sqrt(b * b - 4 * a * c)) / 2 / a;
            Math.abs(t1) > "1e12" && (t1 = .5);
            Math.abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = finddot(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = finddot(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            return {
                min: {x: _.min(x), y: _.min(y)},
                max: {x: _.max(x), y: _.max(y)}
            };

            //////
            
            function finddot(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
                var t1 = 1 - t;
                return {
                    x: Math.pow(t1, 3) * p1x + Math.pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + Math.pow(t, 3) * p2x,
                    y: Math.pow(t1, 3) * p1y + Math.pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + Math.pow(t, 3) * p2y
                };
            }
        })
    });

    Graph.ns('Graph.lang');
    Graph.ns('Graph.svg');
    Graph.ns('Graph.shape');
    Graph.ns('Graph.util');

}(_));