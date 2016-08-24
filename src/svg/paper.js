
(function(){

    Graph.svg.Paper = Graph.svg.Vector.extend({
        attrs: {
            'class': 'graph-paper'
        },
        
        constructor: function(width, height) {
            this.items = new Graph.svg.Collection();

            this.$super('svg', {
                'xmlns': Graph.XMLNS_SVG,
                'xmlns:link': Graph.XMLNS_XLINK,
                'version': Graph.SVG_VERSION,
                'width': _.defaultTo(width, 200),
                'height': _.defaultTo(height, 200)
            });

            this.style({
                overflow: 'hidden',
                position: 'relative'
            });

            this.elem.on('click', _.bind(function(e){
                this.items.deselect();
            }, this));
        },

        shape: function(name, config) {
            var clazz, shape;

            clazz = _.capitalize(name);
            shape = new Graph.shape[clazz](config);
            shape.render(this.elem);

            return shape;
        },

        render: function(container) {
            this.container = $(container);
            this.container.append(this.elem);

            return this;
        }
    });

    var vectors = {
        ellipse: 'Ellipse',
        circle: 'Circle',
        rect: 'Rect',
        path: 'Path',
        polygon: 'Polygon',
        group: 'Group',
        text: 'Text'
    };

    _.forOwn(vectors, function(name, method){
        (function(name, method){
            Graph.svg.Paper.prototype[method] = function() {
                var args = _.toArray(arguments),
                    clazz = Graph.svg[name], 
                    vector = Graph.factory(clazz, args);

                vector.render(this);    
                vector.paper = this;

                this.items.push(vector);
                return vector;
            };
        }(name, method));
    });

}());