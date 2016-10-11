
(function(){

    var Shape = Graph.shape.Shape = Graph.extend({

        props: {
            guid: null
        },

        components: {},

        constructor: function(options) {
            
            _.assign(this.props, options);

            this.props.guid = 'graph-shape-' + (++Shape.guid);
            this.initComponent();

            Graph.manager.shape.register(this);
        },

        guid: function() {
            return this.props.guid;
        },

        place: function(paper) {
            var component = this.component();
            component && component.render(paper);
        },

        component: function() {

        }
    });

    ///////// STATICS /////////
    
    Shape.guid = 0;

}());