
//////////////////////////////////////////////////////////////////
/*
 * Graph - SVG Library
 * Documentation visit: https://github.com/londomloto/graph
 *
 * @author londomloto <roso.sasongko@gmail.com>
 * @author londomloto <roso@kct.co.id>
 */
//////////////////////////////////////////////////////////////////

/**
 * Lodash polyfill
 */
(function(){
    var global = this;

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

    _.insert = function(array, index, insert) {
        Array.prototype.splice.apply(array, [index, 0].concat(insert));
        return array;
    };

    /**
     * Array move (swap)
     * http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another/5306832#5306832
     */
    _.move = function(array, from, to) {
        var size = array.length;
        
        while(from < 0) {
            from += size;
        }
        
        while(to < 0) {
            to += size;
        }

        if (to >= size) {
            var k = to - size;
            while((k--) + 1) {
                array.push(undefined);
            }
        }

        array.splice(to, 0, array.splice(from, 1)[0]);
        return array;
    };

    /**
     * Array permutation
     * https://github.com/lodash/lodash/issues/1701
     */
    _.permute = function(array, permuter) {
        if(_.isFunction(permuter)) {
            return _.reduce(array, function(result, value, key){
                result[permuter(key, value)] = value;
                return result;
            }, []);
        } else if (_.isArray(permuter)) {
            return _.reduce(permuter, function(result, value, key){
                result[key] = array[permuter[key]];
                return result;
            }, []);
        }
        return array;
    };  

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
(function(){

    var REGEX_PATH_STR = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig;

    var REGEX_PATH_VAL = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig;

    var REGEX_TRAN_STR = /((matrix|translate|rotate|scale|skewX|skewY)*\((\-?\d+\.?\d*e?\-?\d*[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+\))+/g;

    var REGEX_TRAN_SUB = /[\w\.\-]+/g;
    
    var REGEX_POLY_STR = /(\-?[0-9.]+)\s*,\s*(\-?[0-9.]+)/g;

    var REGEX_PATH_CMD = /,?([achlmqrstvxz]),?/gi;
    
    var DOCUMENT = document;

    var GLOBAL = this;

    GLOBAL.Graph = GLOBAL.Graph || function(config) {};
    
    Graph.VERSION = '1.0.0';
    
    Graph.AUTHOR = 'PT. Kreasindo Cipta Teknologi';
    
    _.extend(Graph, {
        config: {
            base: 'easyflow/',
            svg: {
                version: '1.1'
            },
            xmlns: {
                svg: 'http://www.w3.org/2000/svg',
                xlink: 'http://www.w3.org/1999/xlink',
                html: 'http://www.w3.org/1999/xhtml'
            },
            font: {
                family: 'Segoe UI',
                size: '12px',
                line: 1
            }
        }
    });

    _.extend(Graph, {
        cached: {},
        setup: function(name, value) {
            if (_.isPlainObject(name)) {
                _.extend(Graph.config, name);
            } else {
                Graph.config[name] = value;
            }
        },
        toString: function() {
            return 'Graph SVG Library presented by Kreasindo Cipta Teknologi';
        }
    });

    _.extend(Graph, {
        isHTML: function(obj) {
            return obj instanceof HTMLElement;
        },
        isSVG: function(obj) {
            return obj instanceof SVGElement;
        },
        isElement: function(obj) {
            return obj instanceof Graph.dom.Element;
        }
    });

    _.extend(Graph, {
        ns: function(namespace) {
            var cached = Graph.lookup('Graph', 'ns', namespace);

            if (cached.clazz) {
                return cached.clazz;
            }

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

            if (_.isFunction(parent)) {
                cached.clazz = parent;
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

            _.debounce(function(t){
                _.forOwn(cached, function(v, k){
                    if (k != t) {
                        cached[k].credit--;
                        if (cached[k].credit <= 0) {
                            delete cached[k];
                        }
                    }
                });
            })(token);

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
     * Expand namespaces
     */
    Graph.ns('Graph.lang');
    Graph.ns('Graph.dom');
    Graph.ns('Graph.collection');
    Graph.ns('Graph.svg');
    Graph.ns('Graph.svg.fn');
    Graph.ns('Graph.router');
    Graph.ns('Graph.util');
    Graph.ns('Graph.plugin');
    Graph.ns('Graph.shape');
    Graph.ns('Graph.shape.common');
    Graph.ns('Graph.shape.activity');
    
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
        },
        
        /**
         * Angle
         */
        angle: function(x1, y1, x2, y2) {
            var dx = x1 - x2,
                dy = y1 - y2;

            if ( ! dx && ! dy) {
                return 0;
            }

            return (180 + Math.atan2(-dy, -dx) * 180 / Math.PI + 360) % 360;
        },

        /**
         * Angle at quadrant
         */
        theta: function(x1, y1, x2, y2) {
            var y = -(y2 - y1),
                x =   x2 - x1;

            var r, d;

            if (y.toFixed(10) == 0 && x.toFixed(10) == 0) {
                r = 0;
            } else {
                r = Math.atan2(y, x);
            }
            
            if (r < 0) {
                r = 2 * Math.PI + r;
            }

            d = 180 * r / Math.PI;

            // normalize
            d = (d % 360) + (d < 0 ? 360 : 0);

            return d;
        },

        /**
         * Get hypotenuse (magnitude) of triangle
         */
        magnitude: function(a, b) {
            return Math.sqrt(a * a + b * b);
        },
        
        /**
         * Get sign of number
         */
        sign: function(num) {
            return num < 0 ? -1 : 1;
        },
        
        quadrant: function(x, y) {
            return x >= 0 && y >= 0 ? 1 : (x >= 0 && y < 0 ? 4 : (x < 0 && y < 0 ? 3 : 2));
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
        bbox: function(bbox) {
            return new Graph.lang.BBox(bbox);
        },
        path: function(command) {
            return new Graph.lang.Path(command);
        },
        curve: function(command) {
            return new Graph.lang.Curve(command);
        },
        matrix: function(a, b, c, d, e, f) {
            return new Graph.lang.Matrix(a, b, c, d, e, f);
        }
    });


    /**
     * Vector
     */
    _.extend(Graph, {
        get: function(element) {
            return Graph.$(element).data('vector');
        },
        
        paper: function() {
            var args = _.toArray(arguments);
            return Graph.factory(Graph.svg.Paper, args);
        },

        page: function() {
            var args = _.toArray(arguments);
            return Graph.factory(Graph.shape.Page, args);
        },
        
        find: function(selector, context) {
            var elems = Graph.$(selector, context),
                items = [];
            
            elems.each(function(i, dom){
                var vector = Graph.$(dom).data('vector');
                vector && items.push(vector);
            });

            return new Graph.collection.Vector(items);
        },

        polygon2dots: function(command) {
            var array = [];
            command.replace(REGEX_POLY_STR, function($0, x, y){
                array.push([_.float(x), _.float(y)]);
            });
            return array;
        },

        polygon2path: function(command) {
            var dots = Graph.polygon2dots(command);

            if ( ! dots.length) {
                return 'M0,0';
            }
            
            var command = 'M' + dots[0][0] + ',' + dots[0][1];

            for (var i = 1, ii = dots.length; i < ii; i++) {
                command += 'L' + dots[i][0] + ',' + dots[i][1] + ',';
            }
            
            command  = command.substring(0, command.length - 1);
            command += 'Z';

            return command;
        },

        seg2cmd: function(segments) {
            return _.join(segments, ',').replace(REGEX_PATH_CMD, '$1');
        },

        /**
         * Convert path command into segments
         */
        cmd2seg: function(command) {
            if ( ! command) {
                return null;
            }

            var cached = Graph.lookup('Graph', 'cmd2seg', command),
                sizes = {a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0},
                segments = [];
            
            if (cached.segments) {
                return _.cloneDeep(cached.segments);
            }

            command.replace(REGEX_PATH_STR, function(match, cmd, val){
                var 
                    params = [],
                    name = cmd.toLowerCase();

                val.replace(REGEX_PATH_VAL, function(match, v){
                    if (v) {
                        params.push(+v);
                    }
                });

                if (name == 'm' && params.length > 2) {
                    segments.push(_.concat([cmd], params.splice(0, 2)));
                    name = 'l';
                    cmd = cmd == 'm' ? 'l' : 'L';
                }

                if (name == 'r') {
                    segments.push(_.concat([cmd], params));
                } else while (params.length >= sizes[name]) {
                    segments.push(_.concat([cmd], params.splice(0, sizes[name])));
                    if ( ! sizes[name]) {
                        break;
                    }
                }
            });
            
            cached.segments = segments;
            return segments;
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

            command += '';

            var transform = [],
                matches = command.match(REGEX_TRAN_STR);

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

        /**
         * Convert line to curve
         */
        line2curve: function(x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },

        /**
         * Convert quadratic to curve
         */
        quad2curve: function(x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3, 
                _23 = 2 / 3;
                
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

        })

    });

    ///////// HELPER /////////
    
    function finddot(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t;
        return {
            x: Math.pow(t1, 3) * p1x + Math.pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + Math.pow(t, 3) * p2x,
            y: Math.pow(t1, 3) * p1y + Math.pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + Math.pow(t, 3) * p2y
        };
    }

}());

(function(){
    
    var initializing = false;
    var tokenizer = /xyz/.test(function(){ xyz; }) ? /\$super/ : /.*/;
    var Class = Graph.lang.Class = function() {};
    
    Class.extend = function extend(config) {
        var $super, proto, name, value, defs;
        
        $super = this.prototype;
        defs = {};
        
        initializing = true;
        proto = new this();
        initializing = false;
        

        for (var name in config) {
            value = config[name];
            if ( ! _.isFunction(value)) {
                proto[name] = defs[name] = value;
            } else {
                proto[name] = _.isFunction($super[name]) && tokenizer.test(value)
                    ? (function(name, value){
                        return function() {
                            var tmp, ret;
                            tmp = this.$super;
                            this.$super = $super[name];
                            ret = value.apply(this, _.toArray(arguments));
                            this.$super = tmp;
                        
                            return ret;
                        };
                    }(name, value)) : value;
            }
        }

        var clazz, init;

        if ( ! _.isUndefined(proto.constructor)) {
            init = proto.constructor;
            delete proto.constructor;
        }

        clazz = function () {
            var me = this,
                ct = me.constructor;
            
            me.listeners = {};

            if (me.superclass.defs) {
                _.forOwn(me.superclass.defs, function(v, k){
                    me[k] = _.cloneDeep(v);
                });
            }

            _.forOwn(ct.defs, function(v, k){
                me[k] = _.cloneDeep(v);
            });
            
            if ( ! initializing) {
                init && init.apply(me, _.toArray(arguments));
            }
        }

        // statics
        clazz.extend = extend;
        clazz.defs = defs;
        clazz.version = '1.0.0';
        clazz.author = 'londomloto';

        // instance
        clazz.prototype = proto;
        clazz.prototype.constructor = clazz;
        clazz.prototype.superclass = $super.constructor;

        /**
         * Register event handler
         */
        clazz.prototype.on = function(name, handler) {
            var me = this, data;

            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    me.on(k, v);
                });
                return me;
            }

            var part = _.split(name, '.'),
                fire = part.shift();

            me.listeners[fire] = me.listeners[fire] || [];
            
            data = {
                name: name,
                orig: handler,
                func: _.bind(handler, this)
            };

            me.listeners[fire].push(data);
            return this;
        };

        /**
         * Unregister event handler
         */
        clazz.prototype.off = function(name, handler) {
            var part, fire, lsnr, rgex;

            part = _.split(name, '.');
            rgex = new RegExp(_.escapeRegExp(name), 'gi');
            fire = part.shift();
            lsnr = fire ? (this.listeners[fire] || []) : [];

            if (lsnr.length) {
                for (var i = lsnr.length - 1; i >= 0; i--) {
                    if (handler) {
                        if (rgex.test(lsnr[i].name) && lsnr[i].orig === handler) {
                            this.listeners[fire].splice(i, 1);
                        }
                    } else {
                        if (rgex.test(lsnr[i].name)) {
                            this.listeners[fire].splice(i, 1);
                        }
                    }
                }
            } else {
                var me = this;
                for (fire in me.listeners) {
                    (function(lsnr){
                        for (var i = lsnr.length - 1; i >= 0; i--) {
                            if (handler) {
                                if (rgex.test(lsnr[i].name) && lsnr[i].orig === handler) {
                                    lsnr.splice(i, 1);
                                }
                            } else {
                                if (rgex.test(lsnr[i].name)) {
                                    lsnr.splice(i, 1);
                                }
                            }
                        }
                    }(me.listeners[fire]))
                }
            }

            rgex = null;
            return this;
        };

        /**
         * Execute event handler
         */
        clazz.prototype.fire = function(/* name, param1, param2, ...paramN */) {
            var args = _.toArray(arguments),
                name = args.shift(),
                part = _.split(name, '.'),
                fire = part.shift(),
                lsnr = this.listeners[fire] || [],
                rgex = new RegExp(_.escapeRegExp(name), 'gi');
            
            if (lsnr.length) {
                _.forEach(lsnr, function(data){
                    if (fire != name) {
                        if (rgex.test(data.name)){
                            data.func.apply(data.func, args);    
                        }
                    } else {
                        data.func.apply(data.func, args);
                    }
                });
            }

            rgex = null;
        };

        /**
         * Get default properties (attached on class)
         */
        clazz.prototype.defprop = function(prop) {
            var defs = this.constructor.defs || {};
            return defs[prop];
        };

        return clazz;
    };

}());

(function(){

    var Matrix = Graph.lang.Matrix = Graph.extend({

        props: {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: 0,
            f: 0    
        },

        constructor: function(a, b, c, d, e, f) {
            this.props.a = _.defaultTo(a, 1);
            this.props.b = _.defaultTo(b, 0);
            this.props.c = _.defaultTo(c, 0);
            this.props.d = _.defaultTo(d, 1);
            this.props.e = _.defaultTo(e, 0);
            this.props.f = _.defaultTo(f, 0);
        },

        x: function(x, y) {
            return x * this.props.a + y * this.props.c + this.props.e;
        },

        y: function(x, y) {
            return x * this.props.b + y * this.props.d + this.props.f;
        },

        get: function(chr) {
            return +this.props[chr].toFixed(4);
        },

        multiply: function(a, b, c, d, e, f) {
            var 
                result = [[], [], []],
                source = [
                    [this.props.a, this.props.c, this.props.e], 
                    [this.props.b, this.props.d, this.props.f], 
                    [0, 0, 1]
                ],
                matrix = [
                    [a, c, e], 
                    [b, d, f], 
                    [0, 0, 1]
                ];

            var x, y, z, tmp;

            if (a instanceof Matrix) {
                matrix = [
                    [a.props.a, a.props.c, a.props.e], 
                    [a.props.b, a.props.d, a.props.f], 
                    [0, 0, 1]
                ];
            }

            for (x = 0; x < 3; x++) {
                for (y = 0; y < 3; y++) {
                    tmp = 0;
                    for (z = 0; z < 3; z++) {
                        tmp += source[x][z] * matrix[z][y];
                    }
                    result[x][y] = tmp;
                }
            }

            this.props.a = result[0][0];
            this.props.b = result[1][0];
            this.props.c = result[0][1];
            this.props.d = result[1][1];
            this.props.e = result[0][2];
            this.props.f = result[1][2];

            return this;
        },

        invert: function(clone) {
            var x = this.props.a * this.props.d - this.props.b * this.props.c;
            var a, b, c, d, e, f;

            clone = _.defaultTo(clone, false);

            a =  this.props.d / x;
            b = -this.props.b / x;
            c = -this.props.c / x;
            d =  this.props.a / x;
            e = (this.props.c * this.props.f - this.props.d * this.props.e) / x;
            f = (this.props.b * this.props.e - this.props.a * this.props.f) / x;

            if (clone) {
                return new Graph.matrix(a, b, c, d, e, f);
            } else {
                this.props.a = a;
                this.props.b = b;
                this.props.c = c;
                this.props.d = d;
                this.props.e = e;
                this.props.f = f;    

                return this;
            }
        },

        translate: function(x, y) {
            x = _.defaultTo(x, 0);
            y = _.defaultTo(y, 0);
            this.multiply(1, 0, 0, 1, x, y);

            return this;
        },

        rotate: function(angle, cx, cy) {
            angle = Graph.rad(angle);
            cx = _.defaultTo(cx, 0);
            cy = _.defaultTo(cy, 0);

            var cos = +Math.cos(angle).toFixed(9),
                sin = +Math.sin(angle).toFixed(9);

            this.multiply(cos, sin, -sin, cos, cx, cy);
            this.multiply(1, 0, 0, 1, -cx, -cy);

            return this;
        },

        scale: function(sx, sy, cx, cy) {
            y = _.defaultTo(sy, sx);

            if (cx || cy) {
                cx = _.defaultTo(cx, 0);
                cy = _.defaultTo(cy, 0);
            }

            (cx || cy) && this.multiply(1, 0, 0, 1, cx, cy);
            this.multiply(sx, 0, 0, sy, 0, 0);
            (cx || cy) && this.multiply(1, 0, 0, 1, -cx, -cy);
            
            return this;
        },
        
        determinant: function() {
            return this.props.a * this.props.d - this.props.b * this.props.c;
        },

        delta: function(x, y) {
            return {
                x: x * this.props.a + y * this.props.c + 0,
                y: x * this.props.b + y * this.props.d + 0
            };
        },

        data: function() {
            var px = this.delta(0, 1),
                py = this.delta(1, 0),
                skewX = 180 / Math.PI * Math.atan2(px.y, px.x) - 90,
                radSkewX = Graph.rad(skewX),
                cosSkewX = Math.cos(radSkewX),
                sinSkewX = Math.sin(radSkewX),
                scaleX = Graph.magnitude(this.props.a, this.props.b),
                scaleY = Graph.magnitude(this.props.c, this.props.d),
                radian = Graph.rad(skewX);

            if (this.determinant() < 0) {
                scaleX = -scaleX;
            }

            return {
                x: this.props.e,
                y: this.props.f,
                dx: (this.props.e * cosSkewX + this.props.f *  sinSkewX) / scaleX,
                dy: (this.props.f * cosSkewX + this.props.e * -sinSkewX) / scaleY,
                skewX: -skewX,
                skewY: 180 / Math.PI * Math.atan2(py.y, py.x),
                scaleX: scaleX,
                scaleY: scaleY,
                rotate: skewX,
                rad: radian,
                sin: Math.sin(radian),
                cos: Math.cos(radian),
                a: this.props.a,
                b: this.props.b,
                c: this.props.c,
                d: this.props.d,
                e: this.props.e,
                f: this.props.f
            };
        },

        /**
         * Convert to `matrix(...)` toString
         */
        toString: function() {
            var array = [
                this.get('a'),
                this.get('b'),
                this.get('c'),
                this.get('d'),
                this.get('e'),
                this.get('f')
            ];

            return 'matrix(' + _.join(array, ',') + ')';
        },

        toFilter: function() {
            return "progid:DXImageTransform.Microsoft.Matrix(" + 
               "M11=" + this.get('a') + ", " + 
               "M12=" + this.get('c') + ", " + 
               "M21=" + this.get('b') + ", " + 
               "M22=" + this.get('d') + ", " + 
               "Dx="  + this.get('e') + ", " + 
               "Dy="  + this.get('f') + ", " + 
               "sizingmethod='auto expand'"  + 
            ")";
        },

        toArray: function() {
            return [
                [this.get('a'), this.get('c'), this.get('e')], 
                [this.get('b'), this.get('d'), this.get('f')], 
                [0, 0, 1]
            ];
        },

        clone: function() {
            return new Matrix(
                this.props.a, 
                this.props.b, 
                this.props.c, 
                this.props.d, 
                this.props.e, 
                this.props.f
            );
        }

    });
    
}());

(function(){
    
    var Point = Graph.lang.Point = Graph.extend({

        props: {
            x: 0,
            y: 0
        },

        constructor: function(x, y) {
            if (_.isString(x)) {
                var c = _.split(_.trim(x), ',');
                x = _.toNumber(c[0]);
                y = _.toNumber(c[1]);
            }

            this.props.x = x;
            this.props.y = y;
        },

        distance: function(b) {
            var dx = this.props.x - b.props.x,
                dy = this.props.y - b.props.y;

            return Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2));
        },

        /**
         * Manhattan (taxi-cab) distance
         */
        manhattan: function(p) {
            return Math.abs(p.props.x - this.props.x) + Math.abs(p.props.y - this.props.y);
        },

        /**
         * Angle to another point
         */
        angle: function(b) {
            return Graph.angle(this.props.x, this.props.y, b.props.x, b.props.y);
        },
        
        /**
         * Angle created by two another points
         */
        triangle: function(b, c) {
            return this.angle(c) - b.angle(c);
        },

        theta: function(p) {
            return Graph.theta(this.props.x, this.props.y, p.props.x, p.props.y);
        },

        difference: function(p) {
            return new Point(this.props.x - p.props.x, this.props.y - p.props.y);
        },

        /**
         * Snap to grid
         */
        snap: function(x, y) {
            y = _.defaultTo(y, x);

            this.props.x = snap(this.props.x, x);
            this.props.y = snap(this.props.y, y);

            return this;
        },

        expand: function(dx, dy) {
            this.props.x += dx;
            this.props.y += dy;

            return this;
        },

        equals: function(p) {
            return this.props.x === p.props.x && this.props.y === p.props.y;
        },

        stringify: function(sep) {
            sep = _.defaultTo(sep, ',');
            return this.props.x + sep + this.props.y;
        },

        toString: function() {
            return this.stringify();
        },

        serialize: function() {
            return {
                x: this.props.x, 
                y: this.props.y
            };
        },

        clone: function(){
            return new Point(this.props.x, this.props.y);
        }
    });

    ///////// HELPER /////////
    
    function snap(value, size) {
        return size * Math.round(value / size);
    }
    
}());

(function(){

    var Path = Graph.lang.Path = Graph.extend({

        __CLASS__: 'Graph.lang.Path',
        
        paths: [],
        segments: [],

        constructor: function(command) {
            var segments = [];
            
            if (command instanceof Path) {
                segments = _.cloneDeep(command.segments);
            } else if (_.isArray(command)) {
                segments = _.clone(command);
            } else {
                segments = Graph.cmd2seg(command);
            }

            this.segments = segments;
            this.paths = this.segments;
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
                return new Graph.lang.BBox({x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0});
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

            var cached = Graph.lookup(this.__CLASS__, 'transform', this + '', matrix + '');

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
                        point = c.pointAt(length - l, c.t(length - l));
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
                        point = c.pointAt(length - l, c.t(length - l));
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
    
}());

(function(){
    
    var BBox = Graph.lang.BBox = Graph.extend({
        
        props: {
            // origin
            x: 0,
            y: 0,

            // corner
            x2: 0,
            y2: 0,

            // dimension
            width: 0,
            height: 0
        },

        constructor: function(bbox) {
            this.props = _.cloneDeep(bbox);
        },
        
        data: function(name, value) {
            if (_.isUndefined(name) && _.isUndefined(value)) {
                return this.props;
            }

            if (_.isUndefined(value)) {
                return this.props[name];
            }

            return null;
        },
        
        x: function() {
            return this.props.x;
        },
        
        y: function() {
            return this.props.y;
        },
        
        origin: function() {
            return new Graph.lang.Point(this.props.x, this.props.y);
        },

        center: function() {
            return new Graph.lang.Point(
                this.props.x + this.props.width / 2,
                this.props.y + this.props.height / 2
            );
        },

        corner: function() {
            return new Graph.lang.Point(
                this.props.x + this.props.width, 
                this.props.y + this.props.height
            );
        },
        
        width: function() {
            return this.props.width;
        },
        
        height: function() {
            return this.props.height;
        },
        
        clone: function() {
            return new BBox(_.cloneDeep(this.props));
        },

        contain: function(obj) {
            var contain = true,
                bbox = this.props,
                dots = [];

            var vbox, papa, mat, dot;

            if (obj instanceof Graph.lang.Point) {
                dots = [
                    [obj.props.x, obj.props.y]
                ];
            } else if (obj instanceof Graph.svg.Vector) {
                dots = obj.dots(true);
            } else if (obj instanceof Graph.lang.BBox) {
                dots = [
                    [obj.props.x, obj.props.y],
                    [obj.props.x2, obj.props.y2]
                ];
            } else {
                var args = _.toArray(arguments);
                if (args.length === 2) {
                    dots = [args];
                }
            }

            if (dots.length) {
                var l = dots.length;
                while(l--) {
                    dot = dots[l];
                    contain = dot[0] >= bbox.x  && 
                              dot[0] <= bbox.x2 && 
                              dot[1] >= bbox.y  && 
                              dot[1] <= bbox.y2;
                    if ( ! contain) {
                        break;
                    }
                }
            }

            return contain;
        },

        expand: function(dx, dy, dw, dh) {
            this.props.x += _.defaultTo(dx, 0);
            this.props.y += _.defaultTo(dy, 0);
            this.props.width  += _.defaultTo(dw, 0);
            this.props.height += _.defaultTo(dh, 0);

            return this;
        },

        intersect: function(tbox) {
            var me = this,
                bbox = me.props,
                func = me.contain;

            return tbox.contain(bbox.x, bbox.y)
                || tbox.contain(bbox.x2, bbox.y)
                || tbox.contain(bbox.x, bbox.y2)
                || tbox.contain(bbox.x2, bbox.y2)
                || me.contain(tbox.x, tbox.y)
                || me.contain(tbox.x2, tbox.y)
                || me.contain(tbox.x, tbox.y2)
                || me.contain(tbox.x2, tbox.y2)
                || (bbox.x < tbox.x2 && bbox.x > tbox.x || tbox.x < bbox.x2 && tbox.x > bbox.x)
                && (bbox.y < tbox.y2 && bbox.y > tbox.y || tbox.y < bbox.y2 && tbox.y > bbox.y);
        }
    });

}());

(function(){
    /**
     * Legendre Gauss (Quadratic Curve)
     * https://pomax.github.io/bezierinfo/legendre-gauss.html
     */
    var LG_N = 12,

        // abscissae
        LG_T = [
           -0.1252,
            0.1252,
           -0.3678,
            0.3678,
           -0.5873,
            0.5873,
           -0.7699,
            0.7699,
           -0.9041,
            0.9041,
           -0.9816,
            0.9816
        ],
        // weights
        LG_C = [
            0.2491,
            0.2491,
            0.2335,
            0.2335,
            0.2032,
            0.2032,
            0.1601,
            0.1601,
            0.1069,
            0.1069,
            0.0472,
            0.0472
        ];

    Graph.lang.Curve = Graph.extend({
        segments: [],
        
        constructor: function(command) {
            this.segments = _.isString(command) ? Graph.cmd2seg(command) : _.cloneDeep(command);
            
            if (this.segments[0][0] != 'M') {
                this.segments.unshift(
                    ['M', this.segments[0][1], this.segments[0][2]]
                );
            }

            if (this.segments.length === 1 && this.segments[0][0] === 'M') {
                var x = this.segments[0][1],
                    y = this.segments[0][2];
                this.segments.push(['C', x, y, x, y, x, y]);
            }
        },
        
        length: function(t) {
            
            t = _.defaultTo(t, 1);
            t = t > 1 ? 1 : t < 0 ? 0 : t;

            var h = t / 2, 
                s = this.segments,
                x1 = s[0][1],
                y1 = s[0][2],
                x2 = s[1][1],
                y2 = s[1][2],
                x3 = s[1][3],
                y3 = s[1][4],
                x4 = s[1][5],
                y4 = s[1][6],
                sum = 0;

            for (var i = 0; i < LG_N; i++) {
                var ct = h * LG_T[i] + h,

                    xb = poly(ct, x1, x2, x3, x4),
                    yb = poly(ct, y1, y2, y3, y4),
                    co = xb * xb + yb * yb;

                sum += LG_C[i] * Math.sqrt(co);
            }

            return h * sum;
        },

        t: function(length) {
            if (length < 0 || this.length() < length) {
                return;
            }

            var t = 1,
                step = t / 2,
                t2 = t - step,
                l,
                e = .01;

            l = this.length(t2);

            while (Math.abs(l - length) > e) {
                step /= 2;
                t2 += (l < length ? 1 : -1) * step;
                l = this.length(t2);
            }

            return t2;
        },

        pointAt: function(length, t) {
            var arr = this.segments,
                p1x = arr[0][1],
                p1y = arr[0][2],
                c1x = arr[1][1],
                c1y = arr[1][2],
                c2x = arr[1][3],
                c2y = arr[1][4],
                p2x = arr[1][5],
                p2y = arr[1][6];

            var t1 = 1 - t,
                t13 = Math.pow(t1, 3),
                t12 = Math.pow(t1, 2),
                t2 = t * t,
                t3 = t2 * t,
                x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
                y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
                mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
                my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
                nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
                ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
                ax = t1 * p1x + t * c1x,
                ay = t1 * p1y + t * c1y,
                cx = t1 * c2x + t * p2x,
                cy = t1 * c2y + t * p2y,
                alpha = (90 - Math.atan2(mx - nx, my - ny) * 180 / Math.PI);
            
            (mx > nx || my < ny) && (alpha += 180);

            if (isNaN(x) || isNaN(y)) {
                return null;
            }

            var point = Graph.point(x, y);
            
            _.extend(point, {
                m: {x: mx, y: my},
                n: {x: nx, y: ny},
                start: {x: ax, y: ay},
                end: {x: cx, y: cy},
                alpha: alpha
            });

            return point;
        }
    });

    ///////// HELPER /////////
            
    function poly(t, n1, n2, n3, n4) {
        var t1 = -3 * n1 + 9 * n2 -  9 * n3 + 3 * n4,
            t2 =  t * t1 + 6 * n1 - 12 * n2 + 6 * n3;
        return t * t2 - 3 * n1 + 3 * n2;
    }

}());

(function(){
    
    var E = Graph.dom.Element = function(elem) {
        this.elem = elem instanceof jQuery ? elem : $(elem);
    };

    _.extend(E.prototype, {
        node: function() {
            return this.elem[0];
        },
        attr: function(name, value) {
            var me = this, node = this.elem[0];

            if (Graph.isHTML(node)) {
                this.elem.attr(name, value);
            } else if (Graph.isSVG(node)) {

                if (_.isPlainObject(name)) {
                    _.forOwn(name, function(v, k){
                        me.attr(k, v);
                    });
                    return this;
                }

                if (name.substring(0, 6) == 'xlink:') {
                    node.setAttributeNS(Graph.config.xmlns.xlink, name.substring(6), _.toString(value));
                } else {
                    node.setAttribute(name, _.toString(value));
                }
            }

            return this;
        },
        width: function(value) {
            if (_.isUndefined(value)) {
                return this.elem.width();
            }
            this.elem.width(value);
            return this;
        },
        height: function(value) {
            if (_.isUndefined(value)) {
                return this.elem.height();
            }
            this.elem.height(value);
            return this;
        },
        show: function() {
            this.elem.show();
            return this;
        },
        hide: function() {
            this.elem.hide();
            return this;
        },
        offset: function() {
            return this.elem.offset();
        },
        position: function() {
            return this.elem.position();
        },
        addClass: function(classes) {
            var node = this.elem[0];
            if (Graph.isHTML(node)) {
                this.elem.addClass(classes);
            }
            return this;
        },
        removeClass: function(classes) {
            var node = this.elem[0];
            if (Graph.isHTML(node)) {
                this.elem.removeClass(classes);
            }
            return this;
        },
        hasClass: function(clazz) {
            var node = this.elem[0];

            if (Graph.isHTML(node)) {
                return this.elem.hasClass(clazz); 
            } else if (Graph.isSVG(node)) {
                var classes = _.split(node.className.baseVal, ' ');
                return classes.indexOf(clazz) > -1;
            }

            return false;
        },
        append: function(elem) {
            if (Graph.isElement(elem)) {
                this.elem.append(elem.elem);
            } else {
                this.elem.append(elem);
            }
            
            return this;
        },
        prepend: function(elem) {
            if (Graph.isElement(elem)) {
                this.elem.prepend(elem.elem);
            } else {
                this.elem.prepend(elem);
            }
            return this;
        },
        appendTo: function(elem) {
            if (Graph.isElement(elem)) {
                this.elem.appendTo(elem.elem);
            } else {
                this.elem.appendTo(elem);
            }
            return this;
        },
        on: function(types, selector, data, fn, /*INTERNAL*/ one) {
            this.elem.on.call(this.elem, types, selector, data, fn, one);
            return this;
        },
        off: function(types, selector, fn) {
            this.elem.off.call(this.elem, types, selector, fn);
            return this;
        }
    });
    
    var borrows = [
        'css', 
        'prop', 'data', 
        'each', 'hover', 'empty', 'remove',
        'trigger', 'scrollTop', 'scrollLeft', 'html',
        'text'
    ];

    _.forEach(borrows, function(method) {
        (function(method){
            E.prototype[method] = function() {
                var args = _.toArray(arguments), value;
                value = this.elem[method].apply(this.elem, args);
                return value instanceof jQuery ? this : value;
            };
        }(method));
    });

    /// SHORTHAND ///

    Graph.$ = function(selector, context) {
        return new Graph.dom.Element($(selector, context));
    };

    Graph.$svg = function(type) {
        var node = document.createElementNS(Graph.config.xmlns.svg, type);
        return new Graph.dom.Element($(node));
    };

    Graph.doc = function() {
        return document;
    };

}());

(function(){

    var guid = 0;

    var Vector = Graph.svg.Vector = Graph.lang.Class.extend({

        type: '',
        canvas: null,
        dirty: false,

        transformer: null,
        collector: null,
        history: null,
        dragger: null,
        dropper: null,
        resizer: null,
        sorter: null,
        linker: null,

        rendered: false,

        tree: {
            next: null,
            prev: null,
            parent: null,
            children: null
        },

        props: {
            text: '',
            rotate: 0,
            collectable: true,
            selectable: true,
            selected: false,
            focusable: false
        },

        attrs: {
            'stroke': '#4A4D6E',
            'stroke-width': 1,
            'fill': 'none',
            'style': '',
            'class': ''
        },

        /**
         * Available events
         */
        events: {
            render: true,
            transform: true,
            resize: true,
            reset: true,
            select: true,
            deselect: true,
            collect: true,
            decollect: true,
            dragstart: true,
            dragmove: true,
            dragend: true
        },
        
        constructor: function(type, attrs) {
            var me = this;

            me.cached = {
                touchedBBox: null,
                pristinBBox: null,
                position: null,
                offset: null
            };

            me.matrix = Graph.matrix();

            me.tree.children = new Graph.collection.Vector();
            
            me.tree.children.on({
                push: _.bind(me.onAppendChild, me),
                pull: _.bind(me.onRemoveChild, me),
                unshift: _.bind(me.onPrependChild, me)
            });

            me.type = type;
            me.elem = Graph.$(Graph.doc().createElementNS(Graph.config.xmlns.svg, type));
            me.elem.data('vector', me);

            attrs = _.extend({
                'id': 'graph-node-' + (++guid)
            }, me.attrs, attrs || {});

            // apply initial attributes
            me.attr(attrs);

            me.transformer = new Graph.plugin.Transformer(me);
            // me.history = new Graph.plugin.History(me);

            me.transformer.on({
                transform: _.bind(me.onTransform, me)
            });

        },

        id: function() {
            return this.attrs.id;
        },

        reset: function() {
            this.matrix = Graph.matrix();
            this.removeAttr('transform');
            this.props.angle = 0;
            this.dirty = true;

            this.fire('reset', this.props);
        },

        resizable: function(config) {
            if ( ! this.resizer) {
                this.resizer = new Graph.plugin.Resizer(this, config);
                this.resizer.on({
                    resize: _.bind(this.onResizerResize, this)
                });
            }
            return this.resizer;
        },

        draggable: function(config) {
            if ( ! this.dragger) {
                this.dragger = new Graph.plugin.Dragger(this, config);

                this.dragger.on({
                    dragstart: _.bind(this.onDraggerStart, this),
                    dragmove: _.bind(this.onDraggerMove, this),
                    dragend: _.bind(this.onDraggerEnd, this)
                });
            }
            return this.dragger;
        },

        droppable: function() {
            if ( ! this.dropper) {
                this.dropper = new Graph.plugin.Dropper(this);
            }
            return this.dropper;
        },

        sortable: function(config) {
            if ( ! this.sorter) {
                this.sorter = new Graph.plugin.Sorter(this, config);
            }
            return this.Snapper;
        },

        linkable: function(config) {
            if ( ! this.network) {
                this.network = new Graph.plugin.Network(this, config);
            }
            return this.network;
        },

        collectable: function(value) {
            if (_.isUndefined(value)) {
                return this.props.collectable;
            }
            this.props.collectable = value;
            return this;
        },

        selectable: function(value) {
            if (_.isUndefined(value)) {
                return this.props.selectable;
            }
            this.props.selectable = value;
            return this;
        },

        clickable: function(value) {
            var me = this;

            if (_.isUndefined(value)) {
                return me.attrs['pointer-events'];
            }
            
            if (value) {
                this.attr('pointer-events', '');
            } else {
                this.attr('pointer-events', 'none');
            }
            
            return this;
        },

        node: function() {
            return this.elem.node();
        },

        /**
         * Object properties
         */
        data: function(name, value) {
            var me = this;

            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    me.props[k] = v;
                });
                return this;
            }

            if (_.isUndefined(name) && _.isUndefined(value)) {
                return me.props;
            }

            if (_.isUndefined(value)) {
                return me.props[name];
            }

            me.props[name] = value;
            return this;
        },

        /**
         * Element properties
         */
        attr: function(name, value) {
            var me = this, node = me.node();

            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    me.attr(k, v);
                });
                return me;
            }

            if (_.isUndefined(name)) {
                return me.attrs;
            }

            if (_.isUndefined(value)) {
                return me.attrs[name] || '';
            }

            me.attrs[name] = value;

            if (name.substring(0, 6) == 'xlink:') {
                node.setAttributeNS(Graph.config.xmlns.xlink, name.substring(6), _.toString(value));
            } else if (name == 'class') {
                node.className.baseVal = _.toString(value);
            } else {
                node.setAttribute(name, _.toString(value));
            }

            return me;
        },

        removeAttr: function(name) {
            this.node().removeAttribute(name);

            if (this.attrs[name]) {
                delete this.attrs[name];
            }
            return this;
        },

        style: function(name, value) {
            var me = this;
            
            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    me.style(k, v);
                });
                return this;
            }

            this.elem.css(name, value);
            return this;
        },

        hasClass: function(predicate) {
            return _.indexOf(_.split(this.attrs['class'], ' '), predicate) > -1;
        },

        addClass: function(added) {
            var classes = _.trim(
                _.join(
                    _.uniq(
                        _.concat(
                            _.split(this.attrs['class'], ' '),
                            _.split(added, ' ')
                        )
                    ),
                    ' '
                )
            );

            this.attr('class', classes);
            return this;
        },

        removeClass: function(removed) {
            var classes = _.split(this.attrs['class'], ' ');
            _.pullAll(classes, _.split(removed, ' '));
            this.attr('class', _.join(classes, ' '));
            return this;
        },

        hide: function() {
            this.elem.hide();
        },

        show: function() {
            this.elem.show();
        },

        pathinfo: function() {
            return new Graph.lang.Path([]);
        },

        vertices: function() {
            return [];
        },

        dots: function(absolute) {
            var ma, pa, ps, dt;

            absolute = _.defaultTo(absolute, false);

            pa = this.pathinfo().transform((absolute ? this.ctm() : this.matrix));
            ps = pa.segments;
            dt = [];

            _.forEach(ps, function(seg){
                var x, y;
                if (seg[0] != 'Z') {
                    x = seg[seg.length - 2];
                    y = seg[seg.length - 1];
                    dt.push([x, y]);
                }
            });

            return dt;
        },

        dotval: function(x, y) {
            var mat = this.matrix;
            return {
                x: mat.x(x, y), 
                y: mat.y(x, y)
            };
        },

        dimension: function() {
            var size = {},
                node = this.node();
                     
            try {
                size = node.getBBox();
            } catch(e) {
                size = {
                    x: node.clientLeft,
                    y: node.clientTop,
                    width: node.clientWidth,
                    height: node.clientHeight
                };
            } finally {
                size = size || {};
            }

            return size;
        },

        offset: function(flush) {

            flush = _.defaultTo(flush, true);

            if (this.dirty || _.isNull(this.cached.offset)) {
                var node = this.node(),
                    bbox = node.getBoundingClientRect();

                if (flush) {
                    this.dirty = false;
                }

                this.cached.offset = {
                    top: bbox.top,
                    left: bbox.left,
                    bottom: bbox.bottom,
                    right: bbox.right,
                    width: bbox.width,
                    height: bbox.height
                };
            }

            return this.cached.offset;
        },

        position: function(flush) {

            flush = _.defaultTo(flush, true);

            if (this.dirty || _.isNull(this.cached.position)) {
                
                var node = this.node(),
                    nbox = node.getBoundingClientRect(),
                    pbox = bbox(node);
                
                if (flush) {
                    this.dirty = false;
                }

                this.cached.position = {
                    top:    nbox.top    - pbox.top,
                    left:   nbox.left   - pbox.left,
                    bottom: nbox.bottom - pbox.top,
                    right:  nbox.right  - pbox.left,
                    width:  nbox.width,
                    height: nbox.height
                };
            }
            
            return this.cached.position;
        },

        ctm: function() {
            var ctm = this.node().getCTM();
            return ctm ? Graph.matrix(ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f) : this.matrix;
        },

        bbox: function(pristin, flush) {
            var path, bbox;

            pristin = _.defaultTo(pristin, false);
            flush   = _.defaultTo(flush, true);

            if (pristin) {
                bbox = this.cached.pristinBBox;
                if (this.dirty || ! bbox) {
                    path = this.pathinfo();
                    bbox = this.cached.pristinBBox = path.bbox();
                    flush && (this.dirty = false);
                }
            } else {
                bbox = this.cached.touchedBBox;
                if (this.dirty || ! bbox) {
                    path = this.pathinfo().transform(this.matrix);
                    bbox = this.cached.touchedBBox = path.bbox();
                    flush && (this.dirty = false);
                }
            }
            
            path = null;
            return bbox;
        },

        find: function(selector) {
            var elems = this.elem.find(selector),
                vectors = [];

            elems.each(function(i, node){
                vectors.push($(node).data('vector'));
            });

            return new Graph.collection.Vector(vectors);
        },

        holder: function() {
            return this.isCanvas()
                ? Graph.$(this.node().parentNode) 
                : Graph.$(this.canvas.node().parentNode);
        },
        
        append: function(vector) {
            vector.render(this, 'append');
            return vector;
        },

        prepend: function(vector) {
            vector.render(this, 'prepend');
            return vector;
        },

        render: function(parent, method) {
            var me = this, collectable = me.props.collectable;
            
            if (me.rendered) {
                return me;
            }

            parent = _.defaultTo(parent, me.canvas);
            method = _.defaultTo(method, 'append');

            if (parent) {
                
                me.canvas = parent.isCanvas() ? parent : parent.canvas;
                me.tree.parent = parent;

                switch(method) {
                    case 'append':
                        parent.elem.append(me.elem);
                        
                        if (collectable) {
                            parent.children().push(me);
                        }

                        break;

                    case 'prepend':
                        parent.elem.prepend(me.elem);

                        if (collectable) {
                            parent.children().unshift(me);
                        }

                        break;
                }

                // broadcast
                if (parent.rendered) {

                    me.rendered = true;
                    me.dirty = true;
                    me.fire('render', me);

                    me.cascade(function(c){
                        if (c !== me && ! c.rendered) {
                            c.rendered = true;
                            c.canvas = me.canvas;
                            c.fire('render', c);
                        }
                    });
                }
            }

            return me;
        },

        paper: function() {
            return this.isCanvas() ? this : this.canvas;
        },

        children: function() {
            return this.tree.children;
        },

        ancestors: function() {
            var me = this, ancestors = [], papa;
            
            while((papa = me.parent()) && ! papa.isCanvas()) {
                ancestors.push(papa);
                papa = papa.parent();
            }

            return new Graph.collection.Vector(ancestors);
        },

        descendants: function() {
            var me = this, descendants = [];
            
            me.cascade(function(v){
                if (v !== me) {
                    descendants.push(v);
                }
            });

            return new Graph.collection.Vector(descendants);
        },

        parent: function() {
            return this.tree.parent;
        },

        prev: function() {
            return this.tree.prev;
        },
        
        next: function() {
            return this.tree.next;
        },

        cascade: function(handler) {
            var me = this;
            cascade(me, handler);
        },

        remove: function() {
            this.elem.remove();
            return this;
        },

        empty: function() {
            this.elem.empty();
            return this;
        },

        select: function() {
            this.addClass('graph-selected');
            this.props.selected = true;
            this.fire('select', this);
            return this;
        },

        deselect: function() {
            this.removeClass('graph-selected');
            this.props.selected = false;
            this.fire('deselect', this);
            return this;
        },

        transform: function(command) {
            return this.transformer.transform(command);
        },

        translate: function(dx, dy) {
            return this.transformer.translate(dx, dy);
        },

        scale: function(sx, sy, cx, cy) {
            return this.transformer.scale(sx, sy, cx, cy);
        },

        rotate: function(deg, cx, cy) {
            return this.transformer.rotate(deg, cx, cy);
        },

        /**
         * Global matrix
         */
        globalMatrix: function() {
            var native = this.node().getCTM();

            if (native) {
                return Graph.matrix(
                    native.a,
                    native.b,
                    native.c,
                    native.d,
                    native.e,
                    native.f
                );
            } else {
                return Graph.matrix();
            }
        },

        screenMatrix: function() {
            var native = this.node().getScreenCTM();

            return Graph.matrix(
                native.a,
                native.b,
                native.c,
                native.d,
                native.e,
                native.f
            );
        },

        /**
         * Difference matrix between local and global
         */
        deltaMatrix: function() {
            
        },

        backward: function() {

        },

        forward: function() {
            var papa = this.parent();
            if (papa) {
                papa.elem.append(this.node());
            }
        },

        front: function() {
            if ( ! this.canvas) {
                return this;
            }
            this.canvas.elem.append(this.node());
            return this;
        },  

        back: function() {
            if ( ! this.canvas) {
                return this;
            }
            this.canvas.elem.prepend(this.node());
            return this;
        },

        focus: function(state) {
            var canvas = this.canvas, timer;
            if (canvas && canvas.spotlight) {
                state = _.defaultTo(state, true);
                timer = _.delay(function(vector, state){
                    clearTimeout(timer);
                    canvas.spotlight.focus(vector, state);
                }, 0, this, state);
            }
        },

        resize: function(sx, sy, cx, cy, dx, dy) {
            return this;
        },

        isGroup: function() {
            return this.type == 'g';
        },

        isCanvas: function() {
            return this instanceof Graph.svg.Paper;
        },

        isCollectable: function() {
            return this.props.collectable;
        },  

        isSelectable: function() {
            return this.props.selectable;
        },

        isDraggable: function() {
            return this.dragger ? true : false;
        },

        isResizable: function() {
            return this.props.resizable;
        },

        onResizerResize: function(e, p) {
            this.dirty = true;
            this.fire('resize', e, this);
        },

        onDraggerStart: function(e, p) {
            var me = this;

            // forward event
            e.dragger = p;
            me.fire('dragstart', e, me);

            if (me.$collector) {
                me.$collector.syncDragStart(me, e);
            }
        },

        onDraggerMove: function(e, p) {
            // forward event
            e.dragger = p;
            this.fire('dragmove', e, this);

            if (this.$collector) {
                this.$collector.syncDragMove(this, e);
            }
        },

        onDraggerEnd: function(e, p) {
            this.dirty = true;

            // forward event
            e.dragger = p;
            this.fire('dragend', e, this);

            if (this.$collector) {
                this.$collector.syncDragEnd(this, e);
            }
        },

        onTransform: function(e, p) {
            this.dirty = true;

            if (e.rotate) {
                this.props.angle = e.rotate.deg;
                this.props.rotate = e.rotate.deg;
            }

            // forward event
            this.fire('transform', e, this);
        },

        onAppendChild: function(child) {
            // forward
            this.fire('appendchild', child, this);
        },

        onRemoveChild: function(child) {
            // forward
            this.fire('removechild', child, this);
        },

        onPrependChild: function(child) {
            // forwad
            this.fire('prependchild', child, this);
        }

    });
    
    ///////// HELPERS /////////
    
    function cascade(vector, handler) {
        var child = vector.children().items;

        if (vector.props.collectable) {
            handler.call(vector, vector);    
        }
        
        if (child.length) {
            _.forEach(child, function(c){
                cascade(c, handler);
            });    
        }
    }

    function bbox(node) {
        if (node.parentNode) {
            if (node.parentNode.nodeName == 'svg') {
                return node.parentNode.getBoundingClientRect();
            }
            return bbox(node.parentNode);
        }

        return {
            top: 0,
            left: 0
        };  
    }

}());

