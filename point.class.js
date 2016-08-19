
EF.Point = (function(){

    var Point = EF.Class.extend({
        constructor: function(x, y) {
            this.x = x;
            this.y = y;
        }
    });

    return Point;
}());