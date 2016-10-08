
(function(){

    /**
     * Layout
     *
     * Currently only supported for paper vector
     */

    Graph.layout.Layout = Graph.extend({
        
        props: {
            // view config
            fit: true,
            width: 0,
            height: 0,

            // router config
            router: {
                type: 'ortho'
            },

            // link config
            link: {
                type: 'link' // 'rounded', 'smooth'
            }
        },
        
        view: null,

        constructor: function(view, options) {
            _.assign(this.props, options || {});
            this.view = view;
        },

        cascade: function() {

        },

        width: function(width) {

        },

        height: function(height) {
            
        },

        fit: function() {

        },

        refresh: function() {
            this.fire('refresh');
        },

        place: function(vector) {
            var view = this.view;

            if (_.isArray(vector)) {
                _.forEach(vector, function(v){
                    v.render(view);
                });
                return this;
            } else {
                vector.render(view);
                return vector;
            }

        },

        snapping: function() {
            return {
                mode: 'anchor',
                x: 1,
                y: 1
            };
        },

        router: function(source, target, options) {
            var clazz = Graph.router[_.capitalize(this.props.router.type)];
            options = _.extend({}, this.props.router, options || {});
            return Graph.factory(clazz, [this.view, source, target, options]);
        },

        link: function(router, options) {
            var clazz = Graph.link[_.capitalize(this.props.link.type)];
            options = _.extend({}, this.props.link, options || {});
            return Graph.factory(clazz, [router, options]);
        }
        
    });

}());