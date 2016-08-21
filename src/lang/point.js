
(function(){

    Graph.lang.Point = Graph.lang.Class.extend({
        constructor: function(x, y) {
            this.x = x;
            this.y = y;
        },

        distance: function(p) {

        },

        stringify: function() {
            return this.x + ',' + this.y;
        },

        serialize: function() {
            return {x: this.x, y: this.y};
        }
    });
    
}());