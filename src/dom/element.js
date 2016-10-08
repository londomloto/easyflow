
(function(){
    
    var REGEX_SVG_BUILDER = /^<(path|tspan|defs|marker)/i;

    var E = Graph.dom.Element = function(elem) {
        this.elem = elem instanceof jQuery ? elem : $(elem);
    };
    
    _.extend(E.prototype, {
        node: function() {
            return this.elem[0];
        },
        length: function() {
            return this.elem.length;
        },
        group: function(name) {
            if (_.isUndefined(name)) {
                return this.elem.data('component-group');
            }
            this.elem.data('component-group', name);
            return this;
        },
        belong: function(group) {
            return this.group() == group;
        },
        attr: function(name, value) {
            var me = this, node = this.elem[0];

            if (Graph.isHTML(node)) {
                this.elem.attr(name, value);
            } else if (Graph.isSVG(node)) {

                if (_.isPlainObject(name)) {
                    _.forOwn(name, function(v, k){
                        me.attr(k, v);
                    });
                    return this;
                }

                if (name.substring(0, 6) == 'xlink:') {
                    node.setAttributeNS(Graph.config.xmlns.xlink, name.substring(6), _.toString(value));
                } else {
                    node.setAttribute(name, _.toString(value));
                }
            }

            return this;
        },
        width: function(value) {
            if (_.isUndefined(value)) {
                return this.elem.width();
            }
            this.elem.width(value);
            return this;
        },
        height: function(value) {
            if (_.isUndefined(value)) {
                return this.elem.height();
            }
            this.elem.height(value);
            return this;
        },
        show: function() {
            this.elem.show();
            return this;
        },
        hide: function() {
            this.elem.hide();
            return this;
        },
        offset: function() {
            return this.elem.offset();
        },
        position: function() {
            return this.elem.position();
        },
        addClass: function(classes) {
            var node = this.elem[0];
            if (Graph.isHTML(node)) {
                this.elem.addClass(classes);
            }
            return this;
        },
        removeClass: function(classes) {
            var node = this.elem[0];
            if (Graph.isHTML(node)) {
                this.elem.removeClass(classes);
            }
            return this;
        },
        hasClass: function(clazz) {
            var node = this.elem[0];

            if (Graph.isHTML(node)) {
                return this.elem.hasClass(clazz); 
            } else if (Graph.isSVG(node)) {
                var classes = _.split(node.className.baseVal, ' ');
                return classes.indexOf(clazz) > -1;
            }

            return false;
        },
        find: function(selector) {
            return new Graph.dom.Element(this.elem.find(selector));
        },
        parent: function() {
            return new Graph.dom.Element(this.elem.parent());
        },
        closest: function(selector) {
            return new Graph.dom.Element(this.elem.closest(selector));
        },
        append: function(elem) {
            if (Graph.isElement(elem)) {
                this.elem.append(elem.elem);
            } else {
                this.elem.append(elem);
            }
            
            return this;
        },
        prepend: function(elem) {
            if (Graph.isElement(elem)) {
                this.elem.prepend(elem.elem);
            } else {
                this.elem.prepend(elem);
            }
            return this;
        },
        appendTo: function(elem) {
            if (Graph.isElement(elem)) {
                this.elem.appendTo(elem.elem);
            } else {
                this.elem.appendTo(elem);
            }
            return this;
        },
        remove: function() {
            this.elem.remove();
            this.elem = null;
            return this;
        },
        detach: function() {
            this.elem = this.elem.detach();
            return this;
        },
        on: function(types, selector, data, fn, /*INTERNAL*/ one) {
            this.elem.on.call(this.elem, types, selector, data, fn, one);
            return this;
        },
        off: function(types, selector, fn) {
            this.elem.off.call(this.elem, types, selector, fn);
            return this;
        },
        text: function(text) {
            this.elem.text(text);
            return this;
        },
        html: function(html) {
            this.elem.html(html);
            return this;
        },
        contextmenu: function(state) {
            state = _.defaultTo(state, true);
            if ( ! state) {
                this.elem.on('contextmenu', function(e){
                    return false;
                });
            }
        },
        toString: function() {
            return 'Graph.dom.Element';
        }
    });
    
    var borrows = [
        'css', 
        'prop', 'data', 
        'each', 'hover', 'empty',
        'trigger', 'scrollTop', 'scrollLeft'
    ];

    _.forEach(borrows, function(method) {
        (function(method){
            E.prototype[method] = function() {
                var args = _.toArray(arguments), value;
                value = this.elem[method].apply(this.elem, args);
                return value instanceof jQuery ? this : value;
            };
        }(method));
    });

    /// SHORTHAND ///

    Graph.$ = function(selector, context) {
        if (_.isString(selector) && /^</.test(selector)) {
            var builder = selector.match(REGEX_SVG_BUILDER);
            if (builder) {
                selector = Graph.doc().createElementNS(Graph.config.xmlns.svg, builder[1]);    
            }
        }
        return new Graph.dom.Element(selector, context);
    };

    Graph.doc = function() {
        return document;
    };

}());