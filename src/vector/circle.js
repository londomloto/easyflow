
EF.vector.Circle = (function(){

    var Circle = EF.vector.Vector.extend({
        constructor: function(radius) {
            this.$super('circle', {
                props: {
                    r: radius
                }
            });
        }
    });

    return Circle;
}());