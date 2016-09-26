
(function(){

    /**
     * Manhattan router
     */

    Graph.util.Router = Graph.extend({

        props: {
            type: 'manhattan',
            step: 10
        },

        components: {

        },

        constructor: function(type) {
            this.props.type = type || 'manhattan';
            this.initComponent();
        },

        initComponent: function() {
            var comp = this.components;

            comp.block = new Graph.svg.Group();
            comp.block.addClass('graph-util-router');
            comp.block.removeClass('graph-elem graph-elem-group');
            comp.block.props.selectable = false;
            comp.block.props.collectable = false;
            
            
        },

        type: function(type) {
            if (_.isUndefined(type)) {
                return this.props.type;
            }
            this.props.type = type;
            return this;
        },

        render: function(canvas) {
            this.canvas = canvas;
            this.canvas.append(this.components.block);
        }
    });

}());