
(function(){

    Graph.layout.Layout = Graph.extend({
        
        props: {
            // view config
            fit: true,
            view: null,
            width: 0,
            height: 0,

            // router config
            router: {
                type: 'orthogonal'
            },

            link: {
                smooth: false
            }
        },
        
        view: null,

        cached: {
            offset: null
        },

        constructor: function(view, options) {
            _.assign(this.props, options || {});
            this.props.view = view.guid();
        },

        view: function() {
            return Graph.registry.vector.get(this.props.view);
        },

        offset: function() {
            var offset = this.cached.offset;
            var view, node;

            if ( ! offset) {
                view = this.view();
                node = view.isViewport() ? view.parent().node() : view.node();
                offset = node.getBoundingClientRect();
                this.cached.offset = offset;
            }

            return offset;
        },

        invalidate: function() {
            this.cached.offset = null;
        },

        width: function() {

        },

        height: function() {
            
        },

        fit: function() {

        },

        refresh: function(vector) {
            // vector = _.defaultTo(vector, this.view);
            this.fire('refresh');
        },

        grabVector: function(event) {
            return Graph.registry.vector.get(event.target);
        },

        grabLocation: function(event) {
            var x = event.clientX,
                y = event.clientY,
                m = this.view().matrix().clone().invert(),
                p = {
                    x: m.x(x, y),
                    y: m.y(x, y)
                };

            m = null;
            return p;
        },

        currentScale: function() {
            return this.view().matrix().scale();
        },

        dragSnapping: function() {
            return {
                mode: 'anchor',
                x: 1,
                y: 1
            };
        },
        
        createRouter: function(source, target, options) {
            var clazz, router;

            clazz   = Graph.router[_.capitalize(this.props.router.type)];
            options = _.extend({}, this.props.router, options || {});
            router  = Graph.factory(clazz, [this.view(), source, target, options]);

            return router;
        },

        createLink: function(router, options) {
            var clazz, link;

            clazz   = Graph.link[_.capitalize(this.props.router.type)];
            options = _.extend({}, this.props.link, options || {});
            link    = Graph.factory(clazz, [router, options]);

            return link;
        }
        
    });

}());