(function(){

    Graph.svg.Paper = Graph.svg.Vector.extend({

        attrs: {
            'class': 'graph-paper'
        },

        props: {
            text: '',
            angle: 0,
            collectable: false,
            selectable: false,
            selected: false,
            focusable: false
        },

        canvas: null,
        hinter: null,
        definer: null,
        collector: null,
        container: null,
        scroller: null,
        pointer: null,
        linker: null,

        constructor: function(width, height) {
            var me = this;

            me.$super('svg', {
                'xmlns': Graph.config.xmlns.svg,
                'xmlns:link': Graph.config.xmlns.xlink,
                'version': Graph.config.svg.version,
                'width': _.defaultTo(width, 200),
                'height': _.defaultTo(height, 200)
            });

            me.style({
                overflow: 'hidden',
                position: 'relative'
            });

            me.collector = new Graph.util.Collector();
            me.definer = new Graph.util.Definer();
            me.linker = new Graph.util.Linker();
            me.router = new Graph.util.Router();
            me.spotlight = new Graph.util.Spotlight();
            me.hinter = null; // new Graph.util.Hinter();

            me.definer.defineArrowMarker('marker-arrow');

            me.elem.on({
                click: function(e) {
                    me.fire('click', e, me);
                }
            });
        },
        
        shape: function(name, config) {
            var clazz, shape;

            clazz = _.capitalize(name);
            shape = new Graph.shape[clazz](config);
            shape.render(this.elem);

            return shape;
        },

        render: function(target) {
            var me = this;

            if (me.rendered) {
                return;
            }

            target = Graph.$(target);
            target.append(me.elem);
            
            me.container = target;

            me.definer.render(me);
            me.collector.render(me);
            me.linker.render(me);
            me.router.render(me);
            me.spotlight.render(me);
            // me.hinter.render(me);

            me.attr({
                width: target.width(),
                height: target.height()
            });

            me.rendered = true;
            me.fire('render');

            me.cascade(function(c){
                if (c !== me && ! c.rendered) {
                    c.canvas = me;
                    c.fire('render', c);
                }
            });
        },

        autoScroll: function(target) {
            this.scroller = Graph.$(target);
        }

    });

    var vectors = {
        ellipse: 'Ellipse',
        circle: 'Circle',
        rect: 'Rect',
        path: 'Path',
        polygon: 'Polygon',
        group: 'Group',
        text: 'Text',
        image: 'Image',
        line: 'Line',
        connector: 'Connector'
    };

    _.forOwn(vectors, function(name, method){
        (function(name, method){
            Graph.svg.Paper.prototype[method] = function() {
                var args, clazz, vector;

                args   = _.toArray(arguments);
                clazz  = Graph.svg[name];
                vector = Graph.factory(clazz, args);
                vector.canvas = this;

                return vector;
            };
        }(name, method));
    });

}());

