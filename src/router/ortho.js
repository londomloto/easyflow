
(function(){

    Graph.router.Ortho = Graph.extend(Graph.router.Directed, {
        
        waypoints: function() {
            return [this.docks.start].concat(this.bends).concat([this.docks.end]);
        },

        bendpoints: function(start, end, direction) {
            var args = _.toArray(arguments);

            if ( ! args.length) {
                return this.bends;
            }

            var points = [];
            
            if ( ! start.alignment(end)) {
                var x1 = start.props.x,
                    y1 = start.props.y,
                    x2 = end.props.x,
                    y2 = end.props.y;   

                var xm, ym;

                direction = _.defaultTo(direction, 'h:h');

                if (direction == 'h:v') {
                    points = [
                        { x: x2, y: y1 }
                    ];
                } else if (direction == 'v:h') {
                    points = [
                        { x: x1, y: y2 }
                    ];
                } else if (direction == 'h:h') {
                    xm = Math.round((x2 - x1) / 2 + x1);
                    points = [
                        { x: xm, y: y1 },
                        { x: xm, y: y2 }
                    ];
                } else if (direction == 'v:v') {
                    ym = Math.round((y2 - y1) / 2 + y1);
                    points = [
                        { x: x1, y: ym },
                        { x: x2, y: ym }
                    ];
                } else {
                    points = [];
                }

                points = _.map(points, function(o){
                    return Graph.point(o.x, o.y);
                });
            }

            this.bends = points;

            return points;
        },

        build: function() {
            var start = this.docks.start,
                end = this.docks.end,
                points = [],
                segments = [];

            points = this.bendpoints(start, end, this.direction.type);

            points.unshift(start);
            points.push(end);

            _.forEach(points, function(v, i){
                var x = v.props.x, 
                    y = v.props.y;

                if (i === 0) {
                    segments.push(['M', x, y])
                } else {
                    segments.push(['L', x, y])
                }
            });

            this.props.segments = segments;
            this.commit();

            return this;
        }

    });

}());