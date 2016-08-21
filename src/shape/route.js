
(function(){

    Graph.shape.Route = Graph.shape.Shape.extend({
        left: 0,
        top: 0,
        width: 100,
        baseClass: 'graph-shape graph-shape-route',
        constructor: function(config) {
            
            _.extend(this, config || {});
            
            this.vector = new Graph.svg.Group(this.left, this.top);
            this.vector.addClass(this.baseClass);
            this.vector.resizable();
            
            this.polygon = this.vector.group().polygon();
            
        },

        select: function() {
            this.$super();
            this.vector.addClass('selected');
        }

    });

}());