
(function(){

    Graph.svg.Ellipse = Graph.svg.Vector.extend({
        attrs: {
            'stroke': '#000000',
            'stroke-width': 2,
            'fill': '#ffffff',
            'style': '',
            'class': 'graph-ellipse'
        },

        constructor: function(cx, cy, rx, ry) {
            this.$super('ellipse', {
                cx: cx,
                cy: cy,
                rx: rx,
                ry: ry
            });
        },

        pathinfo: function() {
            var a = this.attrs;

            return new Graph.lang.Path([
                ['M', a.cx, a.cy],
                ['m', 0, -a.ry],
                ['a', a.rx, a.ry, 0, 1, 1, 0,  2 * a.ry],
                ['a', a.rx, a.ry, 0, 1, 1, 0, -2 * a.ry],
                ['z']
            ]);
        }
    });

}());