
EF.SVG = (function(_){

    var SVG = EF.Vector.extend({
        
        __super__: EF.Vector,

        items: null,

        constructor: function() {
            this.items = new EF.Collection([]);

            this.$super('svg', {
                props: {
                    version: '1.1',
                    xmlns: 'http://www.w3.org/2000/svg'
                }
            });

        },

        add: function(tag, config) {
            var vector = tag instanceof EF.Vector ? tag : new EF.Vector(tag, config);
            this.items.add(vector);
            return vector;
        }
    });

    return SVG;
}(_));