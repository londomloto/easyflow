
(function(){

    var Link = Graph.link.Link = Graph.extend({
        
        props: {
            id: null,
            guid: null,
            start: null,
            end: null,
            rendered: false,
            type: 'normal'
        },

        components: {
            coat: null,
            path: null
        },

        router: null,

        constructor: function(router, options) {
            options = _.extend({
                id: 'graph-link-' + (++Link.guid)
            }, options || {});

            _.assign(this.props, options);

            this.props.guid = this.props.id; // Graph.uuid();
            this.router = router;
            
            this.initComponent();

            this.router.on('route', _.bind(this.onRouterRoute, this));
            this.router.on('routing', _.bind(this.onRouterRoute, this));

            Graph.manager.link.register(this);
        },

        initComponent: function() {
            var comp = this.components;

            comp.block = (new Graph.svg.Group())
                .removeClass(Graph.string.CLS_VECTOR_GROUP)
                .addClass('graph-link')
                .selectable(false);

            comp.coat = (new Graph.svg.Path())
                .removeClass(Graph.string.CLS_VECTOR_PATH)
                .addClass('graph-link-coat')
                .selectable(false)
                .render(comp.block);

            comp.path = (new Graph.svg.Path())
                .removeClass(Graph.string.CLS_VECTOR_PATH)
                .addClass('graph-link-path')
                .selectable(false)
                .attr('marker-end', 'url(#marker-arrow)')
                .render(comp.block);

            for(var name in comp) {
                comp[name].elem.data(Graph.string.ID_LINK, this.props.guid);
            }
        },

        component: function() {
            return this.components.block;
        },

        render: function(container) {
            this.components.block.render(container);
        },

        id: function() {
            return this.props.id;
        },

        guid: function() {
            return this.props.guid;
        },

        connect: function(start, end) {
            // start = Graph.point(230, 110);
            // end   = Graph.point(300, 110);

            if (start) {
                this.props.start = start.toJson();
            }
            
            if (end) {
                this.props.end = end.toJson();
            }

            this.router.route(start, end);
        },

        refresh: function() {
            this.router.reroute();
        },

        redraw: function(command) {
            this.components.coat.attr('d', command);
            this.components.path.attr('d', command);
        },

        select: function() {

        },

        deselect: function() {

        },

        toString: function() {
            return 'Graph.link.Link';
        },

        ///////// OBSERVERS /////////
        
        onRouterRoute: function(e) {
            var command = e.command;
            this.redraw(command);
        }

    });

    ///////// STATICS /////////
    
    Link.guid = 0;

}());