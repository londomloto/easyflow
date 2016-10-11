
(function(){

    Graph.plugin.Editor = Graph.extend({

        props: {
            shape: null
        },

        constructor: function(shape) {
            this.props.shape = shape.guid();
        }

    });

}());