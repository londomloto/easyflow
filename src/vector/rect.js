
EF.ns('EF.vector');

EF.vector.Rect = (function(){

    var Rect = EF.vector.Vector.extend({
        constructor: function(points) {
            this.$super('polygon', {
                props: {
                    points: points
                }
            });
        }
    });

    return Rect;
}());