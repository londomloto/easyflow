
EF.Point = (function(){
    var Point = EF.Shape.extend({

        __CLASS__: 'EF.Point',
        __SUPER__: 'EF.Shape',

        x: 0,
        y: 0,

        constructor: function(x, y) {
            Point.instances++;

            this.vector = new EF.Vector('rec', {
                props: {
                    cls: 'e-shape point'
                }
            });
            
            this.x = x;
            this.y = y;
        },

        serialize: function() {
            return {
                x: this.x,
                y: this.y
            };
        }

    });

    Point.instances = 0;

    return Point;
}());