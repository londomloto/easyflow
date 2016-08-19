
EF.Shape = (function(_){

    var Shape = EF.Class.extend({
        
        data: {},
        vector: null,
        container: null,

        constructor: function() {
            Shape.instances++;
        },
        
        set: function(name, value) {
            var data = this.data;
            if (_.isArray(name)) {
                _.forEach(name, function(v, k){
                    data[k] = v;
                });
            } else {
                data[name] = value;
            }
        },

        get: function(name) {
            return this.data[name];
        },

        serialize: function() {},

        render: function(container) {
            
        }
    });

    Shape.instances = 0;

    return Shape;
}(_));