(function(){

    Graph.svg.Circle = Graph.svg.Vector.extend({

        attrs: {
            // 'stroke': '#696B8A',
            // 'stroke-width': 1,
            // 'fill': '#ffffff',
            'style': '',
            'class': 'graph-elem graph-elem-circle'
        },
        
        constructor: function(cx, cy, r) {
            var me = this;

            me.$super('circle', {
                cx: cx,
                cy: cy,
                r: r
            });

        },

        pathinfo: function() {
            var a = this.attrs;
            
            return Graph.path([
                ['M', a.cx, a.cy],
                ['m', 0, -a.r],
                ['a', a.r, a.r, 0, 1, 1, 0,  2 * a.r],
                ['a', a.r, a.r, 0, 1, 1, 0, -2 * a.r],
                ['z']
            ]);
        },
        
        resize: function(sx, sy, cx, cy, dx, dy) {
            var matrix = this.matrix.clone(),
                rotate = this.props.rotate,
                ax = this.attrs.cx,
                ay = this.attrs.cy,
                ar = this.attrs.r;

            var x, y, r;
            
            if (sy === 1) {
                r  = ar * sx;
                sy = sx;
            } else if (sx === 1) {
                r  = ar * sy;
                sx = sy;
            } else if (sx < sy) {
                r = ar * sy;
                sx = sy;
            } else if (sx > sy) {
                r  = ar * sx;
                sy = sx;
            }

            matrix.scale(sx, sy, cx, cy);

            x = matrix.x(ax, ay);
            y = matrix.y(ax, ay);

            this.reset();

            this.attr({
                cx: x,
                cy: y,
                 r: r
            });
            
            if (rotate) {
                this.rotate(rotate, x, y).apply();    
            }

            return {
                matrix: matrix,
                translate: {
                    dx: dx,
                    dy: dy
                },
                scale: {
                    sx: sx,
                    sy: sy,
                    cx: cx,
                    cy: cy
                },
                rotate: {
                    deg: rotate,
                    cx: x,
                    cy: y
                }
            };
        }
    });

}());

(function(){

    Graph.svg.Ellipse = Graph.svg.Vector.extend({
        attrs: {
            // 'stroke': '#696B8A',
            // 'stroke-width': 1,
            // 'fill': '#ffffff',
            // 'style': '',
            'class': 'graph-elem graph-elem-ellipse'
        },

        constructor: function(cx, cy, rx, ry) {
            this.$super('ellipse', {
                cx: cx,
                cy: cy,
                rx: rx,
                ry: ry
            });
        },

        pathinfo: function() {
            var a = this.attrs;

            return Graph.path([
                ['M', a.cx, a.cy],
                ['m', 0, -a.ry],
                ['a', a.rx, a.ry, 0, 1, 1, 0,  2 * a.ry],
                ['a', a.rx, a.ry, 0, 1, 1, 0, -2 * a.ry],
                ['z']
            ]);
        },
        
        resize: function(sx, sy, cx, cy, dx, dy) {
            var matrix = this.matrix.clone().scale(sx, sy, cx, cy),
                rotate = this.props.rotate;

            var mx = matrix.x(this.attrs.cx, this.attrs.cy),
                my = matrix.y(this.attrs.cx, this.attrs.cy),
                rx = this.attrs.rx * sx,
                ry = this.attrs.ry * sy;

            var gx, gy;

            this.reset();

            this.attr({
                cx: mx,
                cy: my,
                rx: rx,
                ry: ry
            });

            if (rotate) {
                this.rotate(rotate, mx, my).apply();    
            }

            var bb = this.bbox(false, false).data();

            gx = mx - rx - dx;
            gy = my - ry - dy;

            gx = bb.x;
            gy = bb.y;

            return  {
                matrix: matrix,
                translate: {
                    dx: dx,
                    dy: dy
                },
                scale: {
                    sx: sx,
                    sy: sy,
                    cx: cx,
                    cy: cy
                },
                rotate: {
                    deg: rotate,
                    cx: mx,
                    cy: my
                },
                magnify: {
                    cx: gx,
                    cy: gy
                }
            };
        }
    });

}());

(function(){

    Graph.svg.Group = Graph.svg.Vector.extend({

        attrs: {
            'class': 'graph-elem graph-elem-group'
        },
        
        constructor: function(x, y) {
            this.$super('g');

            if ( ! _.isUndefined(x) && ! _.isUndefined(y)) {
                this.matrix.translate(x, y);
                this.attr('transform', this.matrix.toString());
            }
        },

        pathinfo: function() {
            var size = this.dimension();

            return new Graph.lang.Path([
                ['M', size.x, size.y], 
                ['l', size.width, 0], 
                ['l', 0, size.height], 
                ['l', -size.width, 0], 
                ['z']
            ]);
        }
        
    });

}());

(function(){

    Graph.svg.Image = Graph.svg.Vector.extend({

        attrs: {
            preserveAspectRatio: 'none',
            class: 'graph-elem graph-elem-image'
        },

        constructor: function(src, x, y, width, height) {
            var me = this;

            me.$super('image', {
                'xlink:href': src,
                'x': _.defaultTo(x, 0),
                'y': _.defaultTo(y, 0),
                'width': _.defaultTo(width, 0),
                'height': _.defaultTo(height, 0)
            });
            
        },

        align: function(value, scale) {
            if (value == 'none') {
                this.attr('preserveAspectRatio', 'none');

                return this;
            }

            var aspect = this.attrs.preserveAspectRatio,
                align = '';

            aspect = /(meet|slice)/.test(aspect) 
                ? aspect.replace(/(.*)\s*(meet|slice)/gi, '$2')
                : '';

            scale = _.defaultTo(scale, aspect);
            value = value.replace(/s+/g, ' ').toLowerCase();

            switch(value) {
                case 'top left':
                case 'left top':
                    align = 'xMinYMin';
                    break;
                case 'top center':
                case 'center top':
                    align = 'xMidYMin';
                    break;
                case 'top right':
                case 'right top':
                    align = 'xMaxYMin';
                    break;
                case 'left':
                    align = 'xMinYMid';
                    break;
                case 'center':
                    align = 'xMidYMid';
                    break;
                case 'right':
                    align = 'xMaxYMid';
                    break;
                case 'bottom left':
                case 'left bottom':
                    align = 'xMinYMax';
                    break;
                case 'bottom center':
                case 'center bottom':
                    align = 'xMidYMax';
                    break;
                case 'bottom right':
                case 'right bottom':
                    align = 'xMaxYMax';
                    break;
            }

            aspect = align + (scale ? ' ' + scale : '');
            this.attr('preserveAspectRatio', aspect);

            return this;
        },

        pathinfo: function() {
            var a = this.attrs;

            return new Graph.lang.Path([
                ['M', a.x, a.y], 
                ['l', a.width, 0], 
                ['l', 0, a.height], 
                ['l', -a.width, 0], 
                ['z']
            ]);
        },
        
        resize: function(sx, sy, cx, cy, dx, dy) {
            var ms = this.matrix.clone().scale(sx, sy, cx, cy),
                ro = this.matrix.data().rotate;

            this.reset();

            var x = ms.x(this.attrs.x, this.attrs.y),
                y = ms.y(this.attrs.x, this.attrs.y),
                w = +this.attrs.width * sx,
                h = +this.attrs.height * sy;

            this.attr({
                x: x,
                y: y,
                width: w,
                height: h
            });
            
            this.rotate(ro, x, y).apply();

            return {
                matrix: ms,
                x: x,
                y: y
            };
        }
    });

}());

(function(){

    Graph.svg.Line = Graph.svg.Vector.extend({

        attrs: {
            // 'stroke': '#696B8A',
            // 'stroke-width': 1,
            // 'stroke-linecap': 'butt',
            'class': 'graph-elem graph-elem-line'
        },

        constructor: function(x1, y1, x2, y2) {
            this.$super('line', {
                x1: _.defaultTo(x1, 0),
                y1: _.defaultTo(y1, 0),
                x2: _.defaultTo(x2, 0),
                y2: _.defaultTo(y2, 0)
            });
        }

    });

}());

(function(){

    Graph.svg.Path = Graph.svg.Vector.extend({

        attrs: {
            // 'stroke': '#696B8A',
            // 'stroke-width': 1,
            // 'fill': 'none',
            'style': '',
            'class': 'graph-elem graph-elem-path'
        },

        constructor: function(d) {
            this.$super('path', {
                d: Graph.path(d).absolute() + ''
            });

            this.cached = {
                segments: null
            };
        },
        
        pathinfo: function() {
            return new Graph.lang.Path(this.attrs.d);
        },

        segments: function() {
            if (this.dirty || _.isNull(this.cached.segments)) {
                this.cached.segments = this.pathinfo().segments;
            }
            return this.cached.segments;
        },

        angle: function() {
            var segments = _.clone(this.segments()),
                max = segments.length - 1;

            if (segments[max][0] == 'Z') {
                max--;
                segments.pop();
            }

            if (segments.length === 1) {
                max++;
                segments.push(['L', segments[0][1], segments[0][2]]);
            }

            var dx = segments[max][1] - segments[max - 1][1],
                dy = segments[max][2] - segments[max - 1][2];

            return (180 + Math.atan2(-dy, -dx) * 180 / Math.PI + 360) % 360;
        },

        slice: function(from, to) {
            return this.pathinfo().slice(from, to);
        },

        pointAt: function(length) {
            return this.pathinfo().pointAt(length);
        },

        length: function() {
            return this.pathinfo().length();
        },
        
        startAt: function(x, y) {
            var segments = this.segments(), command;
            segments[0][1] = x;
            segments[0][2] = y;
            command = Graph.seg2cmd(segments);
            
            this.attr('d', command);
            this.dirty = true;

            return this;
        },

        stopAt: function(x, y) {
            var segments = this.segments(),
                count = segments.length,
                max = count - 1;

            var command;

            if (count === 1) {
                segments.push(['L', x, y]);
            } else {
                if (segments[max][0] == 'Z') {
                    segments[max - 1][1] = x;
                    segments[max - 1][2] = y;
                } else {
                    segments[max][1] = x;
                    segments[max][2] = y;
                }
            }

            this.attr('d', Graph.seg2cmd(segments));
            return this;
        },

        lineTo: function(x, y) {
            var segments = this.segments(), command;
            segments.push(['L', x, y]);
            command = Graph.seg2cmd(segments);
            
            this.attr('d', command);
            this.dirty = true;

            return this;
        },

        close: function() {
            var segments = this.segments,
                max = segments.length - 1;

            var command;

            if (segments[max][0] != 'Z') {
                segments.push(['Z']);
            }

            this.attr('d', Graph.seg2cmd(segments));
            return this;
        },

        expandBy: function(dx, dy) {
            var segments = this.segments(),
                count = segments.length,
                max = count - 1;

            var command, x, y;

            if (count === 1) {
                x = segments[0][1] + dx;
                y = segments[0][2] + dy;
                segments.push(['L', x, y]);
            } else {
                if (segments[max][0] == 'Z') {
                    segments[max - 1][1] += dx;
                    segments[max - 1][2] += dy;
                } else {
                    segments[max][1] += dx;
                    segments[max][2] += dy;
                }
            }

            command = Graph.seg2cmd(segments);
            this.attr('d', command);
            this.dirty = true;

            return this;
        },

        resize: function(sx, sy, cx, cy, dx, dy) {
            var ms = this.matrix.clone(),
                ro = this.matrix.data().rotate,
                rd = Graph.rad(ro),
                si = Math.sin(rd),
                co = Math.cos(rd),
                pa = this.pathinfo(),
                ps = pa.segments,
                rx = ps[0][1],
                ry = ps[0][2];

            if (ro) {
                ms.rotate(-ro, rx, ry);    
            }
            
            rx = ms.x(ps[0][1], ps[0][2]);
            ry = ms.y(ps[0][1], ps[0][2]);

            ms.scale(sx, sy, cx, cy);

            _.forEach(ps, function(seg){
                var ox, oy, nx, ny;
                if (seg[0] != 'Z') {
                    ox = seg[seg.length - 2];
                    oy = seg[seg.length - 1];

                    nx = ms.x(ox, oy);
                    ny = ms.y(ox, oy);
                    
                    seg[seg.length - 2] = nx;
                    seg[seg.length - 1] = ny;
                }
            });

            this.reset();
            
            this.attr('d', _.toString(pa));

            if (ro) {
                this.rotate(ro, rx, ry).apply(true);    
            }

            return {
                matrix: ms,
                x: rx,
                y: ry
            };
        }
    });

}());

