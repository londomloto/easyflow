
(function(){
    
    Graph.shape.activity.Action = Graph.shape.Base.extend({
        props: {
            x: 0,
            y: 0,
            
            width: 200,
            height: 50,

            text: 'Action'
        },

        initComponent: function() {
            var comp = this.components,
                prop = this.props;

            // component: `group`
            comp.group = new Graph.svg.Group();
            comp.group.draggable();

            comp.group.on({
                render: _.bind(this.onGroupRender, this)
            });

            // component: `block`
            comp.block = comp.group.append(new Graph.svg.Rect(0, 0, prop.width, prop.height));
            comp.block.resizable();
            comp.block.linkable();
            comp.block.on({
                resize: _.bind(this.onBlockResize, this)
            });

            // component: `text`
            comp.text = comp.group.append(new Graph.svg.Text(0, 0, prop.text));
            comp.text.selectable(false);
            comp.text.clickable(false);

            comp.text.on({
                render: _.bind(this.onTextRender, this)
            });

        },

        centerText: function() {
            this.components.text.center(this.components.block);
        },

        onGroupRender: function() {
            var comp = this.components;
            comp.group.translate(this.props.x, this.props.y).commit();
        },

        onBlockResize: function() {
            this.centerText();
        },

        onTextRender: function() {
            this.centerText();
        }
    });

}());