
(function(){

    Graph.plugin.Network = Graph.extend({

        props: {
            vector: null,
            rules: {
                
            }
        },
        
        constructor: function(vector, options) {
            _.assign(this.props, options || {});
            this.props.vector = vector.guid();
        },

        vector: function() {
            Graph.manager.vector.get(this.props.vector);
        }

    });

}());