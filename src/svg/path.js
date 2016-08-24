
(function(){

    Graph.svg.Path = Graph.svg.Vector.extend({
        attrs: {
            'stroke': '#000000',
            'stroke-width': 1,
            'fill': 'none',
            'style': '',
            'class': 'graph-path'
        },
        constructor: function(d) {
            this.$super('path', {
                d: Graph.path(d).absolute().toString()
            });
        },
        pathinfo: function() {
            return new Graph.lang.Path(this.attrs.d);
        }
    });

}());