
(function(){

    Graph.plugin.Network = Graph.extend({

        props: {
            vector: null,
            rules: {
                
            }
        },

        links: [],
        
        constructor: function(vector, options) {
            _.assign(this.props, options || {});
            this.props.vector = vector.guid();
            
            vector.addClass('graph-linkable');
        },

        vector: function() {
            Graph.manager.vector.get(this.props.vector);
        }

    });

}());