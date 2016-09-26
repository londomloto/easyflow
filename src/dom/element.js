
(function(){
    
    var E = Graph.dom.Element = function(elem) {
        this.elem = elem instanceof jQuery ? elem : $(elem);
    };

    _.extend(E.prototype, {
        node: function() {
            return this.elem[0];
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
        on: function(types, selector, data, fn, /*INTERNAL*/ one) {
            this.elem.on.call(this.elem, types, selector, data, fn, one);
            return this;
        },
        off: function(types, selector, fn) {
            this.elem.off.call(this.elem, types, selector, fn);
            return this;
        }
    });
    
    var borrows = [
        'css', 
        'prop', 'data', 
        'each', 'hover', 'empty', 'remove',
        'trigger', 'scrollTop', 'scrollLeft', 'html',
        'text'
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
        return new Graph.dom.Element($(selector, context));
    };

    Graph.$svg = function(type) {
        var node = document.createElementNS(Graph.config.xmlns.svg, type);
        return new Graph.dom.Element($(node));
    };

    Graph.doc = function() {
        return document;
    };

}());