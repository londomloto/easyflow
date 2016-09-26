
(function(){

    Graph.lang.Line = Graph.extend({

        constructor: function() {
            var args = _.toArray(arguments), start, end;

            if (args.length === 4) {
                start = Graph.point(args[0], args[1]);
                end = Graph.point(args[2], args[3]);
            } else {
                start = args[0];
                end = args[1];
            }

            this.start = start;
            this.end = end;
        },

        bearing: function() {
            var data = ['NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];

            var x1 = this.start.props.x,
                y1 = this.start.props.y,
                x2 = this.end.props.x,
                y2 = this.end.props.y,
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

        intersection: function(line) {
            var x1 = this.start.props.x,
                y1 = this.start.props.y,
                x2 = this.end.props.x,
                y2 = this.end.props.y,
                x3 = line.start.props.x,
                y3 = line.start.props.y,
                x4 = line.end.props.x,
                y4 = line.end.props.y;

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
        }

    });

}());