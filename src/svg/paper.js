
(function(){

    Graph.svg.Paper = Graph.svg.Vector.extend({
        baseClass: 'graph-elem-paper',

        constructor: function(x, y, width, height) {
            this.items = new Graph.svg.Collection();

            var attr = {
                version: '1.1',
                xmlns: 'http://www.w3.org/2000/svg'
            };

            _.extend(attr, {
                width: _.defaultTo(width, 0),
                height: _.defaultTo(height, 0)
            });

            this.$super('svg', attr);
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
        circle: 'Circle',
        rect: 'Rectangle',
        path: 'Path',
        polygon: 'Polygon',
        group: 'Group'
    };

    _.forOwn(vectors, function(name, method){
        (function(name, method){
            Graph.svg.Paper.prototype[method] = function() {
                var args, clazz, vector;

                args = _.toArray(arguments);
                clazz = Graph.svg[name];
                args.unshift(clazz);

                vector = new (Function.prototype.bind.apply(clazz, args));
                vector.paper = this;
                vector.render(this.elem);
                
                this.items.push(vector);
                return vector;
            };
        }(name, method));
    });

}());