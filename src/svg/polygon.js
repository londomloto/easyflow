
(function(){

    var REGEX_POLY_CMD = /(\-?[0-9.]+)\s*,\s*(\-?[0-9.]+)/g;

    Graph.svg.Polygon = Graph.svg.Vector.extend({
        
        attrs: {
            'stroke': '#000000',
            'stroke-width': 1,
            'fill': '#ffffff',
            'style': '',
            'class': 'graph-polygon'
        },
        
        paths: '',

        constructor: function(points) {
            this.$super('polygon', {
                points: points
            });

            // save points to paths
            var paths = '', i = 0;
            
            points.replace(REGEX_POLY_CMD, function($0, x, y){
                paths += (i === 0 ? 'M' : 'L') + _.float(x) + ',' + _.float(y) + ',';
                i++;
            });

            if (paths) {
                paths  = paths.substring(0, paths.length - 1);
                paths += 'Z';
            }

            this.paths = paths;
        },

        pathinfo: function() {
            return new Graph.lang.Path(this.paths);
        }
    });

}());