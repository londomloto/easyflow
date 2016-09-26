
(function(){

    Graph.svg.Group = Graph.svg.Vector.extend({

        attrs: {
            'class': 'graph-elem graph-elem-group'
        },
        
        constructor: function(x, y) {
            this.$super('g');

            if ( ! _.isUndefined(x) && ! _.isUndefined(y)) {
                this.matrix.translate(x, y);
                this.attr('transform', this.matrix.toString());
            }
        },

        pathinfo: function() {
            var size = this.dimension();

            return new Graph.lang.Path([
                ['M', size.x, size.y], 
                ['l', size.width, 0], 
                ['l', 0, size.height], 
                ['l', -size.width, 0], 
                ['z']
            ]);
        }
        
    });

}());