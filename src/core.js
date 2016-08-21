
/**
 * Lodash polyfill
 */
(function(){
    if (_.format === undefined) {
        _.format = function() {
            var params = _.toArray(arguments),
                format = params.shift();
            return format.replace(/{(\d+)}/g, function(match, number) {
                return typeof params[number] != 'undefined'
                    ? params[number]
                    : match;
            });
        }
    }
}());

/**
 * Graph core
 */
(function(_){
    var REGEX_PATH_CMD = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        REGEX_PATH_VAL = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig,
        GLOBAL = this;

    GLOBAL.Graph = GLOBAL.Graph || {};
    // Graph.GLOBAL = CONST_GLOBAL;

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

        lookup: function(tag, key) {
            var cached = Graph.cached[tag] = Graph.cached[tag] || {};

            if (cached[key]) {
                cached[key].credit = 100;
            } else {
                cached[key] = {
                    credit: 100
                }
            }

            _.debounce(function(){
                _.forOwn(cached, function(v, k){
                    if (k != key) {
                        cached[k].credit--;
                        if ( ! cached[k]) {
                            delete cached[k];
                        }
                    }
                });
            });

            return cached[key];
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
     * Math
     */
    _.extend(Graph, {
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
        extend: function(superclass, props) {
            return superclass.extend(props);
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
        paper: function() {
            var args = _.toArray(arguments);
            args.unshift(Graph.svg.Paper);
            return new (Function.prototype.bind.apply(Graph.svg.Paper, args));
        },
        find: function(selector, context) {
            var elems = $(selector, context),
                items = [];
            
            elems.each(function(i, dom){
                var vector = $(dom).data('vector');
                vector && items.push(vector);
            });

            return new Graph.svg.Collection(items);
        },
        /**
         * Convert path comman into paths (segments)
         */
        command2path: function(command) {
            if ( ! command) {
                return null;
            }

            var cached = Graph.lookup('command2path', command),
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
        /**
         * Convert catmull-rom to bezier segment
         * https://advancedweb.hu/2014/10/28/plotting_charts_with_svg/
         */
        dots2bezier: function(dots, z) {
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

                segments.push([
                    'C',
                    (-p[0].x + 6 * p[1].x + p[2].x) / 6,
                    (-p[0].y + 6 * p[1].y + p[2].y) / 6,
                    ( p[1].x + 6 * p[2].x - p[3].x) / 6,
                    ( p[1].y + 6 * p[2].y - p[3].y) / 6,
                    p[2].x,
                    p[2].y
                ]);
            }

            return segments;
        }
    });

    Graph.ns('Graph.lang');
    Graph.ns('Graph.svg');
    Graph.ns('Graph.shape');
    Graph.ns('Graph.util');

}(_));