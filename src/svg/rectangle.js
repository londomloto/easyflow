
(function(){

    Graph.svg.Rectangle = Graph.svg.Vector.extend({
        constructor: function(x, y, width, height, r) {
            
            var attr = {
                'stroke': '#4A4D6E',
                'stroke-width': 2,
                'fill': '#4A4D6E'
            };

            r = _.defaultTo(r, 0);

            _.extend(attr, {
                x: x,
                y: y,
                rx: r,
                ry: r,
                width: width,
                height: height
            });

            this.$super('rect', attr);
        },

        attr: function() {
            var args = _.toArray(arguments);
            
            this.$super.apply(this, args);
            this.attrs.r = this.attrs.rx;

            return this;
        }
    });

}());