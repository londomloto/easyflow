
(function(){

    var Link = Graph.util.Link = Graph.extend({
        
        props: {
            router: 'manhattan'
        },

        source: null,
        target: null,
        router: null,
        canvas: null,

        routes: [],

        components: {
            block: null,
            path: null
        },

        constructor: function(canvas, source, target, options) {

            _.extend(this.props, options || {});

            this.canvas = canvas;
            this.source = source;
            this.target = target;

            this.source.addLink(this);
            this.target.addLink(this);

            this.initComponent();
        },

        initComponent: function() {
            var comp = this.components;

            comp.block = new Graph.svg.Group();
            comp.block.addClass('graph-util-link');
            comp.block.removeClass('graph-elem graph-elem-group');
            comp.block.props.selectable = false;
            comp.block.props.collectable = false;

            comp.path = new Graph.svg.Path('M 0 0');
            comp.path.addClass('graph-util-link-path');
            comp.path.removeClass('graph-elem graph-elem-path');
            comp.path.props.selectable = false;
            comp.path.props.collectable = false;
            comp.path.attr('marker-end', 'url(#marker-arrow)');
            comp.path.render(comp.block);
        },

        createRouter: function() {
            var type = this.props.router, router;

            switch(type) {
                default:
                case 'manhattan':
                    router = new Graph.router.Manhattan(
                        this.canvas,
                        this.source,
                        this.target
                    );
                    break;
            }

            return router;
        },

        createCommand: function(routes) {
            var segments = [];

            _.forEach(routes, function(p, i){
                var x = p.props.x,
                    y = p.props.y;

                if (i === 0) {
                    segments.push(['M', x, y]);
                } else {
                    segments.push(['L', x, y]);
                }
            });

            return Graph.seg2cmd(segments);
        },

        connect: function(routes) {
            var me = this,
                comp = me.components,
                command = '';

            if (routes) {
                me.routes = routes;
            } else {
                if ( ! me.router) {
                    me.router = me.createRouter();
                }
                me.routes = me.router.route();
            }

            if (me.routes.length) {
                command = me.createCommand(me.routes);
                comp.path.attr('d', command);
            }

            if ( ! comp.block.rendered) {
                comp.block.render(me.canvas);    
            }

            this.fire('connect', this);
        },

        disconnect: function() {
            this.fire('disconnect', this);
        },

        refresh: function() {
            var me = this, command;

            if ( ! me.router) {
                me.router = me.createRouter();
            }
            
            me.routes = me.router.route();
            
            if (me.routes.length) {
                command = me.createCommand(me.routes);
                me.components.path.attr('d', command);
            }
        }
    });

}());