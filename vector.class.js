
EF.Vector = (function(_, $){

    var Vector = EF.Class.extend({
        ns: 'http://www.w3.org/2000/svg',
        
        tag: '',
        node: null,
        props: {},
        
        constructor: function(tag, config) {

            // defaults
            this.tag = '';
            this.node = null;
            this.props = {};

            config = config || {};
            _.extend(this, config);

            if (tag instanceof SVGElement) {
                this.tag = tag.tagName.toLowerCase();
                this.node = $(tag);
                console.log(tag.attributes);
            } else {
                this.tag = tag;
                console.log(this.tag);
                this.node = $(document.createElementNS(this.ns, this.tag));
            }

            /*if (config instanceof SVGElement) {
                this.node = $(config);
                this.tag = config.tagName;

                _.forEach(config.attributes, _.bind(function(v){
                    this.props[v.name] = v.value;
                }, this));
            } else {
                _.extend(this, config);    
                this.node = $(document.createElementNS(this.ns, this.tag));
                console.log('x', this);
                // this.attr(this.props);
            }*/

            this.node.data('vector', this);
        },

        attr: function(name, value) {
            if (_.isPlainObject(name)) {
                _.forOwn(name, _.bind(function(v, k){ this.attr(k, v); }, this));
                return this;
            }

            if (this.props[name] === undefined) {
                this.props[name] = value;
            }

            name = name.replace(/([A-Z])/g, '-$1').toLowerCase();
            
            if (name == 'cls') {
                this.node.addClass(value);
            } else {
                this.node.attr(name, value);
            }

            return this;
        },
        append: function(vector) {
            if (_.isArray(vector)) {
                _.forEach(vector, _.bind(function(v, i){ this.append(v); }, this));
                return this;
            }

            this.node.append(vector.node[0]); 
            return this;
        },
        remove: function(selector) {
            if (selector === undefined) {
                this.node.remove();
            } else {
                this.node.find(selector).remove();
            }
            return this;
        },
        empty: function() {
            this.node.empty();
            return this;
        },
        find: function(selector) {
            var nodes = this.node.find(selector),
                array = [];

            nodes.each(function(i, el){
                var vector = $(el).data('vector');
                array.push(vector);
            });

            return new EF.Collection(array);
        },
        /**
         * @virtual
         */
        draggable: function(config) {
            /*if ( ! this.draggie) {
                this.draggie = new EF.Draggable(this, config);
            }*/
        },
        /**
         * @virtual
         */
        droppable: function(config) {
            /*if ( ! this.droppie) {
                this.droppie = new EF.Droppable(this, config);
            }*/
        },
        /**
         * @virtual
         */
        sortable: function(config) {
            /*if ( ! this.sortie) {
                this.sortie = new EF.Sortable(this, config);
            }*/
        },
        render: function(container) {
            container = container !== undefined ? $(container) : $('body');
            container.append(this.node);
        }
    });

    return Vector;
}(_, $));