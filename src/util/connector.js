
(function(){

    Graph.util.Connector = Graph.extend({
        
        ports: {
            source: null,
            target: null
        },

        components: {

        },

        constructor: function() {
            var me = this;
            
            this.cached = {
                vertices: null
            };

            this.initComponent();
        },
        
        initComponent: function() {
            var me = this, comp = this.components;

            comp.block = new Graph.svg.Group();
            comp.block.addClass('graph-util-connector');
            comp.block.removeClass('graph-elem graph-elem-group');

            comp.wrap = comp.block.append(new Graph.svg.Path('M 0 0'));
            comp.wrap.addClass('graph-util-connector-wrap');
            comp.wrap.removeClass('graph-elem graph-elem-path');
            comp.wrap.selectable(false);
            comp.wrap.collectable(false);

            comp.wrap.elem.on({
                click: function(e) {
                    e.stopPropagation();
                    me.select();
                }
            });

            comp.core  = comp.block.append(new Graph.svg.Path('M 0 0'));
            
            comp.core.attr({
                'marker-end': 'url(#marker-arrow)'
            });

            comp.core.addClass('graph-util-connector-core');
            comp.core.removeClass('graph-elem graph-elem-path');
            comp.core.collectable(false);

            comp.core.elem.on({
                click: function(e) {
                    e.stopPropagation();
                    me.select();
                }
            });

        },

        connect: function(source, target, linker) {
            var me = this,
                comp = me.components,
                x0 = source.props.x,
                y0 = source.props.y,
                x1 = target.props.x,
                y1 = target.props.y;

            comp.core.startAt(x0, y0);
            comp.core.stopAt(x1, y1);
        },

        source: function(port) {
            var me = this,
                x = port.props.x,
                y = port.props.y;

            if (_.isUndefined(port)) {
                return me.ports.source;
            }

            me.ports.source = port;

            me.components.wrap.moveTo(x, y);
            me.components.core.moveTo(x, y);

            return me;
        },

        target: function(port) {
            var me = this,
                x = port.props.x,
                y = port.props.y;

            if (_.isUndefined(port)) {
                return me.ports.target;
            }
            me.ports.target = port;

            me.components.wrap.closeTo(x, y);
            me.components.core.closeTo(x, y);

            return me;
        },

        expand: function(x, y) {
            var me = this;

            // me.components.wrap.expandTo(x, y);
            me.components.core.expandTo(x, y);

            return me;
        },

        render: function(canvas) {
            var comp = this.components;

            if ( ! comp.block.rendered) {
                comp.block.render(canvas);
            }
        },

        component: function() {
            return this.components.block;
        },

        vertices: function() {
            var comp = this.components;
            
            if (comp.core.dirty || _.isNull(this.cached.vertices)) {
                this.cached.vertices = [];
            }

            return this;
        },

        select: function() {
            var comp = this.components,
                path = comp.core.pathinfo();

            console.log(path);
        }

    });

}());