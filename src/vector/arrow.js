
EF.vector.Arrow = (function(){
    var Point = EF.lang.Point;
    var Vector = EF.vector.Vector;
    
    var Arrow = Vector.extend({

        constructor: function(start, end) {
            this.$super('g');

            this.components = {
                path: new Vector('path'),
                startMarker: new Vector('path'),
                endMarker: new Vector('path')
            };
        },

        translate: function() {

        },

        addText: function() {

        },

        removeText: function() {

        },

        addVertex: function(point) {

        },

        removeVertex: function(point) {

        }

    });

    return Arrow;
}());