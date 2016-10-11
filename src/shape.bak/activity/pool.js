
(function(){

    Graph.shape.activity.Pool = Graph.shape.Base.extend({
        
        props: {
            x: 0,
            y: 0,
            height: 0,
            offsetTop: 0,
            offsetLeft: 0
        },
        
        constructor: function(config) {
            // this.$super(config);
            this.superclass.prototype.constructor.call(this, config);
        },

        initComponent: function() {
            var comp = this.components,
                prop = this.props;

            comp.group = new Graph.svg.Group();
            comp.group.sortable();
            
            comp.group.addClass('graph-shape graph-shape-activity-pool');
            comp.group.translate(prop.x, prop.y).commit();
            comp.group.data('selectable', false);
            comp.group.on('render', _.bind(this.onGroupRender, this));
        },

        onGroupRender: function() {
            var me = this;
            
            me.props.offsetTop  = me.props.y;
            me.props.offsetLeft = me.props.x;

            me.children().each(function(lane){
                console.log(lane.text());
            });
        }

    });

}());