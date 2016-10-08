
(function(){

    Graph.lang.Line = Graph.extend({

        props: {
            start: {
                x: 0,
                y: 0
            },
            end: {
                x: 0,
                y: 0
            }
        },

        constructor: function() {
            var args = _.toArray(arguments), start, end;

            if (args.length === 4) {
                _.assign(this.props.start, {
                    x: args[0],
                    y: args[1]
                })

                _.assign(this.props.end, {
                    x: args[2],
                    y: args[3]
                });

                start = Graph.point(args[0], args[1]);
                end = Graph.point(args[2], args[3]);
            } else {
                this.props.start = args[0].toJson();
                this.props.end = args[1].toJson();
                
                start = args[0];
                end = args[1];
            }
        },

        start: function() {
            return Graph.point(this.props.start.x, this.props.start.y);
        },

        end: function() {
            return Graph.point(this.props.end.x, this.props.end.y);
        },

        bearing: function() {
            var data = ['NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];

            var x1 = this.props.start.x,
                y1 = this.props.start.y,
                x2 = this.props.end.x,
                y2 = this.props.end.y,
                lat1 = Graph.rad(y1),
                lat2 = Graph.rad(y2),
                lon1 = x1,
                lon2 = x2,
                deltaLon = Graph.rad(lon2 - lon1),
                dy = Math.sin(deltaLon) * Math.cos(lat2),
                dx = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
                index = Graph.deg(Math.atan2(dy, dx)) - 22.5;

            if (index < 0) {
                index += 360;
            }

            index = parseInt(index / 45);
            return data[index];
        },

        intersect: function(line) {
            return this.intersection(line) !== null;
        },

        intersection: function(line) {
            var x1 = this.props.start.x,
                y1 = this.props.start.y,
                x2 = this.props.end.x,
                y2 = this.props.end.y,
                x3 = line.props.start.x,
                y3 = line.props.start.y,
                x4 = line.props.end.x,
                y4 = line.props.end.y;

            if (
                Math.max(x1, x2) < Math.min(x3, x4) ||
                Math.min(x1, x2) > Math.max(x3, x4) ||
                Math.max(y1, y2) < Math.min(y3, y4) ||
                Math.min(y1, y2) > Math.max(y3, y4)
            ) {
                return null;
            }

            var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
                ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
                denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

            if ( ! denominator) {
                return null;
            }

            var px = nx / denominator,
                py = ny / denominator,
                px2 = +px.toFixed(2),
                py2 = +py.toFixed(2);

            if (
                px2 < +Math.min(x1, x2).toFixed(2) ||
                px2 > +Math.max(x1, x2).toFixed(2) ||
                px2 < +Math.min(x3, x4).toFixed(2) ||
                px2 > +Math.max(x3, x4).toFixed(2) ||
                py2 < +Math.min(y1, y2).toFixed(2) ||
                py2 > +Math.max(y1, y2).toFixed(2) ||
                py2 < +Math.min(y3, y4).toFixed(2) ||
                py2 > +Math.max(y3, y4).toFixed(2)
            ) {
                return null;
            }

            return Graph.point(px, py);
        },

        toString: function() {
            return 'Graph.lang.Line';
        }

    });

    ///////// STATIC /////////
    
    Graph.lang.Line.toString = function() {
        return "function(from, to)";
    };  

    ///////// SHORTCUT /////////
    
    Graph.line = function(/** command */) {
        var args = _.toArray(arguments);
        return Graph.factory(Graph.lang.Line, args);
    };

}());