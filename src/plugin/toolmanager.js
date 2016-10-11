
(function(){

    Graph.plugin.ToolManager = Graph.extend({

        props: {
            vector: null,
            current: null
        },

        tools: {

        },

        constructor: function(vector) {
            var me = this;

            me.props.vector = vector.guid();

            if (vector.isPaper()) {
                Graph.topic.subscribe('paper/collect', function(){
                    me.activate('panzoom');
                });
            }

        },

        vector: function() {
            return Graph.manager.vector.get(this.props.vector);
        },

        has: function(tool) {
            return !!this.tools[tool];
        },

        get: function(name) {
            var data = this.tools[name],
                vector = this.vector();

            if (data) {
                switch(data.type) {
                    case 'plugin':
                        return vector.plugins[name];
                    case 'util':
                        return vector.utils[name];
                }
            }

            return null;
        },

        current: function() {
            return this.props.current;
        },

        register: function(name, type) {
            type = _.defaultTo(type, 'plugin');

            this.tools[name] = {
                name: name,
                type: type,
                enabled: false
            };
        },

        unregister: function(name) {
            if (this.tools[name]) {
                delete this.tools[name];
            }
        },

        activate: function(name) {
            var tool = this.get(name), data;

            if (tool) {
                this.deactivateAll(name);
                this.props.current = name;

                data = this.tools[name];
                data.enabled = true;

                tool.enable();

                this.fire('activate', {
                    name: data.name,
                    enabled: data.enabled
                });
            }
        },

        deactivate: function(name) {
            var tool = this.get(name), data;

            if (tool) {
                data = this.tools[name];
                data.enabled = false;
                this.props.current = null;

                tool.disable();

                this.fire('deactivate', {
                    name: data.name,
                    enabled: data.enabled
                });
            }
        },

        deactivateAll: function(except) {
            var vector = this.vector();

            for(var name in this.tools) {
                if (name != except) {
                    this.deactivate(name);
                }
            }

        },

        toggle: function(tool) {
            var data = this.tools[tool];
            if (data) {
                if (data.enabled) {
                    this.deactivate(tool);
                } else {
                    this.activate(tool);
                }
            }
        }


    });


}());