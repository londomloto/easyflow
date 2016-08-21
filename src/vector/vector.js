
EF.vector.Vector = (function(_, $){

    var Collection = EF.vector.Collection;

    var Vector = EF.Class.extend({
        
        node: null,
        handler: {},
        
        constructor: function(tag, attr) {

            // defaults
            this.handler = {};

            if (tag instanceof SVGElement) {
                this.node = $(tag);
            } else {
                this.node = $(document.createElementNS('http://www.w3.org/2000/svg', tag));
            }

            if (attr) {
                this.attr(attr);
            }

            this.node.data('vector', this);
        },

        attr: function(name, value) {
            var me = this;
            
            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    me.attr(k, v);
                });
                return this;
            }

            if (value === undefined) {
                return this.node.attr(name);
            }

            this.node[0].setAttribute(name, value);
            
            return this;
        },

        addClass: function(add) {
            var classes = _.uniq(
                _.concat(
                    _.split(this.attr('class') || '', ' '),
                    _.split(add, ' ')
                )
            );

            this.attr('class', _.trim(_.join(classes, ' ')));
            
            return this;
        },

        removedClass: function(remove) {
            var classes = _.split(this.attr('class') || '', ' ');
            
            _.pullAll(classes, _.split(remove, ' '));
            this.attr('class', _.join(classes, ' '));

            return this;
        },

        style: function(name, value) {
            var me = this;

            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    me.style(k, v);
                });

                return this;
            }

            this.node.css(name, value);

            return this;
        },

        text: function(text) {
            if (text === undefined) {
                return this.node.html();
            }

            this.node.html(text);

            return this;
        },

        append: function(vector) {
            var nodes = [];

            if ( ! _.isArray(vector)) {
                vector = [vector];
            }

            nodes = _.map(vector, function(v){
                if (_.isString(v)) {
                    v = new Vector(v);
                }
                return v.node;
            });

            this.node.append(nodes);

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
            var nodes = this.node.find(selector);
            var array = [];

            nodes.each(function(i, e){
                array.push($(e).data('vector'));
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
        },

        stringify: function() {
            return $('<div>').append(this.node).remove().html();
        },

        serialize: function() {
            return {};
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