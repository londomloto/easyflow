
EF.vector.Vector = (function(_, $){

    var Collection = EF.vector.Collection;

    var Vector = EF.Class.extend({
        ns: 'http://www.w3.org/2000/svg',
        
        tag: '',
        node: null,
        props: {},
        handler: {},
        
        constructor: function(tag, config) {

            // defaults
            this.tag = '';
            this.node = null;
            this.props = {};
            this.data = {};

            config = config || {};
            _.extend(this, config);

            if (tag instanceof SVGElement) {
                this.tag = tag.tagName.toLowerCase();
                this.node = $(tag);
                
                _.forEach(tag.attributes, _.bind(function(a){
                    this.prop(a.name, a.value);
                }, this));
            } else {
                this.tag = tag;
                this.node = $(document.createElementNS(this.ns, this.tag));
                this.attr(this.props);
            }

            this.node.data('vector', this);
        },

        // @Override
        toString: function() {
            return $('<div>').append(this.node).remove().html();
        },

        attr: function(name, value) {
            if (_.isPlainObject(name)) {
                _.forOwn(name, _.bind(function(v, k){ this.attr(k, v); }, this));
                return this;
            }

            if (value === undefined) {
                return this.prop(name);
            }

            this.prop(name, value);
            this.node[0].setAttribute(name, value);

            return this;
        },

        prop: function(name, value) {
            if (_.isPlainObject(name)) {
                _.forOwn(name, _.bind(function(v, k){ this.props(k, v); }, this));
                return this;
            }

            if (value === undefined) {
                return this.props[name];
            }

            this.props[name] = value;
        },

        style: function(css, value) {
            this.node.css(css, value);
        },

        addClass: function(addedClass) {
            var classes = _.uniq(
                _.concat(
                    _.split((this.attr('class') || ''), ' '),
                    _.split(addedClass, ' ')
                )
            );
            
            this.attr('class', _.trim(_.join(classes, ' ')));
        },

        removeClass: function(removedClass) {
            var classes = _.split((this.attr('class') || ''), ' ');
            _.pullAll(classes, _.split(removedClass, ' '));
            this.attr('class', _.join(classes, ' '));
        },

        text: function(text) {
            this.props.text = this.props.text || '';

            if (text === undefined) {
                return this.props.text;
            }

            this.props.text = text;
            this.node.html(text);
        },

        append: function(vector) {
            
            if (_.isArray(vector)) {
                _.forEach(vector, _.bind(function(v, i){ this.append(v); }, this));
                return this;
            }

            if (_.isString(vector)) {
                vector = new Vector(vector);
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

            return new Collection(array);
        },
        render: function(container) {
            if (container instanceof Vector) {
                container.node.append(this.node);
            } else if (container instanceof jQuery) {
                container.append(this.node);
            }

            this.container = container;
        },

        on: function(evt, func) {
            var handler = {
                func: _.bind(func, this),
                orig: func
            };

            this.handler[evt] = this.handler[evt] || [];
            this.handler[evt].push(handler);

            this.node.on(evt, handler.func);
            return this;
        },

        off: function(evt, func) {
            if (func === undefined) {
                this.node.off(evt);
                this.handler[evt] = [];
            } else {
                if (this.handler[evt] && this.handler[evt].length) {
                    var handler = _.find(this.handler[evt], function(h){
                        return h.orig === handler;
                    });

                    if (handler) {
                        this.node.off(evt, handler.func);
                        _.pull(this.handler[evt], handler);
                    }
                }
            }
        }
    });
    
    /**
     * Extend collection capabilities
     */
    _.forOwn(Vector.prototype, function(v, k){
        if (_.isFunction(v) && Collection.prototype[k] === undefined) {
            Collection.prototype[k] = function() {
                var args = _.toArray(arguments);
                _.forEach(this.items, function(item){
                    v.apply(item, args);
                });
                return this;
            };
        }
    });

    return Vector;
}(_, jQuery));