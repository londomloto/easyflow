
(function(){

    Graph.svg.Group = Graph.svg.Vector.extend({
        constructor: function(x, y) {
            this.$super('g');

            if ( ! _.isUndefined(x) && ! _.isUndefined(y)) {
                this.matrix.translate(x, y);
                this.attr('transform', this.matrix.stringify());
            }

            this.items = new Graph.svg.Collection();
        }
    });

    var enums = {
        circle: 'Circle',
        rect: 'Rectangle',
        path: 'Path',
        polygon: 'Polygon',
        group: 'Group'
    };

    _.forOwn(enums, function(name, method){
        (function(name, method){
            Graph.svg.Group.prototype[method] = function() {
                var args = _.toArray(arguments);
                var clazz = Graph.svg[name];
                args.unshift(clazz);
                var vector = new (Function.prototype.bind.apply(clazz, args));
                this.append(vector);
                this.items.push(vector);
                return vector;
            };
        }(name, method));
    });

}());