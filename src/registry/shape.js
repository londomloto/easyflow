
(function(){

    var Registry = Graph.extend({

        shapes: {},

        constructor: function() {
                
        },

        register: function(shape) {
            var id = shape.guid();
            this.shapes[id] = shape;
        },

        unregister: function(shape) {
            var id = shape.guid();
            if (this.shapes[id]) {
                this.shapes[id] = null;
                delete this.shapes[id];
            }
        },

        count: function() {
            return _.keys(this.shapes).length;
        },

        toArray: function() {
            var shapes = this.shapes, keys = _.keys(shapes);
            return _.map(keys, function(k){
                return shapes[k];
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
                key = Graph.$(key).data(Graph.string.ID_SHAPE);
            } else if (key instanceof Graph.dom.Element) {
                key = key.data(Graph.string.ID_SHAPE);
            }
            return this.shapes[key];
        }

    });

    Graph.registry.shape = new Registry();

}());