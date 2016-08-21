
(function(){

    Graph.svg.Polygon = Graph.svg.Vector.extend({
        constructor: function(points) {
            var attr = {
                'stroke': '#4A4D6E',
                'stroke-width': 2,
                'fill': '#4A4D6E'
            };
            
            _.extend(attr, {
                points: points
            });

            this.$super('polygon', attr);
        }
    });

}());