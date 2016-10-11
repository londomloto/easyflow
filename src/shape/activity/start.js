
(function(){

    Graph.ns('Graph.shape.activity');

    Graph.shape.activity.Start = Graph.extend(Graph.shape.Shape, {
        
        props: {
            label: 'Start',
            attrs: {
                cx: 30,
                cy: 30,
                rx: 30,
                ry: 30
            }
        },

        initComponent: function() {
            var comp = this.components,
                prop = this.props;

            comp.group = (new Graph.svg.Group())
                .selectable(false);

            comp.ellipse = (new Graph.svg.Ellipse())
                .attr(prop.attrs)
                .render(comp.group);

            comp.ellipse.draggable({ghost: true});
            comp.ellipse.linkable();
            comp.ellipse.resizable();

        },

        component: function() {
            return this.components.group;
        },

        move: function(x, y) {
            this.components.ellipse.translate(x, y).commit();
        }

    });

}());