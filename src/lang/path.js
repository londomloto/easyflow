
(function(){

    var REGEX_PATH_STR = /,?([achlmqrstvxz]),?/gi;

    var Path;

    Graph.lang.Path = Path = Graph.lang.Class.extend({

        __CLASS__: 'Graph.lang.Path',

        constructor: function(paths) {
             if (_.isString(paths)) {
                paths = Graph.command2path(paths);
             }
             this.paths = paths;
        },

        absolute: function() {
            var cached = Graph.lookup(this.__CLASS__, this.command()),
                paths = this.paths;

            if (cached.absolute) {
                return new Path(cached.absolute.paths);
            }

            if ( ! this.paths.length) {
                return new Path([['M', 0, 0]]);
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
                            result = _.concat(result, Graph.dots2bezier(dots, z))
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
                    result = _.concat(result, Graph.dots2bezier(dots, z));
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
            var cached = Graph.looku(this.__CLASS__, this.command()),
                result = [];

            if (cached.relative) {
                return new Path(cached.relative.paths);
            }

            cached.relative = result = new Path(result);
            return result;
        },

        curve: function(){
            var cached = Graph.lookup(this.__CLASS__, this.command()),
                result = [];
            
            if (cached.curve) {
                return new Path(cached.curve.paths);
            }

            cached.curve = result = new Path(result);
            return result;
        },

        dimension: function(){
            var cached = Graph.lookup(this.__CLASS__, this.command()),
                curved;

            if (cached.dimension) {
                return cached.dimension;
            }

            curved = this.curve();
            curved = this.curve();
            curved = this.curve();

            cached.dimension = _.cloneDeep({});
            return cached.dimension;
        },

        command: function() {
            return _.join(this.paths, ',').replace(REGEX_PATH_STR, '$1');
        },

        toArray: function() {
            return this.paths;
        },

        toJson: function() {
            return {

            };
        }
    });
    
}());