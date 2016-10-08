
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
    _.float = parseFloat;

    _.gcd = function(array) {
        if (array.length === 2) {
            var a = array[0], b = array[1], t;

            while (b > 0) {
                t = b;
                b = a % b;
                a = t;
            }

            return a;
        } else {
            var r = array[0], len = array.length, i;
            for (i = 1; i < len; i++) {
                r = _.gcd([r, array[i]]);
            }
            return r;
        }
    };

    _.lcm = function(array) {
        if (array.length === 2) {
            var a = array[0], b = array[1];
            return a * (b / _.gcd([a, b]));
        } else {
            var r = array[0], len = array.length, i;
            for (i = 1; i < len; i++) {
                r = _.lcm([r, array[i]]);
            }
            return r;
        }
    };

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
    
    var GLOBAL = typeof window != 'undefined' && window.Math == Math ? window : (typeof self != 'undefined' && self.Math == Math ? self : Function('return this')());

    var DOCUMENT = document;

    /**
     * Size for cached result
     */
    var CACHE_SIZE = 100;

    /**
     * Size for memoize function
     */
    var MEMO_SIZE = 1000;

    /**
     * Banner
     */
    GLOBAL.Graph = GLOBAL.Graph || {};

    
    /**
     * Core helper
     */
    _.extend(Graph, {
        VERSION: '1.0.0',
        AUTHOR: 'Kreasindo Cipta Teknologi',
        cached: {},
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
        },
        setup: function(name, value) {
            if (_.isPlainObject(name)) {
                _.extend(Graph.config, name);
            } else {
                Graph.config[name] = value;
            }
        },
        global: function() {
            return GLOBAL;
        }/*,
        toString: function() {
            return 'SVG Library presented by ' + Graph.AUTHOR;
        }*/
    });

    /**
     * Params name
     */
    _.extend(Graph, {
        string: {
            ID_VECTOR: 'graph-vector-id',
            ID_LINK: 'graph-link-id',
            ID_PORT: 'graph-port-id',

            CLS_VECTOR_SVG: 'graph-paper',
            CLS_VECTOR_RECT: 'graph-elem graph-elem-rect',
            CLS_VECTOR_PATH: 'graph-elem graph-elem-path',
            CLS_VECTOR_TEXT: 'graph-elem graph-elem-text',
            CLS_VECTOR_LINE: 'graph-elem graph-elem-line',
            CLS_VECTOR_GROUP: 'graph-elem graph-elem-group',
            CLS_VECTOR_IMAGE: 'graph-elem graph-elem-image',
            CLS_VECTOR_CIRCLE: 'graph-elem graph-elem-circle',
            CLS_VECTOR_ELLIPSE: 'graph-elem graph-elem-ellipse',
            CLS_VECTOR_POLYGON: 'graph-elem graph-elem-polygon',
            CLS_VECTOR_POLYLINE: 'graph-elem graph-elem-polyline',
            CLS_VECTOR_VIEWPORT: 'graph-viewport'
        }
    });

    /**
     * DOM helper
     */
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

    /**
     * Language & Core helper
     */
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

        uuid: function() {
            // credit: http://stackoverflow.com/posts/2117523/revisions
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16|0;
                var v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },

        /**
         * Simple hashing
         */
        hash: function(str) {
            var hash = 0, chr, len, i;
            
            if ( ! str.length) {
                return hash;
            }

            for (i = 0, len = str.length; i < len; i++) {
                chr   = str.charCodeAt(i);
                hash  = ((hash << 5) - hash) + chr;
                hash |= 0;
            }

            return hash;
        },

        // prepare for prototypal factory
        create: function($super, props) {
            
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

        extend: function(clazz, props) {
            if (_.isPlainObject(clazz)) {
                props = clazz;
                clazz = Graph.lang.Class;
            }
            return clazz.extend(props);
        },
        
        mixin: function(target, source) {
            this.extend(target, source, target);
        },

        lookup: function(/* tag, ...tokens */) {
            var args = _.toArray(arguments),
                group = args.shift(),
                token = _.join(args, '|'),
                cached = Graph.cached[group] = Graph.cached[group] || {},
                credit = group == 'Regex.event' ? null : CACHE_SIZE;

            if (cached[token]) {
                cached[token].credit = credit;
            } else {
                cached[token] = {
                    credit: credit,
                    remove: (function(group, token){
                        return function() {
                            delete Graph.cached[group][token];    
                        };
                    }(group, token))
                }
            }

            _.debounce(function(t){
                _.forOwn(cached, function(v, k){
                    if (k != t) {
                        if (cached[k].credit !== null) {
                            cached[k].credit--;
                            if (cached[k].credit <= 0) {
                                delete cached[k];
                            }
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

                if (saved.length >= MEMO_SIZE) {
                    delete cache[saved.shift()];
                }

                saved.push(token);
                cache[token] = func.apply(this, param);

                return cache[token];
            }
        }
    });

    /**
     * Topic
     */
    _.extend(Graph, {
        
        topic: {
            subscribers: {},
            topics: {}
        },

        publish: function(topic, message) {
            var subs = Graph.topic.subscribers,
                lsnr = subs[topic] || [];

            _.forEach(lsnr, function(handler){
                (function(){
                    handler.call(null, message);
                }(handler));
            });
        },

        subscribe: function(topic, handler) {

            if (_.isPlainObject(topic)) {
                var unsub = [];

                _.forOwn(topic, function(h, t){
                    (function(t, h){
                        var s = Graph.subscribe(t, h);
                        unsub.push({topic: t, sub: s});
                    }(t, h));
                });

                return {
                    unsubscribe: (function(unsub){
                        return function(topic) {
                            if (topic) {
                                var f = _.find(unsub, function(u){
                                    return u.topic == topic;
                                });
                                f && f.sub.unsubscribe();
                            } else {
                                _.forEach(unsub, function(u){
                                    u.sub.unsubscribe();
                                });
                            }
                        };
                    }(unsub))
                };
            }

            var subs = Graph.topic.subscribers, data;

            subs[topic] = subs[topic] || [];
            subs[topic].push(handler);

            return {
                unsubscribe: (function(topic, handler){
                    return function() {
                        Graph.unsubscribe(topic, handler);
                    };
                }(topic, handler))
            };
        },

        unsubscribe: function(topic, handler) {
            var subs = Graph.topic.subscribers, 
                lsnr = subs[topic] || [];

            for (var i = lsnr.length - 1; i >= 0; i--) {
                if (lsnr[i] === handler) {
                    lsnr.splice(i, 1);
                }
            }
        }
    });

    /**
     * Expand namespaces
     */
    Graph.ns('Graph.lang');
    Graph.ns('Graph.dom');
    Graph.ns('Graph.collection');
    Graph.ns('Graph.manager');
    Graph.ns('Graph.layout');
    Graph.ns('Graph.svg');
    Graph.ns('Graph.router');
    Graph.ns('Graph.link');
    Graph.ns('Graph.util');
    Graph.ns('Graph.plugin');
    Graph.ns('Graph.shape');
    Graph.ns('Graph.shape.common');
    Graph.ns('Graph.shape.activity');
    Graph.ns('Graph.data');
    
    /**
     * Math helper
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
        
        taxicab: function(x1, y1, x2, y2) {
            var dx = x1 - x2,
                dy = y1 - y2;
            return dx * dx + dy * dy;
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
     * Vector
     */
    _.extend(Graph, {
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

        polar2point: function(distance, radian, origin) {
            var x, y, d;

            if (_.isUndefined(origin)) {
                origin = Graph.point(0, 0);
            }

            x = Math.abs(distance * Math.cos(radian));
            y = Math.abs(distance * Math.sin(radian));
            d = Graph.deg(radian);

            if (d < 90) {
                y = -y;
            } else if (d < 180) {
                x = -x;
                y = -y;
            } else if (d < 270) {
                x = -x;
            }

            return Graph.point(origin.props.x + x, origin.props.y + y);
        },

        point2polar: function() {
            
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