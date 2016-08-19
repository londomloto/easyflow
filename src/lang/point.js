
EF.lang.Point = (function(){

    var Point = EF.Class.extend({
        
        constructor: function(x, y) {
            this.x = x;
            this.y = y;
        },

        distance: function(p) {
            
            // return (new EF.lang.Line(this, p)).length();
        }
    });

    return Point;
}());