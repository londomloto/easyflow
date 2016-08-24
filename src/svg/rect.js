
(function(){

    Graph.svg.Rect = Graph.svg.Vector.extend({

        attrs: {
            'stroke': '#000000',
            'stroke-width': 1,
            'fill': '#ffffff',
            'style': '',
            'class': 'graph-rect'
        },

        constructor: function(x, y, width, height, r) {
            r = _.defaultTo(r, 0);

            this.$super('rect', {
                x: _.defaultTo(x, 0),
                y: _.defaultTo(y, 0),
                rx: r,
                ry: r,
                width: _.defaultTo(width, 0),
                height: _.defaultTo(height, 0)
            });
        },

        attr: function() {
            var args = _.toArray(arguments);

            this.$super.apply(this, args);
            this.attrs.r = this.attrs.rx;

            return this;
        },

        pathinfo: function() {
            var a = this.attrs;

            if (a.r) {
                return new Graph.lang.Path([
                    ['M', a.x + a.r, a.y], 
                    ['l', a.width - a.r * 2, 0], 
                    ['a', a.r, a.r, 0, 0, 1, a.r, a.r], 
                    ['l', 0, a.height - a.r * 2], 
                    ['a', a.r, a.r, 0, 0, 1, -a.r, a.r], 
                    ['l', a.r * 2 - a.width, 0], 
                    ['a', a.r, a.r, 0, 0, 1, -a.r, -a.r], 
                    ['l', 0, a.r * 2 - a.height], 
                    ['a', a.r, a.r, 0, 0, 1, a.r, -a.r], 
                    ['z']
                ]);
            } else {
                return new Graph.lang.Path([
                    ['M', a.x, a.y], 
                    ['l', a.width, 0], 
                    ['l', 0, a.height], 
                    ['l', -a.width, 0], 
                    ['z']
                ]);
            }
        }
    });

}());