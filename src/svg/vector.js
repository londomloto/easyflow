
(function(){

    var guid = 0;

    Graph.svg.Vector = Graph.lang.Class.extend({

        attrs: {
            'stroke': '#4A4D6E',
            'stroke-width': 1,
            'fill': 'none',
            'style': '',
            'class': '' 
        },

        paper: null,
        type: '',
        selected: false,
        transformed: false,

        constructor: function(type, attrs) {
            
            this.cached = {
                clientBBox: null,
                originBBox: null
            };

            this.elem = Graph.$(Graph.doc.createElementNS(Graph.XMLNS_SVG, type));
            this.elem.data('vector', this);

            attrs = _.extend({
                'id': 'graph-node-' + (++guid)
            }, this.attrs, attrs || {});

            this.attr(attrs);
            
            this.matrix = new Graph.lang.Matrix();
            this.transformer = new Graph.util.Transformer(this);

            if (this.type != 'svg') {
                this.transformer.on({
                    transform: _.bind(function() {
                        this.transformed = true;
                    }, this)
                });

                this.elem.on('click', _.bind(function(e){
                    e.stopPropagation();
                    this.select();
                }, this));
            }
        },

        resizable: function(state) {
            state = _.defaultTo(state, true);

            if (state) {
                if ( ! this.resizer) {
                    this.resizer = new Graph.util.Resizer(this);    
                }
            } else {
                if (this.resizer) {
                    this.resizer.destroy();
                    this.resizer = null;
                }
            }

            return this;
        },

        draggable: function(config) {
            var me = this;

            config = _.extend({enabled: true}, config || {})

            if (config.enabled) {
                if ( ! this.dragger) {
                    this.dragger = new Graph.util.Dragger(this, config);    
                    this.dragger.on({
                        dragstart: function(){
                            me.fire('dragstart');
                        },
                        dragmove: function() {
                            me.fire('dragmove');
                        },
                        dragend: function() {
                            me.fire('dragend');
                        }
                    });
                }
            } else {
                if (this.dragger) {
                    this.dragger.destroy();
                    this.dragger = null;
                }
            }
            
            return this;
        },

        node: function() {
            return this.elem[0];
        },

        attr: function(name, value) {
            var me = this;

            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    me.attr(k, v);
                });
                return this;
            }

            if (_.isUndefined(value)) {
                return this.attrs[name] || '';
            }

            this.attrs[name] = value;

            if (name.substring(0, 6) == 'xlink:') {
                this.elem[0].setAttributeNS(Graph.XMLNS_XLINK, name.substring(6), String(value));
            } else {
                this.elem[0].setAttribute(name, String(value));
            }

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

            this.elem.css(name, value);
            return this;
        },

        addClass: function(added) {
            var classes = _.trim(
                _.join(
                    _.uniq(
                        _.concat(
                            _.split(this.attrs['class'], ' '),
                            _.split(added, ' ')
                        )
                    ),
                    ' '
                )
            );

            this.attr('class', classes);
        },

        removeClass: function(removed) {
            var classes = _.split(this.attrs['class'], ' ');

            _.pullAll(classes, _.split(removed, ' '));
            this.attr('class', _.join(classes, ' '));

            return this;
        },

        pathinfo: function() {
            return new Graph.lang.Path([]);
        },

        bbox: function(origin) {
            var path, bbox;

            origin = _.defaultTo(origin, false);

            if (origin) {
                bbox = this.cached.originBBox;
                if (this.transformed || ! bbox) {
                    path = this.pathinfo();
                    bbox = this.cached.originBBox = path.bbox();
                    this.transformed = false;
                }
            } else {
                bbox = this.cached.clientBBox;
                if (this.transformed || ! bbox) {
                    path = this.pathinfo().transform(this.matrix);
                    bbox = this.cached.clientBBox = path.bbox();
                    this.transformed = false;
                }
            }
            
            path = null;
            return bbox;
        },

        find: function(selector) {
            var elems = this.elem.find(selector),
                vectors = [];

            elems.each(function(i, node){
                vectors.push($(node).data('vector'));
            });

            return new Graph.svg.Collection(vectors);
        },

        render: function(container) {
            if (container instanceof Graph.svg.Vector) {
                container.elem.append(this.elem);
                this.container = container;
            } else {
                $(container).append(this.elem);
                this.container = null;
            }

            this.fire('render');
            return this;
        },

        remove: function() {
            this.elem.remove();
        },

        empty: function() {
            this.elem.empty();
        },

        select: function() {
            this.selected = true;
            this.resizer && this.resizer.render();
        },

        deselect: function() {
            this.selected = false;
            this.resizer && this.resizer.remove();
        },

        transform: function(command) {
            return this.transformer.transform(command);
        },

        translate: function(dx, dy) {
            return this.transformer.translate(dx, dy);
        },

        scale: function(sx, sy, cx, cy) {
            return this.transformer.scale(sx, sy, cx, cy);
        },

        rotate: function(deg, cx, cy) {
            return this.transformer.rotate(deg, cx, cy);
        }
    });

}());