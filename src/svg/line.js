
(function(){

    Graph.svg.Line = Graph.svg.Vector.extend({

        attrs: {
            // 'stroke': '#696B8A',
            // 'stroke-width': 1,
            // 'stroke-linecap': 'butt',
            'class': 'graph-elem graph-elem-line'
        },

        constructor: function(x1, y1, x2, y2) {
            this.$super('line', {
                x1: _.defaultTo(x1, 0),
                y1: _.defaultTo(y1, 0),
                x2: _.defaultTo(x2, 0),
                y2: _.defaultTo(y2, 0)
            });
        }

    });

}());