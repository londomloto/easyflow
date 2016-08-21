
(function(){

    Graph.shape.Shape = Graph.lang.Class.extend({
        
        vector: null,
        baseClass: 'graph-shape',
        selected: false,
        
        constructor: function() {
            this.vector = new Graph.svg.Group();
            this.vector.addClass(this.baseClass);
        },

        select: function() {
            this.selected = true;
        },

        deselect: function() {
            this.selected = false;
        },

        resize: function() {

        },  

        render: function(container) {
            $(container).append(this.vector.elem);
        }
    });

}());