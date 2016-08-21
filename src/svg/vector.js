
(function(){

    Graph.svg.Vector = Graph.lang.Class.extend({
        
        baseClass: '',
        attrs: {},

        constructor: function(type, attr) {
            // defaults
            this.paper = null;
            this.attrs = {};
            this.type = type;

            this.elem = $(document.createElementNS('http://www.w3.org/2000/svg', type));
            this.elem.data('vector', this);

            attr = _.extend({ id: 'graph-elem-' + (++Graph.svg.Vector.id) }, attr || {});

            this.attr(attr);
            this.addClass('graph-elem' + (this.baseClass ? ' ' + this.baseClass : ''));

            this.decorator = new Graph.util.Decorator(this);
            this.transformer = new Graph.util.Transformer(this);
        },

        node: function() {
            return this.elem[0];
        },  

        resizable: function() {
            if ( ! this.resizer) {
                this.resizer = new Graph.util.Resizer(this);    
            }
            return this;
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
            this.elem[0].setAttribute(name, value);
            
            return this;
        },

        pathinfo: function() {
            var a = this.attrs;
            var p;

            switch(this.type) {
                case 'path':
                    p = new Graph.lang.Path(a.d);
                    break;

                case 'circle':
                    p = new Graph.lang.Path([
                        ['M', a.cx, a.cy],
                        ['m', 0, -a.r],
                        ['a', a.r, a.r, 0, 1, 1, 0,  2 * a.r],
                        ['a', a.r, a.r, 0, 1, 1, 0, -2 * a.r],
                        ['z']
                    ]);
                    break;

                case 'rect':
                case 'image':
                    if (a.r) {
                        p = new Graph.lang.Path([
                            ['M', a.x + a.r, a.y], 
                            ['l', a.width - a.r * 2, 0], 
                            ['a', a.r, a.r, 0, 0, 1, a.r, a.r], 
                            ['l', 0, a.height - a.r * 2], 
                            ['a', a.r, a.r, 0, 0, 1, -a.r, a.r], 
                            ['l', a.r * 2 - a.width, 0], 
                            ['a', a.r, a.r, 0, 0, 1, -a.r, -a.r], 
                            ['l', 0, a.r * 2 - a.height], 
                            ['a', a.r, a.r, 0, 0, 1, a.r, -a.r], 
                            ['z']
                        ]);
                    } else {
                        p = new Graph.lang.Path([
                            ['M', a.x, a.y], 
                            ['l', a.width, 0], 
                            ['l', 0, a.height], 
                            ['l', -a.width, 0], 
                            ['z']
                        ]);    
                    }
                    break;
                case 'g':
                    var bbox = {};
                        
                    try {
                        bbox = this.elem[0].getBBox();
                    } catch(e) {
                        bbox = {
                            x: this.elem[0].clientLeft,
                            y: this.elem[0].clientTop,
                            width: this.elem[0].clientWidth,
                            height: this.elem[0].clientHeight
                        };
                    } finally {
                        bbox = bbox || {};
                    }
                    
                    p = new Graph.lang.Path([
                        ['M', bbox.x, bbox.y], 
                        ['l', bbox.width, 0], 
                        ['l', 0, bbox.height], 
                        ['l', -bbox.width, 0], 
                        ['z']
                    ]);
                    break;
            }

            return p;
        },

        bbox: function() {
            var path = this.pathinfo(),
                bbox = path.dimension();

            path = null;
            return bbox;
        },

        addClass: function(added) {
            var classes = _.trim(
                _.join(
                    _.uniq(
                        _.concat(
                            _.split((this.attrs['class'] || ''), ' '),
                            _.split(added, ' ')
                        )
                    ),
                    ' '
                )
            );

            this.attr('class', classes);
        },

        find: function(selector) {
            var elems = this.elem.find(selector),
                vectors = [];

            elems.each(function(i, node){
                vectors.push($(node).data('vector'));
            });

            return new Graph.svg.Collection(vectors);
        },

        append: function(vector) {
            if (_.isString(vector)) {
                vector = new Graph.svg.Vector(vector);
            }
            this.elem.append(vector.elem);
            return this;
        },

        render: function(container) {
            $(container).append(this.elem);
        },

        translate: function(x, y) {
            // this.matrix.translate(x, y);
            // this.attr('transform', this.matrix.stringify());
        },

        rotate: function(angle, cx, cy) {
            // this.matrix.rotate(angle, cx, cy);
            // this.attr('transform', this.matrix.stringify());
        },

        scale: function(x, y, cx, cy) {
            // this.matrix.scale(x, y, cx, cy);
            // this.attr('transform', this.matrix.stringify());
        },

        drag: function(config) {
            /*var me = this;
            interact(this.elem[0]).draggable({
                inertia: true,
                onmove: function(e) {
                    me.matrix.translate(e.dx, e.dy);
                    me.attr('transform', me.matrix.stringify());
                }
            });*/
        }
    });

    Graph.svg.Vector.id = 0;
}());