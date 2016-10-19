
(function(){

    var shapes = {};

    var Registry = Graph.extend({
        
        shapes: {},

        constructor: function() {
            this.shapes = shapes;        
        },

        register: function(shape) {
            var id = shape.guid();
            shapes[id] = shape;
        },

        unregister: function(shape) {
            var id = shape.guid();
            if (shapes[id]) {
                shapes[id] = null;
                delete shapes[id];
            }
        },

        count: function() {
            return _.keys(shapes).length;
        },

        toArray: function() {
            var keys = _.keys(shapes);
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
            return shapes[key];
        },

        toString: function() {
            return 'Graph.registry.Shape';
        }

    });

    Graph.registry.shape = new Registry();

}());