(function(){

    Graph.svg.Polygon = Graph.svg.Vector.extend({
        
        attrs: {
            // 'stroke': '#696B8A',
            // 'stroke-width': 1,
            // 'fill': '#ffffff',
            'style': '',
            'class': 'graph-elem graph-elem-polygon'
        },

        constructor: function(points) {
            this.$super('polygon', {
                points: points
            });

            var me = this;

        },

        draggable: function(config) {
            this.$super(config);
        },

        pathinfo: function() {
            var command = Graph.polygon2path(this.attrs.points);
            return Graph.path(command);
        },
        
        resize: function(sx, sy, cx, cy, dx, dy) {
            var matrix = this.matrix.clone(),
                origin = this.matrix.clone(),
                rotate = this.props.rotate,
                ps = this.pathinfo().segments,
                dt = [],
                rx = ps[0][1],
                ry = ps[0][2];

            if (rotate) {
                origin.rotate(-rotate, ps[0][1], ps[0][2]); 
                rx = origin.x(ps[0][1], ps[0][2]);
                ry = origin.y(ps[0][1], ps[0][2]);
            }

            origin.scale(sx, sy, cx, cy);
            matrix.scale(sx, sy, cx, cy);

            _.forEach(ps, function(seg){
                var ox, oy, x, y;
                if (seg[0] != 'Z') {
                    ox = seg[seg.length - 2];
                    oy = seg[seg.length - 1];
                    x = origin.x(ox, oy);
                    y = origin.y(ox, oy);
                    dt.push(x + ',' + y);
                }
            });

            dt = _.join(dt, ' ');

            this.reset();
            this.attr('points', dt);

            if (rotate) {
                this.rotate(rotate, rx, ry).apply();
            }
            
            return {
                matrix: matrix,
                translate: {
                    dx: dx,
                    dy: dy
                },
                scale: {
                    sx: sx,
                    sy: sy,
                    cx: cx,
                    cy: cy
                },
                rotate: {
                    deg: rotate,
                    cx: rx,
                    cy: ry
                }
            };
        }
    });

}());

(function(){

    Graph.svg.Rect = Graph.svg.Vector.extend({

        attrs: {
            // 'stroke': '#333333',
            // 'stroke-width': 1,
            // 'fill': '#ffffff',
            'style': '',
            // 'shape-rendering': 'crispEdges',
            'class': 'graph-elem graph-elem-rect'
        },

        constructor: function(x, y, width, height, r) {
            var me = this;
            r = _.defaultTo(r, 0);

            me.$super('rect', {
                x: _.defaultTo(x, 0),
                y: _.defaultTo(y, 0),
                rx: r,
                ry: r,
                width: _.defaultTo(width, 0),
                height: _.defaultTo(height, 0)
            });
            
            me.origpath = me.pathinfo();
        },

        attr: function() {
            var args = _.toArray(arguments);

            this.$super.apply(this, args);
            this.attrs.r = this.attrs.rx;

            return this;
        },

        pathinfo: function() {
            var a = this.attrs;

            if (a.r) {
                return Graph.path([
                    ['M', a.x + a.r, a.y], 
                    ['l', a.width - a.r * 2, 0], 
                    ['a', a.r, a.r, 0, 0, 1, a.r, a.r], 
                    ['l', 0, a.height - a.r * 2], 
                    ['a', a.r, a.r, 0, 0, 1, -a.r, a.r], 
                    ['l', a.r * 2 - a.width, 0], 
                    ['a', a.r, a.r, 0, 0, 1, -a.r, -a.r], 
                    ['l', 0, a.r * 2 - a.height], 
                    ['a', a.r, a.r, 0, 0, 1, a.r, -a.r], 
                    ['z']
                ]);
            } else {
                return Graph.path([
                    ['M', a.x, a.y], 
                    ['l', a.width, 0], 
                    ['l', 0, a.height], 
                    ['l', -a.width, 0], 
                    ['z']
                ]);
            }
        },
        
        resize: function(sx, sy, cx, cy, dx, dy) {
            var matrix = this.matrix.clone(),
                rotate = this.props.rotate;

            var x, y, w, h;

            matrix.scale(sx, sy, cx, cy);

            this.reset();

            x = matrix.x(this.attrs.x, this.attrs.y);
            y = matrix.y(this.attrs.x, this.attrs.y);
            w = this.attrs.width  * sx;
            h = this.attrs.height * sy;

            this.attr({
                x: x,
                y: y,
                width: w,
                height: h
            });

            if (rotate) {
                this.rotate(rotate, x, y).apply();    
            }

            return {
                matrix: matrix,
                translate: {
                    dx: dx,
                    dy: dy
                },
                scale: {
                    sx: sx,
                    sy: sy,
                    cx: cx,
                    cy: cy
                },
                rotate: {
                    deg: rotate,
                    cx: x,
                    cy: y
                }
            };
        }
    });

}());

(function(){

    Graph.svg.Text = Graph.svg.Vector.extend({
        
        attrs: {
            // 'stroke': '#000000',
            // 'stroke-width': .05,
            // 'fill': '#000000',
            // 'font-size': '12px',
            // 'font-family': 'Arial',
            'text-anchor': 'middle',
            'class': 'graph-elem graph-elem-text'
        },  

        props: {
            text: '',
            angle: 0,
            lineHeight: 1,
            collectable: true,
            selectable: true,
            selected: false
        },

        rows: [],

        constructor: function(x, y, text) {
            this.$super('text', {
                x: _.defaultTo(x, 0),
                y: _.defaultTo(y, 0)
            });

            this.attr({
                'font-size': Graph.config.font.size,
                'font-family': Graph.config.font.family
            });
            
            this.text(text);

            this.on('render', _.bind(this.arrange, this));
        },

        text: function(text) {
            if (_.isUndefined(text)) {
                return this.props.text;
            }

            var font = this.fontSize(),
                parts = (text || '').split("\n"),
                doc = Graph.doc(),
                span;

            this.empty();
            this.rows = [];

            _.forEach(parts, _.bind(function(t, i){
                span = doc.createElementNS(Graph.config.xmlns.svg, 'tspan');
                span.setAttribute('text-anchor', 'middle');
                span.setAttribute('alignment-baseline', 'center');
                span.appendChild(doc.createTextNode(t));
                Graph.$(span).data('vector', this);

                this.rows[i] = span;
                this.elem.append(span);
            }, this));

            this.props.text = text;
        },

        /**
         * Arrange position
         */
        arrange: function() {
            var rows = this.rows,
                size = this.fontSize(),
                line = this.lineHeight(),
                bbox = this.bbox(false, false).data();

            if (rows.length) {
                for (var i = 0, ii = rows.length; i < ii; i++) {
                    if (i) {
                        rows[i].setAttribute('x', this.attrs.x);
                        rows[i].setAttribute('dy', size * line);
                    }
                }

                rows[0].setAttribute('dy', 0);

                // var box = this.bbox().data(),
                //     off = this.attrs.y - (box.y + box.height / 2);

                // if (off) {
                //     rows[0].setAttribute('dy', off);    
                // }
                
            }
        },

        center: function(target) {
            if (target) {
                var targetBox = target.bbox(false, false).data(),
                    matrix = this.matrix.data();

                var textBox, dx, dy, cx, cy;

                this.reset();

                textBox = this.bbox(false, false).data();   

                dx = targetBox.width / 2;
                dy = targetBox.height / 2;
                cx = textBox.x + textBox.width / 2;
                cy = textBox.y + textBox.height / 2;

                if (matrix.rotate) {
                    this.translate(dx, dy).rotate(matrix.rotate).apply();
                } else {
                    this.translate(dx, dy).apply();
                }

            }
        },

        pathinfo: function() {
            var size = this.dimension();

            return new Graph.lang.Path([
                ['M', size.x, size.y], 
                ['l', size.width, 0], 
                ['l', 0, size.height], 
                ['l', -size.width, 0], 
                ['z']
            ]);
        },

        fontSize: function() {
            return _.parseInt(this.attrs['font-size']);
        },

        lineHeight: function() {
            return this.props.lineHeight;
        },

        toString: function() {
            return this.props.text;
        }
    });

}());

(function(){

    var Collection = Graph.collection.Vector = Graph.extend({

        items: [],

        constructor: function(items) {
            this.items = items || [];
        },

        has: function(vector) {
            return _.indexOf(this.items, vector) > -1;
        },
        
        not: function(vector) {
            var items = _.filter(this.items, function(o) {
                return o !== vector;
            });
            return new Collection(items);
        },
        
        length: function() {
            return this.items.length;
        },

        indexOf: function(vector) {
            return _.indexOf(this.items, vector);
        },
        
        push: function(vector) {
            this.items.push(vector);
            this.fire('push', vector, this);
            return this;
        },

        pop: function() {
            this.items.pop();
        },

        shift: function() {
            this.items.shift();
        },

        unshift: function(vector) {
            this.items.unshift(vector);
            this.fire('unshift', vector, this);
            return this;
        },

        pull: function(vector) {
            _.pull(this.items, vector);
            this.fire('pull', vector, this);
            return this;
        },

        each: function(handler) {
            _.forEach(this.items, function(vector){
                handler.call(vector, vector);
            });
        },
        
        pathinfo: function() {
            var bbox = this.bbox(), path;
            return new Graph.lang.Path([]);
        },
        
        bbox: function() {
            var x = [], y = [], x2 = [], y2 = [];
            var box;

            for (var i = this.items.length - 1; i >= 0; i--) {
                box = this.items[i].bbox(false, false).data();

                x.push(box.x);
                y.push(box.y);
                x2.push(box.x + box.width);
                y2.push(box.y + box.height);
            }   

            x  = _.min(x);
            y  = _.min(y);
            x2 = _.max(x2);
            y2 = _.max(y2);

            return new Graph.lang.BBox({
                x: x,
                y: y,
                x2: x2,
                y2: y2,
                width: x2 - x,
                height: y2 - y
            });
        },

        toArray: function() {
            return this.items;
        }
    });

    _.forOwn(Graph.svg.Vector.prototype, function(value, name){
        (function(name, value){
            if (_.isUndefined(Collection.prototype[name]) && _.isFunction(value)) {
                Collection.prototype[name] = function() {
                    var args = _.toArray(arguments);
                    
                    this.each(function(vector){
                        vector[name].apply(vector, args);
                    });
                    
                    return this;
                };
            }
        }(name, value));
    });

}());

