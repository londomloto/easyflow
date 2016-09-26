
(function(){

    Graph.shape.common.Connector = Graph.shape.Base.extend({
        props: {
            source: {
                x: 0,
                y: 0
            },
            target: {
                x: 0,
                y: 0
            }
        },
        constructor: function() {
            this.$super();
        },
        initComponent: function() {
            this.component = new Graph.svg.Group();
            this.component.addClass('graph-shape-connector');

            this.component.line()
        }
    });

}());