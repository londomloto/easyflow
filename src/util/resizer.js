
(function(){

    Graph.util.Resizer = Graph.lang.Class.extend({

        baseClass: 'graph-util graph-util-resizer',

        constructor: function(vector) {
            this.paper = null;
            this.vector = vector;
            this.vertext = {};
                
            this.initComponent();
        },

        initComponent: function() {
            this.component = new Graph.svg.Group();
            this.component.addClass(this.baseClass);

            var bbox = this.vector.bbox();
            console.log(bbox);

            this.rectangle = this.component.rect(0, 0);
            
            this.rectangle.attr({
                'fill': 'none',
                'stroke-dasharray': '3 3'
            });
        },

        render: function(container) {
            $(container).append(this.component.elem);
        }
    });

}());