(function(){

    Graph.router.Manhattan = Graph.extend({

        props: {
            step: 10,
            grid: 100,
            perpendicular: true,
            maxLoops: 2000,
            maxAngle: 180,
            angle: 0
        },

        startdirs: ['left', 'right', 'top', 'bottom'],
        enddirs:   ['left', 'right', 'top', 'bottom'],

        mapdirs: {
            right:  {x:  1, y:  0},
            bottom: {x:  0, y:  1},
            left:   {x: -1, y:  0},
            top:    {x:  0, y: -1}
        },

        source: null,
        target: null,
        canvas: null,
        obstacle: null,

        constructor: function(canvas, source, target, options) {
            var me = this;

            _.extend(me.props, options || {});

            me.canvas   = canvas;
            me.source   = source;
            me.target   = target;

            me.obstacle = new Graph.util.Obstacle(canvas, source, target);
            me.obstacle.props.step = me.props.step;
            me.obstacle.props.grid = me.props.grid;

            me.obstacle.build();
        },

        directions: function() {
            var step = this.props.step;

            // var dirs = [
            //     {dx:  step , dy:  0    , distance: step, angle: null},
            //     {dx:  0    , dy:  step , distance: step, angle: null},
            //     {dx: -step , dy:  0    , distance: step, angle: null},
            //     {dx:  0    , dy: -step , distance: step, angle: null}
            // ];

            var dirs = [
                {dx:  step , dy:  0    , distance: step, angle: null},
                {dx:  0    , dy: -step , distance: step, angle: null},
                {dx: -step , dy:  0    , distance: step, angle: null},
                {dx:  0    , dy:  step , distance: step, angle: null}
            ];

            _.forEach(dirs, function(d){
                d.angle = Graph.theta(0, 0, d.dx, d.dy);
            });

            return dirs;
        },

        penalties: function() {
            var step = this.props.step;
            
            return {
                0:  0,
                45: step / 2,
                90: step / 2
            };
        },

        route: function() {
            var me = this,
                dirs = me.directions(),
                ways = dirs.length,
                pens = me.penalties(),
                step = me.props.step,
                loop = me.props.maxLoops,
                
                // source = me.source.location().snap(step, step),
                // target = me.target.location().snap(step, step),

                source = me.source.location().snap(step, step),
                target = me.target.location().snap(step, step);

            // var dot = me.canvas.circle(0,0,3);

            // dot.selectable(false);
            // dot.collectable(false);
            // dot.style({'stroke-width': 0, 'fill': 'blue'});
            // dot.render();
                
            if (me.obstacle.permit(source) && me.obstacle.permit(target)) {

                var heap = new Heap(),
                    parents = {},
                    distances = {};

                var srckey = source.toString(),
                    tarkey = target.toString();

                var prevangle;
                var currkey, currpoint, currdist, currangle;
                var nextkey, nextpoint;
                var deltadir, dist;
                var dir, i;
                var c = 0;
                var n = 0;

                heap.add(srckey, distance(source, target));
                distances[srckey] = 0;

                while( ! heap.isEmpty() && loop > 0) {
                    currkey = heap.pop();
                    currpoint = new Graph.lang.Point(currkey);
                    currdist = distances[currkey];

                    prevangle = currangle;

                    currangle = parents[currkey]
                        ? dirangle(parents[currkey], currpoint, ways)
                        : (me.props.angle !== null ? me.props.angle : dirangle(source, currpoint, ways));
                    
                    if (tarkey == currkey) {
                        deltadir = dirchange(currangle, dirangle(currpoint, target, ways));

                        if (currpoint.equals(target) || deltadir < 180) {
                            me.props.angle = currangle;
                            console.log(n);
                            return backtrace(parents, currpoint);
                        }
                    }

                    for (i = 0; i < ways; i++) {
                        dir = dirs[i];
                        deltadir = dirchange(currangle, dir.angle);
                        
                        if (deltadir > me.props.maxAngle) {
                            continue;
                        }   

                        nextpoint = currpoint.clone().expand(dir.dx, dir.dy);
                        nextkey   = nextpoint.toString();

                        if (heap.isClose(nextkey) || ! me.obstacle.permit(nextpoint)) {
                            continue;
                        }

                        _.delay(function(nextpoint){
                            // dot.attr({
                            //     cx: nextpoint.props.x,
                            //     cy: nextpoint.props.y
                            // });
                            me.canvas.circle(nextpoint.props.x, nextpoint.props.y, 2).render()
                                .collectable(false)
                                .selectable(false)
                                .style('stroke-width', '0')
                                .style('fill', 'blue');
                        }, (c += 100), nextpoint);

                        dist = currdist + dir.distance; // + pens[deltadir];

                        if ( ! heap.isOpen(nextkey) || dist < distances[nextkey]) {
                            parents[nextkey] = currpoint;
                            distances[nextkey] = dist;
                            heap.add(nextkey, dist + distance(nextpoint, target));
                        }
                    }
                    n++;
                    loop--;
                }

            }
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

    ///////// HELPERS /////////
    
    function distance(start, end) {
        return start.manhattan(end);
    }

    function dirangle(start, end, size) {
        var q = 360 / size;
        return Math.floor((start.theta(end) + q / 2) / q) * q;
    }

    function dirchange(angle1, angle2) {
        var delta = Math.abs(angle1 - angle2);
        return delta > 180 ? 360 - delta : delta;
    }

    function backtrace(parents, point) {
        var route = [],
            prevdiff = {
                props: {
                    x: 0,
                    y: 0
                }
            },
            current = point,
            parent;

        while ((parent = parents[current])) {   

            var diff = parent.difference(current);

            if ( ! diff.equals(prevdiff)) {
                route.unshift(current);
                prevdiff = diff;
            }

            current = parent;
        }

        route.unshift(current);
        return route;
    }

}());

(function(){

    Graph.util.Collector = Graph.extend({
        
        props: {
            x: 0,
            y: 0,
            x2: 0,
            y2: 0,
            dir: null,
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            offset: [0, 0],
            suspended: true
        },

        canvas: null,
        collection: [],

        components: {
            rubber: null
        },

        events: {
            beforedrag: true,
            afterdrag: true
        },

        constructor: function() {
            this.components.rubber = Graph.$('<div class="graph-rubberband">');
        },

        setup: function() {
            var me = this, canvas = me.canvas;

            if (me.plugin) {
                return;
            }
            // me.container.on('scroll', function(){
            //     var top = me.container.scrollTop(),
            //         left = me.container.scrollLeft(),
            //         dy = top - me.props.top,
            //         dx = left - me.props.left;

            //     me.props.height += dy;
            //     me.props.width += dx;

            //     me.props.top = top;
            //     me.props.left = left;
            // });

            me.plugin = interact(canvas.node()).draggable({
                manualStart: true,

                onstart: function(e) {
                    me.reset();
                    me.resize(0, 0);

                    var offset = canvas.container.offset(),   
                        x = e.pageX - offset.left,
                        y = e.pageY - offset.top;

                    me.translate(x, y);
                    me.props.offset = [x, y];
                },
                
                onmove: function(e) {
                    var dw = 0,
                        dh = 0,
                        dx = 0,
                        dy = 0;

                    if ( ! me.props.dir) {
                        switch(true) {
                            case (e.dx > 0 && e.dy > 0):
                                me.props.dir = 'nw';
                                break;
                            case (e.dx < 0 && e.dy < 0):
                                me.props.dir = 'se';
                                break;
                            case (e.dx < 0 && e.dy > 0):
                                me.props.dir = 'ne';
                                break;
                            case (e.dx > 0 && e.dy < 0):
                                me.props.dir = 'sw';
                                break;
                        }
                    } else {
                        switch(me.props.dir) {
                            case 'nw':
                                dw = e.dx;
                                dh = e.dy;
                                dx = 0;
                                dy = 0;
                                break;
                            case 'ne':
                                dw = -e.dx;
                                dh =  e.dy;
                                dx =  e.dx;
                                dy =  0;
                                break;
                            case 'se':
                                dw = -e.dx;
                                dh = -e.dy;
                                dx =  e.dx;
                                dy =  e.dy;
                                break;
                            case 'sw':
                                dw =  e.dx;
                                dh = -e.dy;
                                dx =  0;
                                dy =  e.dy;
                                break;
                        }
                        
                        me.props.width  += dw;
                        me.props.height += dh;

                        if (me.props.width >= 0 && me.props.height >= 0) {
                            me.translate(dx, dy); 
                            me.resize(me.props.width, me.props.height);
                        } else {
                            me.props.width  -= dw;
                            me.props.height -= dh;
                        }
                        
                    }
                },

                onend: function() {
                    var bbox

                    me.props.x2 = me.props.x + me.props.width;
                    me.props.y2 = me.props.y + me.props.height;

                    bbox = me.bbox();
                    
                    canvas.cascade(function(c){
                        if (c !== canvas && c.selectable() && ! c.isGroup()) {
                            if (bbox.contain(c)) {
                                me.collect(c);
                            }
                        }
                    });

                    me.resize(0, 0);
                    me.suspend();
                }
            })
            .on('down', function(e){
                var single = ! (e.ctrlKey || e.shiftKey),
                    vector = Graph.get(e.target);

                if ( ! vector.selectable()) {
                    single && me.clearCollection();    
                    return;
                }
            })
            .on('tap', function(e){
                var vector = Graph.get(e.target),
                    single = ! (e.ctrlKey || e.shiftKey);

                if (vector.selectable()) {
                    single && me.clearCollection(vector);
                    me.collect(vector);
                    return;
                }

            }, true)
            .on('move', function(e){
                var action = e.interaction,
                    target = e.target;
                if (action.pointerIsDown && action.interacting() === false && target === canvas.node()) {
                    if (me.props.suspended) {
                        me.resume();
                    }
                    action.start({name: 'drag'}, e.interactable, me.components.rubber.node());
                }
            });

            me.plugin.styleCursor(false);
        },

        render: function(canvas) {
            var me = this;

            me.canvas = canvas;
            me.canvas.container.append(me.components.rubber);

            me.canvas.on({
                render: function() {
                    me.setup();
                }
            });
            
            if (me.canvas.rendered) {
                me.setup();
            }
        },

        bbox: function() {
            var props = this.props;
            
            return new Graph.lang.BBox({
                x: props.x,
                y: props.y,
                x2: props.x2,
                y2: props.y2,
                width: props.width,
                height: props.height
            });
        },

        collect: function(vector, silent) {
            var me = this, offset;

            vector.$collector = this;
            vector.select();

            silent = _.defaultTo(silent, false);
            offset = _.indexOf(this.collection, vector);

            if (offset === -1) {
                this.collection.push(vector);
                if ( ! silent) {
                    vector.fire('collect', this, vector);
                }
            }
        },

        decollect: function(vector) {
            var offset;
            
            vector.$collector = null;
            vector.deselect();

            offset = _.indexOf(this.collection, vector);

            if (offset > -1) {
                this.collection.splice(offset, 1);
                vector.fire('decollect', this, vector);
            }
        },

        clearCollection: function(vector) {
            var me = this;
            me.canvas.cascade(function(c){
                if (c !== me.canvas && c.props.selected) {
                    me.decollect(c);
                }
            });
        },

        resume: function() {
            this.components.rubber.addClass('visible');
            this.props.suspended = false;
        },

        suspend: function() {
            this.components.rubber.removeClass('visible');
            this.props.suspended = true;
        },

        reset: function() {
            var top = this.canvas.container.scrollTop(),
                left = this.canvas.container.scrollLeft();

            this.props.x = 0;
            this.props.y = 0;
            this.props.x2 = this.props.x,
            this.props.y2 = this.props.y,
            this.props.top = top;
            this.props.left = left;
            this.props.dir = null;
            this.props.width = 0;
            this.props.height = 0;
            this.props.offset = [0, 0];
        },

        translate: function(dx, dy) {
            this.props.x += dx;
            this.props.y += dy;
            
            this.components.rubber.css({
                transform: 'translate(' + this.props.x + 'px,' + this.props.y + 'px)'
            });
        },

        resize: function(width, height) {
            this.components.rubber.width(width).height(height);
        },

        syncDragStart: function(origin, e) {
            var me = this;

            _.forEach(me.collection, function(v){
                if (v.dragger && v.dragger.props.enabled && v !== origin) {
                    (function(){
                        var mat = v.matrix.data(),
                            sin = mat.sin,
                            cos = mat.cos;

                        if (v.resizer) {
                            v.resizer.suspend();
                        }

                        if (v.dragger.components.helper) {
                            v.dragger.resume();
                        }

                        v.syncdrag = {
                            sin: sin,
                            cos: cos,
                            tdx: 0,
                            tdy: 0
                        };

                        v.addClass('dragging');
                        
                        v.fire('dragstart', {
                            dx: e.dx *  cos + e.dy * sin,
                            dy: e.dx * -sin + e.dy * cos
                        }, v);

                    }());
                }
            });

            me.fire('beforedrag');
        },

        syncDragMove: function(origin, e) {
            var me = this, dx, dy;

            _.forEach(me.collection, function(v){
                if (v.dragger && v.dragger.props.enabled && v !== origin) {
                    (function(v, e){
                        var dx = e.ox *  v.syncdrag.cos + e.oy * v.syncdrag.sin,
                            dy = e.ox * -v.syncdrag.sin + e.oy * v.syncdrag.cos;

                        if (v.dragger.components.helper) {
                            v.dragger.components.helper.translate(e.ox, e.oy).apply();
                        } else {
                            v.translate(dx, dy).apply();
                        }

                        v.syncdrag.tdx += dx;
                        v.syncdrag.tdy += dy;

                        v.fire('dragmove', {
                            dx: dx,
                            dy: dy
                        }, v);

                    }(v, e));    
                }
            });

        },

        syncDragEnd: function(origin, e) {
            var me = this;

            _.forEach(me.collection, function(v){
                if (v.dragger && v.dragger.props.enabled && v !== origin) {
                    (function(v, e){
                        
                        if (v.dragger.components.helper) {
                            v.translate(v.syncdrag.tdx, v.syncdrag.tdy).apply();
                            v.dragger.suspend();
                        }

                        if (v.resizer) {
                            v.resizer.resume();
                            v.resizer.redraw();
                        }

                        v.fire('dragend', {
                            dx: v.syncdrag.tdx,
                            dy: v.syncdrag.tdy
                        }, v);
                        
                        v.removeClass('dragging');

                        delete v.syncdrag;
                        v.dirty = true;

                    }(v, e));
                }
            });

            e.origin = origin;
            me.fire('afterdrag', e, me);
        }
    });

}());

(function(){

    Graph.util.Connector = Graph.extend({
        
        ports: {
            source: null,
            target: null
        },

        components: {

        },

        constructor: function() {
            var me = this;
            
            this.cached = {
                vertices: null
            };

            this.initComponent();
        },
        
        initComponent: function() {
            var me = this, comp = this.components;

            comp.block = new Graph.svg.Group();
            comp.block.addClass('graph-util-connector');
            comp.block.removeClass('graph-elem graph-elem-group');

            comp.wrap = comp.block.append(new Graph.svg.Path('M 0 0'));
            comp.wrap.addClass('graph-util-connector-wrap');
            comp.wrap.removeClass('graph-elem graph-elem-path');
            comp.wrap.selectable(false);
            comp.wrap.collectable(false);

            comp.wrap.elem.on({
                click: function(e) {
                    e.stopPropagation();
                    me.select();
                }
            });

            comp.core  = comp.block.append(new Graph.svg.Path('M 0 0'));
            
            comp.core.attr({
                'marker-end': 'url(#marker-arrow)'
            });

            comp.core.addClass('graph-util-connector-core');
            comp.core.removeClass('graph-elem graph-elem-path');
            comp.core.collectable(false);

            comp.core.elem.on({
                click: function(e) {
                    e.stopPropagation();
                    me.select();
                }
            });

        },

        connect: function(source, target, linker) {
            var me = this,
                comp = me.components,
                x0 = source.props.x,
                y0 = source.props.y,
                x1 = target.props.x,
                y1 = target.props.y;

            comp.core.startAt(x0, y0);
            comp.core.stopAt(x1, y1);
        },

        source: function(port) {
            var me = this,
                x = port.props.x,
                y = port.props.y;

            if (_.isUndefined(port)) {
                return me.ports.source;
            }

            me.ports.source = port;

            me.components.wrap.moveTo(x, y);
            me.components.core.moveTo(x, y);

            return me;
        },

        target: function(port) {
            var me = this,
                x = port.props.x,
                y = port.props.y;

            if (_.isUndefined(port)) {
                return me.ports.target;
            }
            me.ports.target = port;

            me.components.wrap.closeTo(x, y);
            me.components.core.closeTo(x, y);

            return me;
        },

        expand: function(x, y) {
            var me = this;

            // me.components.wrap.expandTo(x, y);
            me.components.core.expandTo(x, y);

            return me;
        },

        render: function(canvas) {
            var comp = this.components;

            if ( ! comp.block.rendered) {
                comp.block.render(canvas);
            }
        },

        component: function() {
            return this.components.block;
        },

        vertices: function() {
            var comp = this.components;
            
            if (comp.core.dirty || _.isNull(this.cached.vertices)) {
                this.cached.vertices = [];
            }

            return this;
        },

        select: function() {
            var comp = this.components,
                path = comp.core.pathinfo();

            console.log(path);
        }

    });

}());

(function(){

    Graph.util.Definer = Graph.extend({
        definitions: {

        },

        components: {
            holder: null
        },

        canvas: null,

        constructor: function() {
            var me = this;
            me.components.holder = Graph.$svg('defs');
        },

        render: function(canvas) {
            this.canvas = canvas;
            this.canvas.elem.prepend(this.components.holder);
        },

        defineArrowMarker: function(id) {
            if (this.definitions[id]) {
                return this.definitions[id];
            }

            var marker = Graph.$svg('marker');

            marker.attr({
                id: id,
                refX: '8',
                refY: '4',
                markerWidth: '8',
                markerHeight: '8',
                orient: 'auto'
            });

            var path = Graph.$svg('path');
            
            path.attr({
                d: 'M 0 0 L 0 8 L 8 4 L 0 0',
                fill: '#333',
                'stroke-width': '0'
            });

            marker.append(path);

            this.definitions[id] = marker;
            this.components.holder.append(marker);

            return marker;
        }
    });

}());
    
(function(){

    Graph.util.Hinter = Graph.extend({

        components: {
            G: null,
            V: null,
            H: null
        },

        collection: {},

        sources: {
            M: [],
            C: []
        },

        targets: {
            M: [],
            C: []
        },

        constructor: function() {
            var me = this, comp = this.components;

            comp.G = new Graph.svg.Group();
            comp.G.addClass('graph-util-hinter');
            comp.G.removeClass('graph-elem graph-elem-group');

            comp.H = new Graph.svg.Line(0, 0, 0, 0);
            comp.H.attr('shape-rendering', 'crispEdges');
            comp.H.removeClass('graph-elem graph-elem-line');
            comp.H.render(comp.G);

            comp.V = new Graph.svg.Line(0, 0, 0, 0);
            comp.V.attr('shape-rendering', 'crispEdges');
            comp.V.removeClass('graph-elem graph-elem-line');
            comp.V.render(comp.G);
        },

        render: function(canvas) {
            this.canvas = canvas;
            this.canvas.append(this.components.G);
        },

        suspend: function(bearing) {
            this.components[bearing].removeClass('visible');
        },

        resume: function(bearing) {
            this.components[bearing].addClass('visible');
        },

        register: function(vector) {
            var me = this,
                id = vector.id(),
                box = vector.bbox(false, false).data();

            me.collection[id] = {
                vector: vector,
                dirty: false,
                vertices: {
                    M: [
                        Math.round(box.x, 2),
                        Math.round(box.y + box.height / 2, 2),
                        box.width, 
                        box.height
                    ],
                    C: [
                        Math.round(box.x + box.width / 2, 2),
                        Math.round(box.y, 2),
                        box.width, 
                        box.height
                    ]
                }
            };

            vector.on({
                dragend: function() {
                    me.collection[id].dirty = true;
                },
                resize: function() {
                    me.collection[id].dirty = true;
                }
            });
        },

        activate: function(vector) {
            var me = this,
                id = vector.id();

            // bring to front;
            me.canvas.elem.append(me.components.G.elem);
            
            if (me.collection[id].dirty) {
                var box = vector.bbox(false, false).data();
                me.collection[id].vertices = {
                    M: [
                        Math.round(box.x, 2),
                        Math.round(box.y + box.height / 2, 2),
                        box.width, 
                        box.height
                    ],
                    C: [
                        Math.round(box.x + box.width / 2, 2),
                        Math.round(box.y, 2),
                        box.width, 
                        box.height
                    ]
                }
                me.collection[id].dirty = false;
            }

            me.sources.M = me.collection[id].vertices.M;
            me.sources.C = me.collection[id].vertices.C;

            me.targets.M = [];
            me.targets.C = [];

            _.forEach(me.collection, function(col, id){
                if (col.vector !== vector) {
                    if (col.dirty) {
                        var box = col.vector.bbox(false, false).data();
                        col.vertices = {
                            M: [
                                Math.round(box.x, 2),
                                Math.round(box.y + box.height / 2, 2),
                                box.width, 
                                box.height
                            ],
                            C: [
                                Math.round(box.x + box.width / 2, 2),
                                Math.round(box.y, 2),
                                box.width, 
                                box.height
                            ]
                        }
                        col.dirty = false;
                    }
                    me.targets.M.push(col.vertices.M);
                    me.targets.C.push(col.vertices.C);
                }
            });
        },

        watch: function(dx, dy) {
            var me = this;

            // update source
            _.forEach(me.sources, function(s){
                s[0] += dx;
                s[1] += dy;
            });

            var x1, y1, x2, y2;

            // find `M`
            var fm = _.find(me.targets.M, function(t){
                return t[1] === me.sources.M[1];
            });

            if (fm) {
                me.resume('H');

                if (me.sources.M[0] < fm[0]) {
                    x1 = me.sources.M[0];
                    x2 = fm[0] + fm[2];
                } else {
                    x1 = me.sources.M[0] + me.sources.M[2];
                    x2 = fm[0];
                }

                me.components.H.attr({
                    x1: x1,
                    y1: me.sources.M[1],
                    x2: x2,
                    y2: fm[1]
                });
            } else {
                me.suspend('H');
            }

            // find `C`
            var fc = _.find(me.targets.C, function(t){
                return t[0] === me.sources.C[0];
            });

            if (fc) {
                me.resume('V');

                if (me.sources.C[1] < fc[1]) {
                    y1 = me.sources.C[1];
                    y2 = fc[1] + fc[3];
                } else {
                    y1 = me.sources.C[1] + me.sources.C[3];
                    y2 = fc[1];
                }

                me.components.V.attr({
                    x1: me.sources.C[0],
                    y1: y1, //me.sources.C[1],
                    x2: fc[0],
                    y2: y2
                    // x1: me.sources.C[0],
                    // y1: y1,
                    // x2: fc[0],
                    // y2: y2
                });
            } else {
                me.suspend('V');
            }

        },

        deactivate: function() {
            this.suspend('H');
            this.suspend('V');

            this.components.H.attr({
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0
            });

            this.components.V.attr({
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0
            });

            this.sources.M = [];
            this.sources.C = [];

            this.targets.M = [];
            this.targets.C = [];
        }
    });

}());

(function(){

    var Link = Graph.util.Link = Graph.extend({
        
        source: null,
        target: null,

        constructor: function(source, target) {
            this.source = source;
            this.target = target;
        },

        connect: function(router) {
            
        }

    });

}());

(function(){

    Graph.util.Linker = Graph.extend({
        props: {
            suspended: true,
            x: 0,
            y: 0
        },
        components: {
            block: null,
            point: null
        },
        ports: {
            source: null,
            target: null
        },
        constructor: function() {
            var me = this, comp = me.components;

            comp.block = new Graph.svg.Group();
            comp.block.addClass('graph-util-linker');
            comp.block.removeClass('graph-elem graph-elem-group');
            comp.block.collectable(false);
            comp.block.selectable(false);

            comp.point = new Graph.svg.Ellipse(0, 0, 3, 3);
            comp.point.addClass('graph-util-linker-point');
            comp.point.removeClass('graph-elem graph-elem-ellipse');
            comp.point.collectable(false);
            comp.point.selectable(false);
            comp.point.render(comp.block);

            comp.link = new Graph.svg.Path('M 0 0');
            comp.link.attr('marker-end', 'url(#marker-arrow)');
            comp.link.addClass('graph-util-linker-link');
            comp.link.removeClass('graph-elem graph-elem-path');
            comp.link.selectable(false);
            comp.link.collectable(false);
            comp.link.render(comp.block);

        },
        component: function() {
            return this.components.block;
        },
        pointer: function() {
            return this.components.point;
        },
        render: function(canvas) {
            this.canvas = canvas;
            this.canvas.append(this.components.block);
        },
        resume: function() {
            this.props.suspended = false;
            this.components.block.addClass('visible');
        },
        suspend: function() {
            this.props.suspended = true;
            this.components.block.removeClass('visible');  
        },
        
        reset: function() {
            this.ports.source = null;
            this.ports.target = null;
            this.props.x = 0;
            this.props.y = 0;
            this.components.point.attr({cx: 0, cy: 0});
            this.components.link.attr('d', 'M 0 0');
        },
        
        source: function(port) {
            var x = port.props.x,
                y = port.props.y;

            this.reset();

            this.ports.source = port;
            this.startAt(x, y);
        },

        target: function(port) {
            var x = port.props.x,
                y = port.props.y;

            this.ports.target = port;
            this.stopAt(x, y);
        },
        
        startAt: function(x, y) {
            var prop = this.props,
                comp = this.components;

            prop.x = x;
            prop.y = y;

            comp.point.attr({
                cx: x,
                cy: y
            });

            comp.link.startAt(x, y);
        },
        
        stopAt: function(x, y) {
            var prop = this.props,
                comp = this.components;

            prop.x = x;
            prop.y = y;

            comp.point.attr({
                cx: x,
                cy: y
            });

            comp.link.stopAt(x, y);
        },
        
        closeTo: function(x, y) {
            
        },
        
        expandBy: function(dx, dy) {
            var prop = this.props,
                comp = this.components

            prop.x += dx;
            prop.y += dy;

            comp.point.attr({
                cx: prop.x,
                cy: prop.y
            });

            var deg = comp.link.angle(),
                rad = Graph.rad(deg),
                sin = Math.sin(rad),
                cos = Math.cos(rad);

            var vdx = dx * cos + dy * sin,
                vdy = dx * -sin + dy * cos;

            comp.link.expandBy(dx, dy);
        },

        revert: function() {
            this.ports.source = null;
            this.ports.target = null;
            this.suspend();
        },

        commit: function() {
            var source = this.ports.source,
                target = this.ports.target;

            if (source && target) {
                var connector = new Graph.util.Connector();
                connector.connect(source, target);
                connector.render(this.canvas);
            }
            
            this.suspend();
        }
    });

}());

(function(){

    Graph.util.Obstacle = Graph.extend({
        
        props: {
            step: 10,
            grid: 100
        },

        hash: {},

        source: null,
        target: null,
        canvas: null,

        constructor: function(canvas, source, target, options) {
            _.extend(this.props, options || {});

            this.canvas = canvas;
            this.source = source;
            this.target = target;
        },

        padding: function() {
            var step = this.props.step;

            return {
                x: step,
                y: step,
                width: -2 * step,
                height: - 2 * step
            };
        },  

        margin: function() {
            var step = this.props.step;

            return {
                x: -step,
                y: -step,
                width: 2 * step,
                height: 2 * step
            };
        },

        build: function() {
            var me = this,
                grid = me.props.grid,
                margin = me.margin(),
                padding = me.padding(),
                canvas = me.canvas,
                excludes = [];

            if (me.source) {
                excludes.push(me.source.vector);
            }

            if (me.target) {
                excludes.push(me.target.vector);
            }

            _.chain(canvas.children().items)
                .difference(excludes)
                .map(function(c){
                    var box;
                    // if (c === me.source.vector || c === me.target.vector) {
                    //     box = c.bbox(false, false).expand(padding.x, padding.y, padding.width, padding.height); 
                    //     box.snap = false;
                    // } else {
                    //     box = c.bbox(false, false).expand(margin.x, margin.y, margin.width, margin.height);
                    //     box.snap = true;
                    // }

                    box = c.bbox(false, false).expand(margin.x, margin.y, margin.width, margin.height);
                    box.snap = true;
                    
                    var dat = box.data();
                    canvas.rect(dat.x, dat.y, dat.width, dat.height).render().style('fill', 'none');
                    return box;
                })
                .reduce(function(hash, box){
                    var origin, corner;

                    // if (box.snap) {
                    //     origin = box.origin().snap(grid, grid),
                    //     corner = box.corner().snap(grid, grid);
                    // } else {
                    //     origin = box.origin();
                    //     corner = box.corner();
                    // }

                    origin = box.origin().snap(grid, grid),
                    corner = box.corner().snap(grid, grid);

                    // canvas.circle(origin.props.x, origin.props.y, 3).render();
                    // canvas.circle(corner.props.x, corner.props.y, 3).render();

                    var x, y, k;

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

        permit: function(point) {
            var me = this,
                g = me.props.grid,
                p = point.clone().snap(g, g),
                // p = point.clone(),
                k = p.toString();
            // console.log(k, me.hash[k]);
            var r = _.every(me.hash[k], function(box) {
                return ! box.contain(point);
            });

            return r;
        }

    });

}());

(function(){

    var guid = 0;

    Graph.util.Port = Graph.extend({

        props: {
            id: null,
            x: 0,
            y: 0,
            empty: true,
            width: 10,
            height: 10,
            segment: 0,
            weight: 0
        },
        
        vector: null,
        canvas: null,
        network: null,

        components: {
            port: null,
            slot: null,
            core: null
        },

        snapping: {
            x: 0,
            y: 0
        },

        connection: {
            connecting: false,
            valid: false
        },

        connectors: [],

        constructor: function(x, y, options) {
            
            options = _.extend({
                id: 'P' + (++guid),
                x: _.defaultTo(x, 0),
                y: _.defaultTo(y, 0)
            }, options || {});

            _.extend(this.props, options);
            
            this.initComponent();
        },

        initComponent: function() {
            var me = this, 
                comp = me.components, 
                prop = me.props;

            comp.port = new Graph.svg.Group();
            comp.port.addClass('graph-util-port');
            comp.port.removeClass('graph-elem graph-elem-group');
            comp.port.on({
                render: _.bind(me.onPortRender, me)
            });

            comp.slot = comp.port.append(new Graph.svg.Ellipse(
                prop.x,
                prop.y,
                prop.width,
                prop.height
            ));

            comp.slot.elem.data('port', me);

            comp.slot.addClass('graph-util-port-slot');
            comp.slot.removeClass('graph-elem graph-elem-ellipse');

            comp.slot.elem.on({
                click: function(e) {
                    me.fire('click', e, me);
                    e.stopPropagation();
                }
            });

            comp.core = comp.port.append(new Graph.svg.Ellipse(
                prop.x,
                prop.y,
                2,
                2
            ));

            comp.core.addClass('graph-util-port-core');
            comp.core.removeClass('graph-elem graph-elem-ellipse');
            comp.core.attr({
                'pointer-events': 'none'
            });

            comp.core.elem.on({
                click: function(e) {
                    e.stopPropagation();
                }
            });

            for(var name in comp) {
                comp[name].selectable(false);
                comp[name].collectable(false);
            }

        },

        component: function() {
            return this.components.port;
        },

        render: function() {
            var network = this.network;
            this.canvas = network.canvas;
            this.components.port.render(network.components.block);
        },

        data: function(name, value) {
            if (_.isPlainObject(name)) {
                _.extend(this.props, name);
                return this;
            }

            if (_.isUndefined(name) && _.isUndefined(value)) {
                return this.props;
            }

            if (_.isUndefined(value)) {
                return this.props[name];
            }

            this.props[name] = value;
            return this;
        },

        x: function(value) {
            if (_.isUndefined(value)) {
                return this.props.x;
            }
            this.props.y = value;
            return this;
        },

        y: function(value) {
            if (_.isUndefined(value)) {
                return this.props.y;
            }
            this.props.y = value;
            return this;
        },
        
        location: function() {
            return new Graph.lang.Point(this.props.x, this.props.y);
        },

        offset: function() {
            var offset = {
                left: this.props.x,
                top: this.props.y
            };

            var pcanvas = this.canvas.elem.position();

            offset.left += pcanvas.left;
            offset.top  += pcanvas.top;

            return offset;
        },

        position: function() {
            var pos = this.components.slot.position();
            return {
                left: pos.left + this.props.width,
                top: pos.top + this.props.height
            };
        },

        setup: function() {
            var me = this,
                comp = me.components,
                prop = me.props,
                linker = me.canvas.linker;

            if (me.draggable) {
                return;
            }

            me.draggable = interact(comp.slot.node()).draggable({
                manualStart: true,
                inertia: false,
                snap: {
                    targets: [
                        interact.createSnapGrid({x: 1, y: 1})
                    ]
                },
                onstart: function(e) {
                    linker.source(me);

                    me.connection.connecting = true;
                    me.draggable.setOptions('snap', {
                        targets: [
                            interact.createSnapGrid({x: 1, y: 1})
                        ]
                    });
                    
                },
                onmove: function(e) {
                    linker.expandBy(e.dx, e.dy);
                },
                onend: function(e) {
                    /*if (me.connection.connecting && ! me.connection.valid) {
                        linker.revert();
                    }*/
                }
            });

            me.draggable.styleCursor(false);

            me.draggable.on({
                move: function(e) {
                    var i = e.interaction;

                    if (i.pointerIsDown && ! i.interacting() && e.currentTarget === comp.slot.node()) {
                        linker.resume();
                        i.start({name: 'drag'}, e.interactable, linker.pointer().node());    
                    }
                }
            });

            // droppable
            me.droppable = interact(comp.slot.node()).dropzone({
                overlap: .2,
                accept: '.graph-util-linker-point'
            });

            me.droppable.on({
                dropactivate: _.bind(me.onLinkerActivate, me),
                dropdeactivate: _.bind(me.onLinkerDeactivate, me),
                dragenter: _.bind(me.onLinkerEnter, me),
                dragleave: _.bind(me.onLinkerLeave, me),
                drop: _.bind(me.onLinkerDrop, me)
            });
        },

        translate: function(dx, dy) {
            var c = this.components;
            
            this.props.x += dx;
            this.props.y += dy;

            c.core.attr({
                cx: this.props.x,
                cy: this.props.y
            });

            c.slot.attr({
                cx: this.props.x,
                cy: this.props.y
            });
        },

        relocate: function(x, y) {
            this.props.x = 0;
            this.props.y = 0;
            this.translate(x, y);
        },

        transform: function(matrix) {
            var px = this.props.x,
                py = this.props.y,
                x = matrix.x(px, py),
                y = matrix.y(px, py);

            this.props.x = 0;
            this.props.y = 0;

            this.translate(x, y);
        },

        onPortRender: function() {
            this.setup();
        },

        onLinkerActivate: function(e) {
            /*var port = Graph.$(e.target).data('port');
            console.log(port.network != this.network);
            if (port.network != this.network) {
                port.network.resume();
                console.log('called');
                port.components.port.addClass('drop-active');    
            }*/
        },

        onLinkerDeactivate: function(e) {
            var port = Graph.$(e.target).data('port');
            port.components.port.removeClass('drop-active');
        },

        onLinkerEnter: function(e) {
            var me = this, 
                snap = me.snapping, 
                linker = me.canvas.linker;

            var offset;

            if (linker.ports.source !== me) {
                offset = me.offset();

                snap.x = offset.left;
                snap.y = offset.top;
                snap.range = Infinity;

                e.draggable.setOptions('snap', {
                    targets: [
                        snap
                    ],
                    endOnly: true
                });

                me.connection.valid = true;
                me.components.port.addClass('drop-enter');
            }
        },

        onLinkerLeave: function(e) {
            var me = this, linker = me.canvas.linker;
            
            if (linker.ports.source !== me) {
                me.components.port.removeClass('drop-enter');
                me.connection.valid = false;
            }
        },

        onLinkerDrop: function(e) {
            var me = this, linker = me.canvas.linker;

            if (linker.ports.source !== me) {
                linker.target(me);
                linker.commit();
                me.components.port.removeClass('drop-enter');
                me.connection.connecting = false;
            }
        }
    });

}());

(function(){

    /**
     * Manhattan router
     */

    Graph.util.Router = Graph.extend({

        props: {
            type: 'manhattan',
            step: 10
        },

        components: {

        },

        constructor: function(type) {
            this.props.type = type || 'manhattan';
            this.initComponent();
        },

        initComponent: function() {
            var comp = this.components;

            comp.block = new Graph.svg.Group();
            comp.block.addClass('graph-util-router');
            comp.block.removeClass('graph-elem graph-elem-group');
            comp.block.props.selectable = false;
            comp.block.props.collectable = false;
            
            
        },

        type: function(type) {
            if (_.isUndefined(type)) {
                return this.props.type;
            }
            this.props.type = type;
            return this;
        },

        render: function(canvas) {
            this.canvas = canvas;
            this.canvas.append(this.components.block);
        }
    });

}());

(function(){

    Graph.util.Spotlight = Graph.extend({
        props: {
            suspended: true
        },
        
        components: {
            G: null,
            N: null,
            E: null,
            S: null,
            W: null
        },

        canvas: null,
        
        constructor: function() {
            var me = this,
                comp = me.components;

            comp.G = new Graph.svg.Group();
            comp.G.collectable(false);
            comp.G.selectable(false);
            comp.G.addClass('graph-util-spotlight');
            comp.G.removeClass('graph-elem graph-elem-group');

            _.forEach(['N', 'E', 'S', 'W'], function(name){
                comp[name] = new Graph.svg.Line(0, 0, 0, 0);
                comp[name].removeClass('graph-elem graph-elem-line');
                comp[name].collectable(false);
                comp[name].selectable(false);
                comp[name].attr('shape-rendering', 'crispEdges');
                comp[name].render(comp.G);
            });
        },
        
        component: function() {
            return this.components.G;
        },

        render: function(canvas) {
            this.canvas = canvas;
            this.canvas.append(this.components.G);
        },

        suspend: function() {
            this.props.suspended = true;
            this.components.G.removeClass('visible');
        },

        resume: function() {
            this.props.suspended = false;
            this.components.G.addClass('visible');
        },

        focus: function(target, state) {
            if ( ! state) {
                this.suspend();
                return;
            }

            var tbox = target.bbox(false, false).data(),
                dots = target.dots(true),
                tsvg = target.canvas,
                comp = this.components;

            var x, y, h, w;

            x = dots[0][0];
            y = dots[0][1];
            h = tsvg.attrs.height;
            w = tsvg.attrs.width;

            this.resume();

            comp.W.attr({
                x1: x,
                y1: 0,
                x2: x,
                y2: h
            });

            comp.E.attr({
                x1: x + tbox.width,
                y1: 0,
                x2: x + tbox.width,
                y2: h
            });

            comp.N.attr({
                x1: 0,
                y1: y,
                x2: w,
                y2: y
            });

            comp.S.attr({
                x1: 0,
                y1: y + tbox.height,
                x2: w,
                y2: y + tbox.height
            });
        }
    });

}());

(function(){

    Graph.plugin.Animator = Graph.extend({
        constructor: function(vector) {
            this.vector = vector;
        }
    });

}());

(function(){

    Graph.plugin.Dragger = Graph.extend({
        
        props: {
            enabled: true,
            suspended: false,
            inertia: false,
            ghost: false,
            bound: false,
            grid: [10, 10],
            axis: false,
            hint: false
        },

        rotate: {
            deg: 0,
            rad: 0,
            sin: 0,
            cos: 1
        },

        snaps: [

        ],

        trans: {
            dx: 0,
            dy: 0
        },

        vector: null,
        canvas: null,
        
        components: {
            holder: null,
            helper: null
        },

        constructor: function(vector, options) {
            var me = this;

            me.vector = vector;
            me.vector.addClass('graph-draggable');

            options = _.extend({
                enabled: true,
                inertia: false
            }, options || {});

            _.forEach(['axis', 'grid', 'bbox', 'ghost', 'hint'], function(name){
                if ( ! _.isUndefined(options[name])) {
                    me.props[name] = options[name];
                }
            });

            _.extend(me.props, options);

            if (me.vector.rendered) {
                me.setup();
            } else {
                me.vector.on({
                    transform: _.bind(me.onVectorTransform, me),
                    render: _.bind(me.onVectorRender, me),
                    reset: _.bind(me.onVectorReset, me)
                });
            }

        },

        setup: function() {
            var me = this, 
                canvas = me.vector.paper(),
                options = {};

            if (me.plugin) {
                return;
            }

            me.canvas = canvas;

            if (canvas.scroller) {
                // options.autoScroll = {
                //     container: canvas.scroller.node()
                // };
            }

            if (me.props.hint && canvas.hinter) {
                canvas.hinter.register(me.vector);
            }

            _.extend(options, {
                manualStart: me.props.ghost ? true : false,
                onstart: _.bind(me.onDragStart, me),
                onmove: _.bind(me.onDragMove, me),
                onend: _.bind(me.onDragEnd, me)
            });

            me.plugin = interact(me.vector.node()).draggable(options);
            me.plugin.styleCursor(false);

            me.plugin.on({
                down: _.bind(me.onPointerDown, me),
                move: _.bind(me.onPointerMove, me)
            });

            me.dragRotate(me.vector.props.rotate);

            me.dragSnap({
                mode: 'grid',
                x: me.props.grid[0],
                y: me.props.grid[1]
            });

            me.plugin.draggable(me.props.enabled);

            me.render();
            me.suspend();
        },

        enable: function() {
            this.props.enabled = true;
            if (this.plugin) {
                this.plugin.draggable(true);
            }
        },

        disable: function() {
            this.props.enabled = false;
            if (this.plugin) {
                this.plugin.draggable(false);
            }
        },

        suspend: function() {
            this.props.suspended = true;
            if (this.components.holder) {
                this.components.holder.removeClass('visible');
            }
        },

        resume: function() {
            this.props.suspended = false;
            if (this.components.holder) {
                this.components.holder.addClass('visible');
            }
        },

        render: function() {
            var canvas = this.canvas, // this.vector.paper(),
                comp = this.components;

            if (this.props.ghost) {
                if ( ! comp.holder) {
                    comp.holder = canvas.group();
                    comp.holder.props.collectable = false;
                    comp.holder.props.selectable = false;
                    comp.holder.addClass('graph-dragger').removeClass('graph-elem graph-elem-group');
                    this.vector.parent().append(comp.holder);
                }

                if ( ! comp.helper) {
                    comp.helper = canvas.rect(0, 0, 0, 0);
                    comp.helper.addClass('graph-dragger-helper').removeClass('graph-elem graph-elem-rect');
                    comp.helper.props.collectable = false;
                    comp.helper.props.selectable = false;
                    comp.holder.append(comp.helper);

                    comp.helper.attr({
                        'fill': 'transparent',
                        'stroke': '#333',
                        'stroke-width': 1,
                        'stroke-dasharray': '4 3'
                    });
                }
            }

            this.redraw();
        },

        redraw: function() {
            var comp = this.components;

            this.resume();

            if (comp.helper) {
                var vbox = this.vector.bbox(false, false).data(),
                    hbox = comp.helper.bbox(false, false).data();

                var dx = vbox.x - hbox.x,
                    dy = vbox.y - hbox.y;

                comp.helper.translate(dx, dy).apply();

                comp.helper.attr({
                    width: vbox.width,
                    height: vbox.height
                });
            }
        },

        dragRotate: function(deg) {
            var rad = Graph.rad(deg);

            this.rotate.deg = deg;
            this.rotate.rad = rad;
            this.rotate.sin = Math.sin(rad);
            this.rotate.cos = Math.cos(rad);
        },

        dragSnap: function(snap) {
            var me = this, snaps = me.snaps;

            if (_.isArray(snap)) {
                _.forEach(snap, function(s){
                    snaps.unshift(fixsnap(s));
                });
            } else {
                snaps.push(fixsnap(snap));
            }

            if (this.plugin) {
                this.plugin.setOptions('snap', {
                    targets: snaps
                });
                
                // this.plugin.setOptions('snap', {
                //     targets: snaps
                //     relativePoints: [
                //         {x: .5, y: .5}
                //     ]
                // });
            }

            /////////
            
            function fixsnap(snap) {
                snap.mode = _.defaultTo(snap.mode, 'anchor');

                if (snap.mode == 'grid') {
                    if (me.props.axis == 'x') {
                        snap.y = 0;
                    } else if (me.props.axis == 'y') {
                        snap.x = 0;
                    }
                    snap = interact.createSnapGrid({x: snap.x, y: snap.y});
                } else if (snap.mode == 'anchor') {
                    snap.range = _.defaultTo(snap.range, 20);
                }
                return snap;
            }
        },

        resetSnap: function() {
            this.snaps = [];

            this.dragSnap({
                mode: 'grid',
                x: this.props.grid[0],
                y: this.props.grid[1]
            });
        },

        dragBound: function(bound) {
            /*if ( ! this.plugin) {
                return;
            }

            if (_.isBoolean(bound) && bound === false) {
                this.props.bound = false;
                this.plugin.setOptions('restrict', null);
                return;
            }

            bound = _.extend({
                top: Infinity,
                right: Infinity,
                bottom: Infinity,
                left: Infinity
            }, bound || {});
            
            this.props.bound = _.extend({}, bound);

            this.plugin.setOptions('restrict', {
                restriction: bound
            });

            return;*/
        },

        onVectorRender: function() {
            this.setup();
        },

        onVectorTransform: function(e) {
            if (e.rotate) {
                this.dragRotate(this.rotate.deg + e.rotate.deg);
            }
        },

        onVectorReset: function() {
            this.dragRotate(0);
        },

        onPointerDown: function(e) {
            this.fire('pointerdown', e, this);    
        },

        onPointerMove: function(e) {
            var i = e.interaction;

            if (this.props.ghost) {
                if (i.pointerIsDown && ! i.interacting() && e.currentTarget === this.vector.node()) {
                    if (this.props.suspended) {
                        this.resume();
                        this.redraw();
                    }
                    i.start({name: 'drag'}, e.interactable, this.components.helper.node());    
                }    
            }
        },

        onDragStart: function(e) {
            this.vector.addClass('dragging');

            this.trans.dx = 0;
            this.trans.dy = 0;

            var edata = {
                dx: 0,
                dy: 0,
                ghost: this.props.ghost
            };

            if (this.props.hint && this.canvas.hinter) {
                this.canvas.hinter.activate(this.vector);
            }

            this.fire('dragstart', edata, this);
        },

        onDragMove: function(e) {
            var axs = this.props.axis,
                deg = this.rotate.deg,
                sin = this.rotate.sin,
                cos = this.rotate.cos;

            var dx, dy, hx, hy, tx, ty;
            
            dx = dy = hx = hy = tx = ty = 0;

            if (axs == 'x') {
                dx = hx = e.dx;
                dy = hy = 0;

                tx = e.dx *  cos + 0 * sin;
                ty = e.dx * -sin + 0 * cos;
            } else if (axs == 'y') {
                dx = hx = 0;
                dy = hy = e.dy;

                tx = 0 *  cos + e.dy * sin;
                ty = 0 * -sin + e.dy * cos;
            } else {
                hx = e.dx;
                hy = e.dy;

                dx = tx = e.dx *  cos + e.dy * sin;
                dy = ty = e.dx * -sin + e.dy * cos;  
            }

            this.trans.dx += tx;
            this.trans.dy += ty;

            if (this.props.hint && this.canvas.hinter) {
                this.canvas.hinter.watch(dx, dy);
            }

            if (this.components.helper) {
                this.components.helper.translate(hx, hy).apply();
            } else {
                this.vector.translate(dx, dy).apply(); 
            }
            
            var edata = {
                pageX: _.defaultTo(e.pageX, e.x0),
                pageY: _.defaultTo(e.pageY, e.y0),

                dx: dx,
                dy: dy,
                
                ox: hx, // _.defaultTo(e.dx, 0),
                oy: hy, // _.defaultTo(e.dy, 0),
                
                ghost: this.props.ghost
            };

            this.fire('dragmove', edata, this);
        },

        onDragEnd: function(e) {
            var dx = this.trans.dx,
                dy = this.trans.dy;

            if (this.props.hint && this.canvas.hinter) {
                this.canvas.hinter.deactivate();
            }

            if (this.components.helper) {
                this.vector.translate(dx, dy).apply();
                this.redraw();
                this.suspend();
            }

            this.vector.removeClass('dragging');

            var edata = {
                dx: dx,
                dy: dy,
                ghost: this.props.ghost
            };

            this.fire('dragend', edata, this);

            this.trans.dx = 0;
            this.trans.dy = 0;
        }
    });

}());

(function(){

    Graph.plugin.Dropper = Graph.extend({

        props: {
            overlap: 'center',
            accept: '.graph-draggable'
        },

        config: {},

        constructor: function(vector, config) {
            var me = this;

            me.vector = vector;
            me.vector.addClass('graph-dropzone').removeClass('graph-draggable');
                
            config = config || {};

            _.forEach(['accept', 'overlap'], function(name){
                me.props[name] = config[name];
                delete config[name];
            });

            me.config = _.extend({}, config);

            me.vector.on({
                render: _.bind(me.onVectorRender, me)
            });

            if (me.vector.rendered) {
                me.setup();
            }
        },

        setup: function() {
            var me = this;

            if (me.plugin) {
                return;
            }

            me.plugin = interact(me.vector.node()).dropzone({

                checker: _.bind(me.onDropValidate, me),

                ondropactivate: _.bind(me.onDropActivate, me),
                ondropdeactivate: _.bind(me.onDropDeactivate, me),
                ondragenter: _.bind(me.onDragEnter, me),
                ondragleave: _.bind(me.onDragLeave, me),
                ondrop: _.bind(me.onDrop, me)
            });
        },

        onDropValidate: function( edrop, edrag, dropped, dropzone, dropel, draggable, dragel ) {
            return true;
            /*if (dropped) {
                if (this.config.validate) {
                    var args = _.toArray(arguments);
                    dropped = this.config.validate.apply(this, args);
                }    
            }
            
            return dropped;*/
        },

        onVectorRender: function() {
            this.setup();
        },

        onDropActivate: function(e) {
            this.vector.addClass('activate');
        },

        onDropDeactivate: function(e) {
            this.vector.removeClass('activate');
        },

        onDragEnter: function(e) {
            this.vector.removeClass('activate').addClass('enter');
        },

        onDragLeave: function(e) {
            this.vector.removeClass('enter').addClass('activate');
        },

        onDrop: function(e) {
            this.vector.removeClass('activate enter leave');
        }
    });

}());

(function(){

    Graph.plugin.History = Graph.extend({
        
        props: {
            limit: 1,
            index: 0
        },

        items: {},

        constructor: function(vector) {
            this.vector = vector;
        },

        save: function(prop, data) {
            var lim = this.props.limit, len;

            if (len > lim) {
                _.drop(this.items, len - lim);
            }

            this.items[prop] = this.items[prop] || [];

            if ((len = this.items[prop].length) > lim - 1) {
                this.items[prop].splice(0, len - lim);
            }

            this.items[prop].push(data);

            console.log(this);
        },

        last: function(prop) {

        },

        go: function() {

        },

        back: function() {

        },

        next: function() {

        },

        clear: function() {

        }
    });

}());

(function(){

    Graph.plugin.Network = Graph.extend({

        props: {
            segments: 4
        },

        cached: {
            vertices: null
        },

        components: {
            block: null
        },

        ports: [],

        vector: null,
        canvas: null,
        rendered: false,
        dragging: false,

        constructor: function(vector, options) {
            var me = this, delay;
            
            _.extend(me.props, options || {});

            me.vector = vector;
            me.vector.addClass('graph-linkable');

            me.initComponent();

            me.vector.on({
                render: function() {
                    delay = _.delay(function(){
                        clearTimeout(delay);
                        me.render();
                    }, 0);
                }
            });

            if (me.vector.rendered) {
                delay = _.delay(function(){
                    clearTimeout(delay);
                    me.render();
                }, 0);
            }
        },

        initComponent: function() {
            var me = this, comp = me.components;

            comp.block = new Graph.svg.Group();
            comp.block.selectable(false);
            comp.block.collectable(false);
            comp.block.addClass('graph-network');
            comp.block.removeClass('graph-elem graph-elem-group');
            
            var vertices = me.vertices();
            
            _.forEach(vertices, function(v, i){
                var p = me.createPort(v);
                me.ports.push(p);
            });

        },

        createPort: function(point) {
            var matrix = this.vector.ctm(),
                x = matrix.x(point.props.x, point.props.y),
                y = matrix.y(point.props.x, point.props.y);

            var port = new Graph.util.Port(x, y);
            
            port.props.weight  = point.weight;
            port.props.segment = point.segment;
            port.network = this;
            port.vector = this.vector;
            
            return port;
        },

        render: function() {
            var me = this, 
                comp = me.components,
                vector = me.vector,
                canvas = me.vector.paper();

            if (me.rendered) {
                return;
            }

            me.rendered = true;
            me.canvas = canvas;

            comp.block.render(canvas);

            _.forEach(me.ports, function(p){
                p.render(); 
            });

            vector.elem.on({
                mouseenter: function(e) {
                    me.resume();
                },
                mouseleave: function(e) {
                    var t = Graph.$(e.relatedTarget),
                        v = t.hasClass('graph-util-port') || 
                            t.hasClass('graph-util-port-slot') || 
                            t.hasClass('graph-util-pointer') || 
                            t.hasClass('graph-util-connector-marker');

                    if ( ! v && ! me.vector.props.selected) {
                        me.suspend();
                    }

                    t = null;
                }
            });

            vector.on({
                dragstart: _.bind(me.onVectorDragStart, me),
                dragend: _.bind(me.onVectorDragEnd, me),
                select: _.bind(me.onVectorSelect, me),
                deselect: _.bind(me.onVectorDeselect, me),
                resize: _.bind(me.onVectorResize, me)
            });
            
            canvas.on('click', function(e){
                var t = Graph.$(e.target);
                if (t.hasClass('graph-linkable')) {
                    return;
                }
                me.suspend();
                t = null;
            });
        },

        vertices: function() {
            var me = this, 
                vector = me.vector, 
                matrix = me.vector.ctm(),
                vertices = [];

            var path, width, step, point;

            if (me.vector.dirty || _.isNull(me.cached.vertices)) {
                
                path = vector.pathinfo().transform(vector.matrix);

                switch(me.vector.type) {
                    case 'ellipse':
                    case 'circle':
                        width = path.length();
                        step = width / 8;

                        point = Graph.point(path.segments[1][1], path.segments[1][2]);
                        point.segment = 0;
                        point.weight = 0;    
                        vertices.push(point);

                        for (var i = step; i <= width - step; i += step) {
                            point = path.pointAt(i);
                            point.segment = 0;
                            point.weight = i / width;

                            vertices.push(point);
                        }

                        break;
                    default:
                        _.forEach(path.segments, function(s, i){
                            var c, l, q, p, n;
                            if (s[0] != 'M') {
                                c = Graph.curve([s]);
                                l = c.length();
                                q = l / me.props.segments;
                                for (n = q; n <= l; n +=q) {
                                    p = c.pointAt(n, c.t(n));
                                    p.segment = i;
                                    p.weight = n / l;
                                    vertices.push(p);
                                }
                            }
                        });
                }
                this.cached.vertices = vertices;
            }
            return this.cached.vertices;
        },

        component: function() {
            return this.components.block;
        },

        suspend: function() {
            if (this.components.block) {
                this.components.block.removeClass('visible');    
            }
        },

        resume: function() {
            if (this.dragging) {
                return;
            }

            if (this.vector.props.selected) {
                return;
            }

            if (this.components.block) {
                this.components.block.addClass('visible');        
            }
        },

        port: function(index) {
            return this.ports[index];
        },

        onVectorDragStart: function() {
            this.dragging = true;
            this.suspend();
        },

        onVectorDragEnd: function(e) {
            var me = this,
                ro = this.vector.props.rotate;

            var rad, sin, cos, dx, dy;

            if (ro) {
                rad = Graph.rad(-ro),
                sin = Math.sin(rad),
                cos = Math.cos(rad);
                dx = e.dx *  cos + e.dy * sin;
                dy = e.dx * -sin + e.dy * cos;
            } else {
                dx = e.dx;
                dy = e.dy;
            }

            _.forEach(me.ports, function(p){
                p.translate(dx, dy);
            });

            me.dragging = false;
            me.resume();
        },

        onVectorSelect: function() {
            this.suspend();
        },

        onVectorDeselect: function() {
            // this.suspend();
        },

        onVectorResize: function(e) {
            var me = this,
                path = me.vector.pathinfo().transform(me.vector.ctm());
                
            var current, distance, segment, curve, width, point, width, path;

            switch(me.vector.type) {
                case 'ellipse':
                case 'circle':
                    width = path.length();

                    _.forEach(me.ports, function(port){
                        distance = port.props.weight * width;
                        point = path.pointAt(distance);
                        
                        if (point) {
                            port.relocate(point.props.x, point.props.y);
                            point = null;
                        }
                    });
                    break;
                default:
                    _.forEach(me.ports, function(port){
                        segment = path.segments[port.props.segment];
                        if (segment) {
                            if (port.props.segment !== current || ! curve) {
                                curve = Graph.curve([segment]);
                                width = curve.length();
                            }

                            distance = width * port.props.weight;
                            point = curve.pointAt(distance, curve.t(distance));
                            
                            if (point) {
                                port.relocate(point.props.x, point.props.y);
                                point = null;
                            }
                        }

                        current = port.props.segment;
                    });
            }

            curve = null;
        }

    });

}());

(function(){
    
    Graph.plugin.Resizer = Graph.extend({
        
        props: {
            snap: [1, 1],
            suspended: true,
            handlePath: Graph.config.base + 'img/resize-control.png',
            handleSize: 17
        },

        components: {
            holder: null,
            helper: null,
            handle: {}
        },

        trans: {
            // original offset
            ox: 0,
            oy: 0,

            // original
            ow: 0,
            oh: 0,

            // current
            cw: 0,
            ch: 0,

            // translation
            dx: 0,
            dy: 0
        },

        constructor: function(vector) {
            var me = this;
            
            me.vector = vector;
            me.vector.addClass('graph-resizable');

            me.props.handlePath = Graph.config.base + 'img/resize-control.png';
            me.props.handleSize = 17;

            me.cached = {
                vertices: null
            };

            me.vector.on({
                select: function() {
                    if ( ! me.components.holder) {
                        me.render();
                        me.resume();
                    } else {
                        me.resume();
                    }
                },
                deselect: function() {
                    if ( ! me.props.suspended) {
                        me.suspend();    
                    }
                },
                dragstart: function(e, v) {
                    me.suspend();
                },
                dragend: function(e, v) {
                    me.resume();
                    if  (v.props.selected) {
                        me.redraw();
                    } else {
                        me.redraw();
                        me.suspend();
                    }
                }
            });
        },

        render: function() {
            var me = this, 
                comp = me.components,
                canvas = me.vector.paper();

            if (comp.holder) {
                me.redraw();
                return;
            }
            
            comp.holder = canvas.group();
            comp.holder.addClass('graph-resizer').removeClass('graph-elem graph-elem-group');
            comp.holder.props.collectable = false;
            comp.holder.props.selectable = false;
            me.vector.parent().append(comp.holder);

            comp.helper = canvas.rect(0, 0, 0, 0);
            comp.helper.addClass('graph-resizer-helper').removeClass('graph-elem graph-elem-rect');
            comp.helper.props.collectable = false;
            comp.helper.props.selectable = false;
            comp.holder.append(comp.helper);

            me.handle = {};

            var snap = me.props.snap;

            var handle = {
                ne: {snap: snap},
                se: {snap: snap},
                sw: {snap: snap},
                nw: {snap: snap},
                 n: {snap: snap, axis: 'y'},
                 e: {snap: snap, axis: 'x'},
                 s: {snap: snap, axis: 'y'},
                 w: {snap: snap, axis: 'x'}
            };

            _.forOwn(handle, function(c, dir){
                (function(dir){

                    comp.handle[dir] = canvas.image(me.props.handlePath, 0, 0, me.props.handleSize, me.props.handleSize);
                    comp.handle[dir].props.collectable = false;
                    comp.handle[dir].props.selectable = false;
                    comp.handle[dir].props.dir = dir;

                    comp.handle[dir].removeClass('graph-elem graph-elem-image');
                    comp.handle[dir].addClass('graph-resizer-handle handle-' + dir);
                    comp.handle[dir].draggable(c).on('pointerdown', function(e){
                        e.stopImmediatePropagation();
                    });
                    
                    comp.handle[dir].on('dragstart', _.bind(me.onHandleMoveStart, me));
                    comp.handle[dir].on('dragmove', _.bind(me.onHandleMove, me));
                    comp.handle[dir].on('dragend', _.bind(me.onHandleMoveEnd, me));

                    comp.holder.append(comp.handle[dir]);
                }(dir));
            });

            me.redraw();
        },

        grid: function(dx, dy) {
            this.props.snap = [dx, dy];
        },

        vertices: function() {
            var me = this, 
                vertices = me.cached.vertices;

            var dt, m1, m2, b1, b2, ro, p1, p2, cx, cy;

            if (this.vector.dirty || ! vertices) {

                m1 = me.vector.matrix.clone();
                b1 = me.vector.bbox(true, false).data();
                p1 = me.vector.pathinfo().transform(m1);
                
                ro = m1.data().rotate;
                cx = b1.x + b1.width / 2;
                cy = b1.y + b1.height / 2;
                
                m2 = Graph.matrix();
                m2.rotate(-ro, cx, cy);

                p2 = p1.transform(m2);
                b2 = p2.bbox().data();

                var bx = b2.x,
                    by = b2.y,
                    bw = b2.width,
                    bh = b2.height,
                    hw = bw / 2,
                    hh = bh / 2,
                    hs = me.props.handleSize / 2;

                vertices = {
                    ne: {
                        x: bx + bw - hs,
                        y: by - hs
                    },
                    se: {
                        x: bx + bw - hs,
                        y: by + bh - hs
                    },
                    sw: {
                        x: bx - hs,
                        y: by + bh - hs
                    },
                    nw: {
                        x: bx - hs,
                        y: by - hs
                    },
                    n: {
                        x: bx + hw - hs,
                        y: by - hs
                    },
                    e: {
                        x: bx + bw - hs,
                        y: by + hh - hs
                    },
                    s: {
                        x: bx + hw - hs,
                        y: by + bh - hs
                    },
                    w: {
                        x: bx - hs,
                        y: by + hh - hs
                    },

                    rotate: {
                        deg: ro,
                        cx: cx,
                        cy: cy
                    },

                    box: {
                        x: bx,
                        y: by,
                        width: bw,
                        height: bh
                    },

                    offset: {
                        x: b1.x,
                        y: b1.y
                    }
                };

                me.cached.vertices = vertices;
            }

            return vertices;
        },

        redraw: function() {
            var me = this, comp = me.components, dirty, vx;

            if ( ! comp.holder) {
                return;
            }

            vx = this.vertices();
            
            comp.helper.reset();

            comp.helper.attr({
                x: vx.box.x,
                y: vx.box.y,
                width: vx.box.width,
                height: vx.box.height
            });
            
            comp.helper.rotate(vx.rotate.deg, vx.rotate.cx, vx.rotate.cy).apply();

            _.forOwn(comp.handle, function(h, d){
                (function(h, d){
                    h.show();
                    h.reset();
                    h.attr(vx[d]);
                    h.rotate(vx.rotate.deg, vx.rotate.cx, vx.rotate.cy).apply();
                }(h, d));
            });

            me.trans.ox = vx.offset.x;
            me.trans.oy = vx.offset.y;
            me.trans.ow = this.trans.cw = vx.box.width;
            me.trans.oh = this.trans.ch = vx.box.height;
            me.trans.dx = 0;
            me.trans.dy = 0;
        },

        suspend: function() {
            this.props.suspended = true;
            if (this.components.holder) {
                this.components.holder.removeClass('visible');
            }
        },

        resume: function() {
            this.props.suspended = false;

            if (this.components.holder) {
                this.components.holder.addClass('visible');
            }
        },

        onHandleMoveStart: function(e, handle) {
            var me = this;

            _.forOwn(me.components.handle, function(a, b){
                if (a !== handle) {
                    a.hide();
                }
            });

            handle.show();
            handle.removeClass('dragging');
        },

        onHandleMove: function(e, handle) {
            var me = this;
            
            var tr = this.trans,
                dx = _.defaultTo(e.dx, 0),
                dy = _.defaultTo(e.dy, 0);

            switch(handle.props.dir) {
                case 'ne':
                    tr.cw += dx;
                    tr.ch -= dy;

                    me.trans.dy += dy;
                    me.components.helper.translate(0, dy).apply();
                    break;

                case 'se':
                    tr.cw += dx;
                    tr.ch += dy;

                    break;

                case 'sw':
                    tr.cw -= dx;
                    tr.ch += dy;

                    me.trans.dx += dx;
                    me.components.helper.translate(dx, 0).apply();
                    break;

                case 'nw':
                    tr.cw -= dx;
                    tr.ch -= dy;

                    me.trans.dx += dx;
                    me.trans.dy += dy;
                    me.components.helper.translate(dx, dy).apply();
                    break;

                case 'n':
                    tr.cw += 0;
                    tr.ch -= dy;

                    me.trans.dy += dy;
                    me.components.helper.translate(0, dy).apply();
                    break;

                case 'e':
                    tr.cw += dx;
                    tr.ch += 0;

                    break;

                case 's':
                    tr.cw += 0;
                    tr.ch += dy;
                    break;

                case 'w':
                    tr.cw -= dx;
                    tr.ch += 0;

                    me.trans.dx += dx;
                    me.components.helper.translate(dx, 0).apply();
                    break;
            }

            me.components.helper.attr({
                width: tr.cw,
                height: tr.ch
            });

        },

        onHandleMoveEnd: function(e, handle) {
            var me = this,
                tr = this.trans;

            var sx, sy, cx, cy, dx, dy;

            sx = tr.ow > 0 ? (tr.cw / tr.ow) : 1;
            sy = tr.oh > 0 ? (tr.ch / tr.oh) : 1;
            dx = tr.dx;
            dy = tr.dy;

            switch(handle.props.dir) {
                case 'ne':
                    cx = tr.ox;
                    cy = tr.oy + tr.oh;
                    break;
                case 'se':
                    cx = tr.ox;
                    cy = tr.oy;
                    break;
                case 'sw':
                    cx = tr.ox + tr.ow;
                    cy = tr.oy;
                    break;
                case 'nw':
                    cx = tr.ox + tr.ow;
                    cy = tr.oy + tr.oh;
                    break;
                case 'n':
                    cx = tr.ox + tr.ow / 2;
                    cy = tr.oy + tr.oh;
                    break;
                case 'e':
                    cx = tr.ox;
                    cy = tr.oy + tr.oh / 2;
                    break;
                case 's':
                    cx = tr.ox + tr.ow / 2;
                    cy = tr.oy;
                    break;
                case 'w':
                    cx = tr.ox + tr.ow;
                    cy = tr.oy + tr.oh / 2;
                    break;
            }

            var resize = me.vector.resize(sx, sy, cx, cy, dx, dy);
            
            me.redraw();
            me.fire('resize', resize, me);          
        }

    });

}());

(function(){

    Graph.plugin.Sorter = Graph.extend({

        props: {
            height: 0,
            width: 0,
            suspended: true,
            enabled: true,
            offsetTop: 0,
            offsetLeft: 0
        },

        sortables: [],
        origins: [],
        guests: [],
        batch: [],
        helper: null,
        
        trans: {
            sorting: false,
            valid: false,
            drag: null,
            drop: null
        },

        components: {
            helper: null
        },

        constructor: function(vector) {
            var me = this;

            me.vector = vector;
            me.vector.addClass('graph-sorter');

            me.components.helper = new Graph.svg.Rect(0, 0, 0, 0);
            me.components.helper.addClass('graph-sorter-helper');
            me.components.helper.removeClass('graph-elem graph-elem-rect');
            me.components.helper.props.selectable = false;
            me.components.helper.render(me.vector);
            me.components.helper.$sorter = me;
            
            me.sortables.push(me.components.helper);

            me.vector.on({
                render: _.bind(me.onVectorRender, me),
                appendchild: _.bind(me.onItemAdded, me),
                prependchild: _.bind(me.onItemAdded, me)
            });

            if (me.vector.rendered) {
                me.setup();
            }
        },

        // setup plugin
        setup: function() {
            var me = this,
                vector = me.vector,
                canvas = vector.paper(),
                context = vector.node();

            if (me.plugin) {
                return;
            }
            
            me.plugin = interact('.graph-sortable', {context: context}).dropzone({
                accept: '.graph-sortable',
                // overlap: 'center',
                overlap: .1,
                // checker: _.bind(me.snapping, me),
                ondropactivate: _.bind(me.onSortActivate, me),
                ondropdeactivate: _.bind(me.onSortDeactivate, me),
                ondragenter: _.bind(me.onSortEnter, me),
                ondragleave: _.bind(me.onSortLeave, me),
                ondrop: _.bind(me.onSort, me)
            });

            me.plugin.styleCursor(false);

            if (canvas.collector) {
                canvas.collector.on({
                    afterdrag: function(e) {
                        var origin = e.origin;
                        if (_.indexOf(me.sortables, origin) > -1) {
                           me.props.offsetTop += e.dy;
                        }
                    }
                });
            }
        },

        snapping: function(drage, pointe, dropped, dropzone, dropel, draggable, dragel) {
            return dropped;
        },

        suspend: function() {
            this.props.suspended = true;

            if (this.components.helper) {
                this.components.helper.focus(false);
                this.components.helper.removeClass('visible');
            }
        },

        resume: function() {
            var me = this;

            me.props.suspended = false;

            if (me.components.helper) {
                me.components.helper.addClass('visible');
            }
        },

        redraw: function() {
            var me = this;

            if (me.trans.valid) {

                if (me.props.suspended) {
                    me.resume();    
                }

                me.swap(me.components.helper, me.trans.drop);
                me.components.helper.focus();
            }
        },

        commit: function() {
            var me = this;

            _.forEach(me.guests, function(g){
                me.vector.elem.append(g.node());
            });

            _.forEach(me.sortables, function(s){
                s.$master  = false;
                s.$sorter  = null;
                s.$sorting = false;
            });

            me.components.helper.attr('height', 0);
            
            if (me.batch.length) {
                me.permute();
            } else {
                me.swap(me.trans.drag, me.components.helper);
            }

            _.forEach(me.origins, function(o){
                o.components.helper.attr('height', 0);
                o.reset();
                o.arrange();
                o.suspend();
            });

            me.reset();
            me.suspend();
            me.resumeBatch(me.batch);
        },

        revert: function() {
            var me = this;
            
            _.forEach(me.guests, function(g){
                me.vector.elem.append(g.node());
            });

            _.forEach(me.sortables, function(s){
                s.$sorting = false;
                s.$sorter  = null;
                s.$master  = false;
            });

            _.forEach(me.origins, function(o){
                o.components.helper.attr('height', 0);
                o.reset();
                o.arrange();
                o.suspend();
            });

            me.components.helper.attr('height', 0);
            me.reset();
            me.arrange();
            me.suspend();
            me.resumeBatch(me.batch);
        },  

        permute: function() {
            var me = this,
                target = _.indexOf(me.sortables, me.components.helper),
                stacks = _.map(me.sortables, function(s, i){ return i; });

            me.batch.sort(function(a, b){
                var ta = a.offset().top,
                    tb = b.offset().top;
                return ta === tb ? 0 : (ta < tb ? -1 : 1);
            });

            orders = _.map(me.batch, function(b){
                return _.indexOf(me.sortables, b);
            });

            var swaps  = _.difference(stacks, orders),
                repos = _.indexOf(swaps, target);

            _.insert(swaps, repos, orders);

            me.sortables = _.permute(me.sortables, swaps);
            me.arrange();
        },

        swap: function(source, target) {
            var me = this,
                from = _.indexOf(me.sortables, source),
                to = _.indexOf(me.sortables, target);

            _.move(me.sortables, from, to);
            me.arrange();
        },

        arrange: function() {
            var me = this;

            me.props.height = 0;
            me.props.width  = 0;

            _.forEach(me.sortables, function(s){
                if ( ! s.$sorting) {
                    var sbox = s.bbox(false, false).data(),
                        dy = me.props.height- sbox.y + me.props.offsetTop;

                    s.translate(0, dy).apply();
                    me.props.height += sbox.height;

                    if (sbox.width > me.props.width) {
                        me.props.width = sbox.width;
                    }
                }
            });
        },

        suspendBatch: function(batch, predicate) {
            _.forEach(batch, function(b){
                b.cascade(function(c){
                    if (c.props.selected && c.resizer) {
                        c.resizer.suspend();
                    }
                });

                if (predicate) {
                    predicate.call(b, b);
                }
            });
        },

        resumeBatch: function(batch) {
            var me = this, timer;
            timer = _.delay(function(){
                clearTimeout(timer);
                _.forEach(batch, function(b){
                    b.cascade(function(c){
                        if (c.props.selected && c.resizer) {
                            c.resizer.resume();
                        }
                    });
                })
            }, 0);
        },

        reset: function() {
            this.guests = [];
            this.origins = [];
            this.trans.drag = null;
            this.trans.sorting = false;
            this.trans.valid = false;
            this.trans.drop = null;
        },

        enroll: function(item) {
            var me = this, sorter;

            if (_.indexOf(me.sortables, item) === -1)  {
                sorter = item.$sorter;
                sorter.release(item);

                if (_.indexOf(me.origins, sorter) === -1) {
                    me.origins.push(sorter);
                }

                item.$sorter  = me;

                if (item.$master) {
                    me.trans.drag = item;
                }
                
                item.off('.sorter');
                item.tree.parent = me.vector;
                me.vector.children().push(item);
                me.guests.push(item);    
            }
            
        },

        release: function(item) {
            var me = this, 
                sorter = item.$sorter || me;

            var offset;

            item.off('.sorter');
            item.$sorter = null;
            item.tree.parent = null;

            if (item.$master) {
                sorter.trans.drag = null;
            }

            sorter.vector.children().pull(item);
            
            if ((offset = _.indexOf(sorter.sortables, item)) > -1) {
                sorter.sortables.splice(offset, 1);
            }

            if ((offset = _.indexOf(sorter.batch, item)) > -1) {
                sorter.batch.splice(offset, 1);
            }

            if ((offset = _.indexOf(sorter.guests, item)) > -1) {
                sorter.guests.splice(offset, 1);
            }
        },

        onVectorRender: function() {
            var me = this, canvas = me.vector.paper();
            me.setup();
        },

        onItemAdded: function(item) {
            var me = this, delay;

            if (_.indexOf(me.sortables, item) > -1) {
                return;
            }

            if (item.hasClass('graph-sorter-helper')) {
                return;
            }

            item.$sorter = this;
            item.addClass('graph-sortable');
            
            item.off('.sorter');

            item.on('render.sorter',    _.bind(me.onItemRender, me));
            item.on('resize.sorter',    _.bind(me.onItemResize, me));
            item.on('dragstart.sorter', _.bind(me.onItemDragStart, me));
            item.on('dragend.sorter',   _.bind(me.onItemDragEnd, me));
            item.on('collect.sorter',   _.bind(me.onItemCollect, me));
            item.on('decollect.sorter', _.bind(me.onItemDecollect, me));

            me.sortables.push(item);

            if (item.rendered && ! item.$sorting) {
                delay = _.delay(function(){
                    clearTimeout(delay);
                    me.arrange();
                }, 0);
            }
        },

        onItemRender: function(e) {
            var me = this, delay;
            delay = _.delay(function(){
                clearTimeout(delay);
                me.arrange();
            }, 0);
        },

        onItemResize: function(e, item) {
            var sorter = item.$sorter || this, defer;

            suppress(item, true);

            _.forEach(sorter.sortables, function(s){
                if (s !== item) {
                    s.fire('resize.sortable', e, s);
                }
            });

            defer = _.defer(function(item){
                clearTimeout(defer);
                sorter.arrange();
                suppress(item, false);
            }, item);

            /////////
            
            function suppress(item, state) {
                item.cascade(function(c){
                    if (c.props.selected && c.resizer) {
                        var method = state ? 'suspend' : 'resume';
                        c.resizer[method].call(c.resizer);
                    }
                });
            }
        },

        onItemDragStart: function(e, item) {
            var me = this, 
                bsize = me.batch.length;

            var bbox;
            
            me.props.enabled = bsize && (bsize + 1) === me.sortables.length ? false : true;

            if ( ! me.props.enabled) {
                return;
            }

            item.$sorter = me;
            item.$master = true;
            item.$sorting = true;

            me.trans.drag = item;
            me.trans.sorting = true;

            bbox = item.bbox(false, false).data();  
            width = me.props.width;
            height = bbox.height;

            if (bsize) {
                if ( ! item.$collector) {
                    me.batch.pop().$collector.clearCollection();
                    me.batch = [];
                } else {
                    height = 0;
                    me.suspendBatch(me.batch, function(b){
                        var box = b.bbox(false, false).data();
                        height += box.height;

                        b.$sorter = me;
                        b.$sorting = true;
                    });
                }
            }

            me.components.helper.attr({
                width: width,
                height: height
            });   
        },

        onItemDragEnd: function(e, item) {
            var me = this;

            if ( ! me.props.enabled) {
                return;
            }

            if (me.trans.sorting) {
                if ( ! me.trans.valid) {
                    me.revert();
                }
            } else {
                me.revert();
            }
        },

        onItemCollect: function(e, item) {
            var sorter = item.$sorter || this;
            sorter.batch.push(item);
        },

        onItemDecollect: function(e, item) {
            var sorter = item.$sorter || this, offset;
            offset = _.indexOf(sorter.batch, item);
            if (offset > -1) {
                sorter.batch.splice(offset, 1);
            }
        },

        onSortActivate: function() {},

        onSortDeactivate: function() {},

        onSortEnter: function(e) {
            var me = this;
            var drag, drop, bbox, width, height;
            
            if ( ! me.props.enabled) {
                return;
            }

            drag = Graph.get(e.relatedTarget);
            drop = Graph.get(e.target);

            if (drag.$collector) {
                
                height = 0;
                width  = me.props.width;

                _.forEach(drag.$collector.collection, function(v){
                    var box;

                    if (v.$sorter) {

                        if (v.$sorter !== me) {
                            me.enroll(v);
                            me.batch.push(v);
                        }
                        
                        box = v.bbox(false, false).data();
                        height += box.height;

                        if (box.width > width) {
                            width = box.width;
                        }
                    }
                });

                me.components.helper.attr({
                    width: width,
                    height: height
                });
            } else {
                if (drag.$sorter) {
                    if (drag.$sorter !== me) {
                        if (me.batch.length) {
                            me.suspendBatch(me.batch);
                        }

                        me.enroll(drag);

                        bbox = drag.bbox(false, false).data();
                        height = bbox.height;
                        width = me.props.width;

                        me.components.helper.attr({
                            width: width,
                            height: height    
                        });
                    }
                }
            }

            me.trans.drop  = drop;
            me.trans.valid = true;

            me.redraw();
        },

        onSortLeave: function() {
            var me = this;

            if ( ! me.props.enabled) {
                return;
            }

            me.trans.drop = null;
            me.trans.valid = false;
            me.suspend();
        },

        onSort: function() {
            var me = this;

            if ( ! me.props.enabled) {
                return;
            }

            me.commit();
        }
    });

}());

(function(){

    Graph.plugin.Transformer = Graph.extend({
        constructor: function(vector) {
            this.actions = [];
            this.vector = vector;
        },
        transform: function(command) {
            var me = this, transform = Graph.cmd2transform(command);

            _.forEach(transform, function(args){
                var method = args.shift();
                if (me[method] && _.isFunction(me[method])) {
                    (function(){
                        me[method].apply(me, args);
                    }(method, args));    
                }
            });

            return this;
        },
        queue: function() {
            var args = _.toArray(arguments);
            
            this.actions.push({
                name: args.shift(),
                args: args,
                sort: this.actions.length
            });

            return this;
        },
        translate: function(dx, dy) {
            dx = _.defaultTo(dx, 0);
            dy = _.defaultTo(dy, 0);
            this.queue('translate', dx, dy);
            return this;
        },
        rotate: function(deg, cx, cy) {
            if ( ! _.isUndefined(cx) && ! _.isUndefined(cy)) {
                this.queue('rotate', deg, cx, cy);    
            } else {
                this.queue('rotate', deg);    
            }
            return this;
        },
        scale: function(sx, sy, cx, cy) {
            sy = _.defaultTo(sy, sx);

            if ( ! _.isUndefined(cx) && ! _.isUndefined(cy)) {
                this.queue('scale', sx, sy, cx, cy);
            } else {
                this.queue('scale', sx, sy);
            }
            return this;
        },

        matrix: function(a, b, c, d, e, f) {
            this.queue('matrix', a, b, c, d, e, f);
            return this;
        },
        
        apply: function(absolute) {
            var me = this,
                actions = this.actions,
                events = {
                    translate: false,
                    rotate: false,
                    scale: false
                };

            if ( ! actions.length) {
                return;
            }
            
            absolute = _.defaultTo(absolute, false);
            
            var deg = 0, 
                dx = 0, 
                dy = 0, 
                sx = 1, 
                sy = 1;
                
            var mat = this.vector.matrix.clone();
            
            _.forEach(actions, function(act){
                var arg = act.args,
                    cmd = act.name,
                    len = arg.length,
                    inv = false;

                if (absolute) {
                    inv = mat.invert(true);
                }
                
                var x1, y1, x2, y2, bb;
                
                if (cmd == 'translate' && len === 2) {
                    if (absolute) {
                        x1 = inv.x(0, 0);
                        y1 = inv.y(0, 0);
                        x2 = inv.x(arg[0], arg[1]);
                        y2 = inv.y(arg[0], arg[1]);
                        mat.translate(x2 - x1, y2 - y1);
                    } else {
                        mat.translate(arg[0], arg[1]);
                    }
                    events.translate = true;
                } else if (cmd == 'rotate') {
                    if (len == 1) {
                        bb = bb || me.vector.bbox(true, false).data();
                        mat.rotate(arg[0], bb.x + bb.width / 2, bb.y + bb.height / 2);
                        deg += arg[0];
                    } else if (len == 3) {
                        if (absolute) {
                            x2 = inv.x(arg[1], arg[2]);
                            y2 = inv.y(arg[1], arg[2]);
                            mat.rotate(arg[0], x2, y2);
                        } else {
                            mat.rotate(arg[0], arg[1], arg[2]);
                        }
                        deg += arg[0];
                    }
                    events.rotate = true;
                } else if (cmd == 'scale') {
                    if (len === 1 || len === 2) {
                        bb = bb || me.vector.bbox(true, false).data();
                        mat.scale(arg[0], arg[len - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                        sx *= arg[0];
                        sy *= arg[len - 1];
                    } else if (len === 4) {
                        if (absolute) {
                            x2 = inv.x(arg[2], arg[3]);
                            y2 = inv.y(arg[2], arg[3]);
                            mat.scale(arg[0], arg[1], x2, y2);
                        } else {
                            mat.scale(arg[0], arg[1], arg[2], arg[3]);
                        }
                        sx *= arg[0];
                        sy *= arg[1];
                    }
                    events.scale = true;
                } else if (cmd == 'matrix') {
                    mat.multiply(arg[0], arg[1], arg[2], arg[3], arg[4], arg[5]);
                }
            });
            
            this.vector.matrix = mat;
            this.vector.attr('transform', mat);

            if (events.translate) {
                events.translate = {
                    dx: mat.e,
                    dy: mat.f
                };
            }

            if (events.rotate) {
                events.rotate = {
                    deg: deg
                };
            }

            if (events.scale) {
                events.scale = {
                    sx: sx,
                    sy: sy
                };
            }

            this.fire('transform', events, this);
            this.actions = [];
        }
    });
    
}());

(function(){
    var guid = 0;

    var Base = Graph.shape.Base = Graph.extend({
        props: {},

        page: null,
        ports: [],
        rendered: false,
        connectors: [],
        components: {},

        tree: {
            parent: null,
            children: null
        },

        events: {
            render: true,
            resize: true,
            rotate: true
        },

        constructor: function(config) {
            var me = this;

            me.props.id = 'graph-shape-' + (++guid);

            _.extend(me.props, config || {});

            me.tree.children = new Graph.collection.Shape();
            me.initComponent();

            if (me.components.group) {
                me.components.group.on('render', function(){
                    me.rendered = true;
                    me.fire('render', me);
                });
            } else {
                console.warn("Component group is required!");
            }
        },

        id: function() {
            return this.props.id;
        },

        // @Virtual
        initComponent: function() {},

        parent: function() {
            return this.tree.parent;
        },

        children: function() {
            return this.tree.children;
        },

        render: function(parent, method) {
            var me = this, comp = this.components;
            var drawer;

            if (comp.group) {
                
                parent = _.defaultTo(parent, me.page);
                method = _.defaultTo(method, 'append');

                if (parent.canvas) {
                    me.page = parent;
                    drawer  = parent.canvas;
                } else {
                    me.page = parent.page;
                    drawer  = parent.components.group;
                }

                me.tree.parent = parent;

                switch(method) {
                    case 'append':
                        parent.children().push(me);
                        drawer.append(comp.group);
                        break;

                    case 'prepend':
                        parent.children().unshift(me);
                        drawer.prepend(comp.group);
                        break;
                }
            }
            
            return me;
        },

        append: function(shape) {
            shape.render(this, 'append');
            return shape;
        },

        prepend: function(shape) {
            shape.render(this, 'prepend');
            return shape;
        },

        data: function(name, value) {
            var me = this;

            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    me.data(k, v);
                });
                return this;
            }

            if (_.isUndefined(name) && _.isUndefined(value)) {
                return this.props;
            }
            
            if (_.isUndefined(value)) {
                return this.props[name];
            }

            this.props[name] = value;

            return this;
        },

        text: function() {
            return this.components.text ? this.components.text.props.text : '';
        },

        isPage: function() {
            return false;
        }

    });
    
}());

(function(){

    var Page = Graph.shape.Page = Graph.extend({

        canvas: null,
        rendered: true,
        tree: {
            parent: null,
            children: null
        },

        constructor: function() {
            this.canvas = new Graph.svg.Paper(1000, 1000);
            this.canvas.addClass('graph-page');
            this.tree.children = new Graph.collection.Shape();
        },

        children: function() {
            return this.tree.children;
        },

        render: function(container) {
            var me = this;
            me.rendered = true;
            me.canvas.render(container);
            return this;
        },

        append: function(shape) {
            shape.render(this, 'append');
            return shape;
        },

        prepend: function(shape) {
            shape.render(this, 'prepend');
            return shape;
        },

        draw: function(/* ns, arg1, arg2, ...argN */) {
            var args = _.toArray(arguments),
                part = _.split(args.shift(), '.'),
                tail = _.capitalize(part.pop() || ''),
                name  = 'Graph.shape.' + _.join(part.concat([tail]), '.'),
                clazz = Graph.ns(name);

            var shape;

            if (clazz) {
                shape = Graph.factory(clazz, args);
                shape.page = this;

                // shape.tree.parent = this;
                // this.children().push(shape);

                // shape.render(this);
            } else {
                console.warn("Class {" + name + "} doesn't exists!");
                shape = null;
            }

            return shape;
        },

        erase: function() {

        },

        isPage: function() {
            return true;
        }

    });

}());

(function(){

    Graph.shape.common.Connector = Graph.shape.Base.extend({
        props: {
            source: {
                x: 0,
                y: 0
            },
            target: {
                x: 0,
                y: 0
            }
        },
        constructor: function() {
            this.$super();
        },
        initComponent: function() {
            this.component = new Graph.svg.Group();
            this.component.addClass('graph-shape-connector');

            this.component.line()
        }
    });

}());

(function(){
    
    Graph.shape.activity.Action = Graph.shape.Base.extend({
        props: {
            x: 0,
            y: 0,
            
            width: 200,
            height: 50,

            text: 'Action'
        },

        initComponent: function() {
            var comp = this.components,
                prop = this.props;

            // component: `group`
            comp.group = new Graph.svg.Group();
            comp.group.draggable();

            comp.group.on({
                render: _.bind(this.onGroupRender, this)
            });

            // component: `block`
            comp.block = comp.group.append(new Graph.svg.Rect(0, 0, prop.width, prop.height));
            comp.block.resizable();
            comp.block.linkable();
            comp.block.on({
                resize: _.bind(this.onBlockResize, this)
            });

            // component: `text`
            comp.text = comp.group.append(new Graph.svg.Text(0, 0, prop.text));
            comp.text.selectable(false);
            comp.text.clickable(false);

            comp.text.on({
                render: _.bind(this.onTextRender, this)
            });

        },

        centerText: function() {
            this.components.text.center(this.components.block);
        },

        onGroupRender: function() {
            var comp = this.components;
            comp.group.translate(this.props.x, this.props.y).apply();
        },

        onBlockResize: function() {
            this.centerText();
        },

        onTextRender: function() {
            this.centerText();
        }
    });

}());

(function(){
    
    Graph.shape.activity.Initial = Graph.shape.Base.extend({

    });

}());

(function(){

    Graph.shape.activity.Pool = Graph.shape.Base.extend({
        
        props: {
            x: 0,
            y: 0,
            height: 0,
            offsetTop: 0,
            offsetLeft: 0
        },
        
        constructor: function(config) {
            this.$super(config);
        },

        initComponent: function() {
            var comp = this.components,
                prop = this.props;

            comp.group = new Graph.svg.Group();
            comp.group.sortable();
            
            comp.group.addClass('graph-shape graph-shape-activity-pool');
            comp.group.translate(prop.x, prop.y).apply();
            comp.group.data('selectable', false);
            comp.group.on('render', _.bind(this.onGroupRender, this));
        },

        onGroupRender: function() {
            var me = this;
            
            me.props.offsetTop  = me.props.y;
            me.props.offsetLeft = me.props.x;

            me.children().each(function(lane){
                console.log(lane.text());
            });
        }

    });

}());

(function(){
    
    Graph.shape.activity.Router = Graph.shape.Base.extend({

    });

}());

(function(){
    
    var Swimlane = Graph.shape.activity.Swimlane = Graph.shape.Base.extend({

        props: {
            x: 0,
            y: 0,

            offsetLeft: 0,
            offsetTop: 0,

            height: 150,
            width: 200,
            rotate: 0,

            headerHeight: 30,

            text: 'Swimlane',
            textRotate: 270

        },

        initComponent: function() {
            var comp = this.components,
                prop = this.props;

            // component `group`
            comp.group = new Graph.svg.Group();
            comp.group.addClass('graph-shape graph-shape-activity-swimlane');
            comp.group.draggable({axis: 'y'});
            comp.group.on({
                'render': _.bind(this.onGroupRender, this),
                'resize.sortable': _.bind(this.onGroupResize, this)
            });
            
            // component `block (rectangle)`
            comp.block = comp.group.append(new Graph.svg.Rect(0, 0, prop.width, prop.height));
            comp.block.resizable();
            comp.block.on({
                resize: _.bind(this.onBlockResize, this),
                collect: _.bind(this.onBlockCollect, this),
                render: _.bind(this.onBlockRender, this)
            });

            // component `header`
            comp.headGroup = comp.group.append(new Graph.svg.Group());
            comp.headGroup.selectable(false);

            comp.head = comp.headGroup.append(new Graph.svg.Rect(0, 0, prop.headerHeight, prop.height));
            comp.head.selectable(false);

            // component `text`
            comp.text = comp.headGroup.append(new Graph.svg.Text(0, 0, prop.text));
            comp.text.selectable(false);
            comp.text.on({
                render: _.bind(this.onTextRender, this)
            });
        },  

        render: function(parent, method) {
            var me = this;
            me.$super(parent, method);
            me.page.on('scroll', _.bind(me.onPageScroll, me));
        },

        translate: function(dx, dy) {
            this.props.x += dx;
            this.props.y += dy;
            this.components.group.translate(dx, dy).apply();
        },

        rotate: function(deg, cx, cy) {

        },

        width: function(width) {
            if (_.isUndefined(width)) {
                return this.props.width;
            }
            this.props.width = width;
            return this;
        },

        height: function(height) {
            if (_.isUndefined(height)) {
                return this.props.height;
            }
            this.props.height = height;
            return this;
        },

        centerText: function() {
            this.components.text.reset();
            this.components.text.center(this.components.head);
            this.components.text.rotate(this.props.textRotate).apply();
        },

        onPageScroll: function(e) {
            var comp = this.components,
                prop = this.props;
            
            if (e.dir == 'right' || e.dir == 'left') {
                comp.headGroup.reset();
                if (e.currX >= prop.offsetLeft) {
                    comp.headGroup.translate((e.currX - prop.offsetLeft - e.origX), 0).apply();    
                }
            }
        },

        onGroupRender: function() {
            var comp = this.components;
            comp.group.translate(this.props.x, this.props.y).apply();
        },

        onGroupResize: function(e, group) {
            var comp = this.components;
            comp.block.attr({
                width: e.width
            });
            comp.block.resizer.redraw();
        },

        onBlockRender: function() {
            var comp = this.components,
                data = this.props,
                bbox = comp.block.bbox(false, false).data(),
                bmat = comp.block.ctm();

            this.props.offsetLeft = bmat.x(bbox.x, bbox.y);
            this.props.offsetTop  = bmat.y(bbox.x, bbox.y);

            // comp.block.attr('width', comp.block.canvas.attrs.width - data.x * 2);
            // comp.block.dirty = true;
        },

        onBlockCollect: function(e) {
            e.collect(this.components.group);
            this.components.group.forward();
        },

        onBlockResize: function(e) {
            var comp = this.components,
                bbox = comp.block.bbox(false, false).data();

            // resize head
            comp.head.resize(1, e.sy, e.cx, e.cy, 0, 0);
            
            // center text
            this.centerText();

            this.props.width  = bbox.width;
            this.props.height = bbox.height;

            e.width  = this.props.width;
            e.height = this.props.height;

            comp.group.fire('resize', e, comp.group);
        },

        onTextRender: function() {
            this.centerText();
        }

    });

}());

(function(){
    
    Graph.shape.activity.Terminal = Graph.shape.Base.extend({
        
    });

}());

(function(){

    var Collection = Graph.collection.Shape = Graph.extend({
        
        items: [],

        constructor: function(shapes) {
            this.items = shapes || [];
        },

        length: function() {
            return this.items.length;
        },
        
        push: function(shape) {
            this.items.push(shape);
            this.fire('push', shape, this);
        },

        pop: function() {

        },

        shift: function() {

        },

        unshift: function(shape) {
            this.items.unshift(shape);
            this.fire('unshift', shape, this);
        },

        last: function() {
            return _.last(this.items);
        },

        each: function(predicate) {
            var me = this;
            _.forEach(me.items, function(c, i){
                (function(c){
                    predicate.call(c, c, i);
                }(c));
            });
        }
    });

}());