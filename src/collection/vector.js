
(function(){

    var Collection = Graph.collection.Vector = Graph.extend({

        items: [],

        constructor: function(items) {
            this.items = items || [];
        },

        has: function(vector) {
            return _.indexOf(this.items, vector) > -1;
        },
        
        not: function(vector) {
            var items = _.filter(this.items, function(o) {
                return o !== vector;
            });
            return new Collection(items);
        },
        
        length: function() {
            return this.items.length;
        },

        indexOf: function(vector) {
            return _.indexOf(this.items, vector);
        },
        
        push: function(vector) {
            this.items.push(vector);
            this.fire('push', vector, this);
            return this;
        },

        pop: function() {
            this.items.pop();
        },

        shift: function() {
            this.items.shift();
        },

        unshift: function(vector) {
            this.items.unshift(vector);
            this.fire('unshift', vector, this);
            return this;
        },

        pull: function(vector) {
            _.pull(this.items, vector);
            this.fire('pull', vector, this);
            return this;
        },

        each: function(handler) {
            _.forEach(this.items, function(vector){
                handler.call(vector, vector);
            });
        },
        
        pathinfo: function() {
            var bbox = this.bbox(), path;
            return new Graph.lang.Path([]);
        },
        
        bbox: function() {
            var x = [], y = [], x2 = [], y2 = [];
            var box;

            for (var i = this.items.length - 1; i >= 0; i--) {
                box = this.items[i].bbox(false, false).data();

                x.push(box.x);
                y.push(box.y);
                x2.push(box.x + box.width);
                y2.push(box.y + box.height);
            }   

            x  = _.min(x);
            y  = _.min(y);
            x2 = _.max(x2);
            y2 = _.max(y2);

            return new Graph.lang.BBox({
                x: x,
                y: y,
                x2: x2,
                y2: y2,
                width: x2 - x,
                height: y2 - y
            });
        },

        toArray: function() {
            return this.items;
        }
    });

    _.forOwn(Graph.svg.Vector.prototype, function(value, name){
        (function(name, value){
            if (_.isUndefined(Collection.prototype[name]) && _.isFunction(value)) {
                Collection.prototype[name] = function() {
                    var args = _.toArray(arguments);
                    
                    this.each(function(vector){
                        vector[name].apply(vector, args);
                    });
                    
                    return this;
                };
            }
        }(name, value));
    });

}());