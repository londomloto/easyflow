
EF.Shape = (function(_){

    var Shape = EF.Class.extend({

        __super__: EF.Class,

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

        serialize: function() {}
    });

    Shape.instances = 0;

    return Shape;
}(_));