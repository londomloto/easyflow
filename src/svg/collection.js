
(function(){
    var Collection;

    Graph.svg.Collection = Collection = Graph.lang.Class.extend({
        constructor: function(items) {
            this.items = items || [];
        },

        push: function() {
            var args = _.toArray(arguments);
            Array.prototype.push.apply(this.items, args);
            return this;
        },

        pop: function() {

        },

        shift: function() {

        },

        unshift: function() {

        },
        each: function(handler) {
            _.forEach(this.items, function(item){
                handler.call(item, item);
            });
        },
        pathinfo: function() {
            var bbox = this.bbox(), path;
            return new Graph.lang.Path([

            ]);
        },
        bbox: function() {
            var bbox = {};
            return bbox;
        }
    });

    _.forOwn(Graph.svg.Vector.prototype, function(value, name){
        (function(name, value){
            if (_.isUndefined(Collection.prototype[name]) && _.isFunction(value)) {
                Collection.prototype[name] = function() {
                    var args = _.toArray(arguments);
                    
                    this.each(function(item){
                        item[name].apply(item, args);
                    });

                    return this;
                };
            }
        }(name, value));
    });

}());