
(function(){

    var Registry = Graph.extend({

        vectors: {},
        
        constructor: function() {},

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

            this.vectors[id] = vector;
        },

        unregister: function(vector) {
            var id = vector.guid();
            if (this.vectors[id]) {
                this.vectors[id] = null;
                delete this.vectors[id];
            }
        },

        count: function() {
            return _.keys(this.vectors).length;
        },

        toArray: function() {
            var vectors = this.vectors, keys = _.keys(vectors);
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
            return this.vectors[key];
        },

        wipe: function(paper) {
            var pid = paper.guid();

            for (var id in this.vectors) {
                if (this.vectors.hasOwnProperty(id)) {
                    if (this.vectors[id].tree.paper == pid) {
                        delete this.vectors[id];
                    }
                }
            }

            if (this.vectors[pid]) {
                delete this.vectors[pid];
            }
        }

    });

    /**
     * Singleton vector manager
     */
    Graph.registry.vector = new Registry();

}());