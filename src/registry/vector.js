
(function(){
    
    var vectors = {};
    
    var Registry = Graph.extend({
        
        vectors: {},

        constructor: function() {
            this.vectors = vectors;
        },

        register: function(vector) {
            var id = vector.guid(), found = this.get(id);
            
            if (found !== vector) {
                // vector.on('resize', function(){
                //     if (vector.isConnectable()) {
                //         var delay = _.delay(function(){
                //             clearTimeout(delay);
                //             Graph.registry.link.synchronize(vector);
                //         }, 1);
                //     }
                // });

                // vector.on('translate', function(){
                //     if (vector.isConnectable()) {
                //         var delay = _.delay(function(){
                //             clearTimeout(delay);
                //             Graph.registry.link.synchronize(vector);
                //         }, 1);
                //     }
                // });
            }

            vectors[id] = vector;
        },

        unregister: function(vector) {
            var id = vector.guid();
            if (vectors[id]) {
                vectors[id] = null;
                delete vectors[id];
            }
        },

        count: function() {
            return _.keys(vectors).length;
        },

        toArray: function() {
            var keys = _.keys(vectors);
            return _.map(keys, function(k){
                return vectors[k];
            });
        },

        get: function(key) {

            if (_.isUndefined(key)) {
                return this.toArray();
            }

            if (key instanceof SVGElement) {
                if (key.tagName == 'tspan') {
                    // we only interest to text
                    key = key.parentNode;
                }
                key = Graph.$(key).data(Graph.string.ID_VECTOR);
            } else if (key instanceof Graph.dom.Element) {
                key = key.data(Graph.string.ID_VECTOR);
            }
            return vectors[key];
        },

        wipe: function(paper) {
            var pid = paper.guid();

            for (var id in vectors) {
                if (vectors.hasOwnProperty(id)) {
                    if (vectors[id].tree.paper == pid) {
                        delete vectors[id];
                    }
                }
            }

            if (vectors[pid]) {
                delete vectors[pid];
            }
        },
        
        toString: function() {
            return 'Graph.registry.Vector';
        }

    });

    /**
     * Singleton vector manager
     */
    Graph.registry.vector = new Registry();

}());