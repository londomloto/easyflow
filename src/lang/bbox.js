
(function(){
    
    var BBox = Graph.lang.BBox = Graph.extend({
        constructor: function(bbox) {
            this.bbox = bbox;
        },
        value: function() {
            return this.bbox;
        },
        clone: function() {
            return new BBox(_.extend({}, this.bbox));
        }
    });

}());