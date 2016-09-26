
(function(){
    var guid = 0;

    var Base = Graph.shape.Base = Graph.extend({
        props: {},

        page: null,
        ports: [],
        rendered: false,
        connectors: [],
        components: {},

        tree: {
            parent: null,
            children: null
        },

        events: {
            render: true,
            resize: true,
            rotate: true
        },

        constructor: function(config) {
            var me = this;

            me.props.id = 'graph-shape-' + (++guid);

            _.extend(me.props, config || {});

            me.tree.children = new Graph.collection.Shape();
            me.initComponent();

            if (me.components.group) {
                me.components.group.on('render', function(){
                    me.rendered = true;
                    me.fire('render', me);
                });
            } else {
                console.warn("Component group is required!");
            }
        },

        id: function() {
            return this.props.id;
        },

        // @Virtual
        initComponent: function() {},

        parent: function() {
            return this.tree.parent;
        },

        children: function() {
            return this.tree.children;
        },

        render: function(parent, method) {
            var me = this, comp = this.components;
            var drawer;

            if (comp.group) {
                
                parent = _.defaultTo(parent, me.page);
                method = _.defaultTo(method, 'append');

                if (parent.canvas) {
                    me.page = parent;
                    drawer  = parent.canvas;
                } else {
                    me.page = parent.page;
                    drawer  = parent.components.group;
                }

                me.tree.parent = parent;

                switch(method) {
                    case 'append':
                        parent.children().push(me);
                        drawer.append(comp.group);
                        break;

                    case 'prepend':
                        parent.children().unshift(me);
                        drawer.prepend(comp.group);
                        break;
                }
            }
            
            return me;
        },

        append: function(shape) {
            shape.render(this, 'append');
            return shape;
        },

        prepend: function(shape) {
            shape.render(this, 'prepend');
            return shape;
        },

        data: function(name, value) {
            var me = this;

            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    me.data(k, v);
                });
                return this;
            }

            if (_.isUndefined(name) && _.isUndefined(value)) {
                return this.props;
            }
            
            if (_.isUndefined(value)) {
                return this.props[name];
            }

            this.props[name] = value;

            return this;
        },

        text: function() {
            return this.components.text ? this.components.text.props.text : '';
        },

        isPage: function() {
            return false;
        }

    });
    
}());