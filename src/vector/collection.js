
EF.vector.Collection = (function(_){

    var Collection = EF.Class.extend({
        items: [],
        length: 0,
        index: 0,

        constructor: function(array) {
            this.items  = array || [];
            this.length = this.items.length;
            this.index  = 0;
        },

        add: function(item) {
            if (_.isArray(item)) {
                Array.prototype.push.apply(this.items, item);
            } else {
                this.items.push(item);
            }

            this.length = this.items.length;
            return this;
        },
                
        remove: function() {

        },
        
        removeAt: function(index) {
            
        },
        
        empty: function() {
            this.items = [];
            this.length = 0;
        },
        
        each: function(callback) {
            var items = this.items;
            _.forEach(items, function(item, index){
                callback.call(item, index, item);
            });
            return this;
        },
        
        first: function() {
            return _.head(this.items);
        },

        prev: function() {
            return this.index > -1 && this.items.length ? this.items[this.index--] : null;
        },

        next: function() {
            return this.index < this.items.length ? this.items[this.index++] : null;
        },
        
        last: function() {
            return _.last(this.items);
        },
        
        filter: function(predicate) {
            var array = _.filter(this.items, function(item, index){
                return _.bind(predicate, item, item, index)();
            });
            return new Collection(array);
        }
    });

    return Collection;
}(_));