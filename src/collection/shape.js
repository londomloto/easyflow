
(function(){

    var Collection = Graph.collection.Shape = Graph.extend({
        
        items: [],

        constructor: function(shapes) {
            this.items = shapes || [];
        },

        length: function() {
            return this.items.length;
        },
        
        push: function(shape) {
            this.items.push(shape);
            this.fire('push', shape, this);
        },

        pop: function() {

        },

        shift: function() {

        },

        unshift: function(shape) {
            this.items.unshift(shape);
            this.fire('unshift', shape, this);
        },

        last: function() {
            return _.last(this.items);
        },

        each: function(predicate) {
            var me = this;
            _.forEach(me.items, function(c, i){
                (function(c){
                    predicate.call(c, c, i);
                }(c));
            });
        }
    });

}());