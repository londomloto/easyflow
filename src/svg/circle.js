
(function(){

    Graph.svg.Circle = Graph.svg.Vector.extend({
        attrs: {
            'stroke': '#000000',
            'stroke-width': 1,
            'fill': '#ffffff',
            'style': '',
            'class': 'graph-circle'
        },
        
        constructor: function(cx, cy, r) {
            this.$super('circle', {
                cx: cx,
                cy: cy,
                r: r
            });
        },

        pathinfo: function() {
            var a = this.attrs;
            return new Graph.lang.Path([
                ['M', a.cx, a.cy],
                ['m', 0, -a.r],
                ['a', a.r, a.r, 0, 1, 1, 0,  2 * a.r],
                ['a', a.r, a.r, 0, 1, 1, 0, -2 * a.r],
                ['z']
            ]);
        }
    });

}());