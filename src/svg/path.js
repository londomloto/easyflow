
(function(){

    Graph.svg.Path = Graph.svg.Vector.extend({
        constructor: function(d) {

            var attrs = _.extend({
                'stroke': '#4A4D6E',
                'stroke-width': '2',
                'fill': 'none'
            });

            d = Graph.path(d).absolute().command();
            
            _.extend(attrs, {
                d: d
            });

            this.$super('path', attrs);
        }
    });

}());