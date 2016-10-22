(function(){

    Graph.svg.Polyline = Graph.extend(Graph.svg.Vector, {
        attrs: {
            // 'stroke': '#696B8A',
            // 'stroke-width': 1,
            // 'fill': '#ffffff',
            'style': '',
            'class': Graph.string.CLS_VECTOR_POLYLINE
        },

        constructor: function(points) {
            points = _.defaultTo(points, '');

            if (_.isArray(points)) {
                if (points.length) {
                    if (_.isPlainObject(points[0])) { 
                        points = _.map(points, function(p){ return p.x + ',' + p.y; });
                    }
                    points = _.join(points, ',');
                } else {
                    points = '';
                }
            }
            
            this.superclass.prototype.constructor.call(this, 'polyline', {
                points: points
            });
        },

        pathinfo: function() {
            var command = Graph.util.polygon2path(this.attrs.points);
            command = command.replace(/Z/i, '');
            return Graph.path(command);
        },

        attr: function(name, value) {
            if (name == 'points' && _.isArray(value)) {
                value = _.join(_.map(value, function(p){
                    return p[0] + ',' + p[1];
                }), ' ');
            }
            
            return this.superclass.prototype.attr.call(this, name, value); // this.$super(name, value);
        },
        toString: function() {
            return 'Graph.svg.Polyline';
        }
    });

    ///////// STATIC /////////
    
    Graph.svg.Polyline.toString = function() {
        return 'function(points)';
    };

}());