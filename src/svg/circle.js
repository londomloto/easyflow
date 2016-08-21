
(function(){

    Graph.svg.Circle = Graph.svg.Vector.extend({
        constructor: function(cx, cy, r) {
            var attr = _.extend({
                'stroke': '#4A4D6E',
                'stroke-width': 2,
                'fill': '#4A4D6E'
            });

            _.extend(attr, {
                cx: cx,
                cy: cy,
                r: r
            });

            this.$super('circle', attr);
        }
    });

}());