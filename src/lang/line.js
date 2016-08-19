
EF.lang.Line = (function(){

    var Line = EF.Class.extend({
        
        constructor: function(start, end) {
            this.start = start;
            this.end = end;
        },
        
        length: function() {
            return this.start.distance(this.end);
        }
    });
    
    return Line;
}());