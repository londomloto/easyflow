
(function(){

    Graph.util.Transformer = Graph.lang.Class.extend({
        constructor: function(vector) {
            this.vector = vector;
            this.matrix = new Graph.lang.Matrix();
        }
    });

}());