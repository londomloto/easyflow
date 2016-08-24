
(function(){

    Graph.lang.Point = Graph.extend({
        constructor: function(x, y) {
            this.x = x;
            this.y = y;
        },

        distance: function(p) {

        },

        /**
         * Angle between point
         */
        theta: function(/* p1, p2, p3, ... */) {
            
        },

        stringify: function() {
            return this.x + ',' + this.y;
        },

        serialize: function() {
            return {x: this.x, y: this.y};
        },

        clone: function(){
            return new Graph.lang.Point(this.x, this.y);
        }
    });
    
}());