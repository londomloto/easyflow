
(function(_, $){
    
    var REGEX_SVG_BUILDER = /^<(svg|g|rect|text|path|line|tspan|circle|polygon|defs|marker)/i;

    var domParser;

    var E = Graph.dom.Element = function(elem) {
        this.query = $(elem);
    };
    
    _.extend(E.prototype, {
        node: function() {
            return this.query[0];
        },
        length: function() {
            return this.query.length;
        },
        group: function(name) {
            if (name === undefined) {
                return this.query.data('component-group');
            }
            this.query.data('component-group', name);
            return this;
        },
        belong: function(group) {
            return this.group() == group;
        },
        attr: function(name, value) {
            var me = this, node = this.query[0];

            if (Graph.isHTML(node)) {
                this.query.attr(name, value);
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
            if (value === undefined) {
                return this.query.width();
            }
            this.query.width(value);
            return this;
        },
        height: function(value) {
            if (value === undefined) {
                return this.query.height();
            }
            this.query.height(value);
            return this;
        },
        show: function() {
            this.query.show();
            return this;
        },
        hide: function() {
            this.query.hide();
            return this;
        },
        offset: function() {
            return this.query.offset();
        },
        position: function() {
            return this.query.position();
        },
        css: function(name, value) {
            if (value === undefined) {
                return this.query.css(name);
            }
            this.query.css(name, value);
            return this;
        },  
        addClass: function(classes) {
            var node = this.query[0];
            if (Graph.isHTML(node)) {
                this.query.addClass(classes);
            } else if (Graph.isSVG(node)) {
                var currentClasses = _.split(node.className.baseVal || '', ' ');
                classes = _.split(classes, ' ');
                classes = _.concat(currentClasses, classes);
                classes = _.uniq(classes);
                classes = _.join(classes, ' ');
                node.className.baseVal = _.trim(classes);
            }
            return this;
        },
        removeClass: function(classes) {
            var node = this.query[0];
            if (Graph.isHTML(node)) {
                this.query.removeClass(classes);
            }
            return this;
        },
        hasClass: function(clazz) {
            var node = this.query[0];

            if (Graph.isHTML(node)) {
                return this.query.hasClass(clazz); 
            } else if (Graph.isSVG(node)) {
                var classes = _.split(node.className.baseVal, ' ');
                return classes.indexOf(clazz) > -1;
            }

            return false;
        },
        find: function(selector) {
            return new Graph.dom.Element(this.query.find(selector));
        },
        parent: function() {
            return new Graph.dom.Element(this.query.parent());
        },
        closest: function(element) {
            return new Graph.dom.Element(this.query.closest(element));
        },
        append: function(element) {
            this.query.append(element.query);
            return this;
        },
        prepend: function(element) {
            this.query.prepend(element.query);
            return this;
        },
        appendTo: function(element) {
            this.query.appendTo(element.query);
            return this;
        },
        prependTo: function(element) {
            this.query.prependTo(element.query);
            return this;
        },
        remove: function() {
            this.query.remove();
            this.query = null;
            return this;
        },
        detach: function() {
            this.query = this.query.detach();
            return this;
        },
        on: function(types, selector, data, fn, /*INTERNAL*/ one) {
            this.query.on.call(this.query, types, selector, data, fn, one);
            return this;
        },
        off: function(types, selector, fn) {
            this.query.off.call(this.query, types, selector, fn);
            return this;
        },
        trigger: function(type, data) {
            this.query.trigger(type, data);
            return this;
        },
        text: function(text) {
            if (text === undefined) {
                return this.query.text();
            }
            this.query.text(text);
            return this;
        },
        html: function(html) {
            if (html === undefined) {
                return this.query.html();
            }
            this.query.html(html);
            return this;
        },
        focus: function() {
            this.query.focus();
            return this;
        },
        contextmenu: function(state) {
            state = _.defaultTo(state, true);
            if ( ! state) {
                this.query.on('contextmenu', function(e){
                    return false;
                });
            }
        },
        each: function(callback) {
            this.query.each(callback);
            return this;
        },
        empty: function() {
            this.query.empty();
            return this;
        },  
        data: function(key, value) {
            if (value === undefined) {
                return this.query.data(key);
            }
            this.query.data(key, value);
            return this;
        },
        prop: function(name, value) {
            if (value === undefined) {
                return this.query.data(name);
            }
            this.query.prop(name, value);
            return this;
        },
        scrollTop: function(value) {
            if (value === undefined) {
                return this.query.scrollTop();
            }
            this.query.scrollTop(value);
            return this;
        },
        scrollLeft: function(value) {
            if (value === undefined) {
                return this.query.scrollLeft();
            }
            this.query.scrollLeft(value);
            return this;
        },
        toString: function() {
            return 'Graph.dom.Element';
        }
    });

    /// HELPERS ///

    Graph.$ = function(selector, context) {
        selector = prepare(selector);
        return new Graph.dom.Element(selector, context);
    };

    _.extend(Graph.dom, {
        doc: function() {},
        body: function() {}
    });

    ///////// HELPER /////////
    
    function prepare(selector) {
        if (_.isString(selector)) {
            if (REGEX_SVG_BUILDER.test(selector)) {
                return parseSVG(selector);
            }
        }
        return selector;
    }

    function parseSVG(string) {
        var namespace, fragment, svgdoc, element;

        if (domParser === undefined) {
            try {
                domParser = new DOMParser();
            } catch(e){
                domParser = null;
            }
        }

        if (domParser) {
            namespace = Graph.config.xmlns.svg;
            
            fragment  = '';
            fragment += '<g xmlns="'+ namespace +'">';
            fragment += string;
            fragment += '</g>';

            svgdoc = domParser.parseFromString(fragment, 'text/xml');
            element = svgdoc.documentElement.childNodes[0];
            
            svgdoc = fragment = null;
        }

        return element || null;
    }
    
}(_, jQuery));