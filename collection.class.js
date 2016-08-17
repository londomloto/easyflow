
EF.Collection = (function(_){

    var Collection = EF.Class.extend({
        items: [],
        length: 0,
        constructor: function(array) {
            this.items = array;
            this.length = this.items.length;
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
        removeAt: function(indexes) {

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
        attr: function() {
            var args = _.toArray(arguments);
            var items = this.items;
            _.forEach(items, function(item, index){
                item.attr.apply(item, args);
            });
            return this;
        },
        first: function() {
            return _.head(this.items);
        },
        last: function() {
            return _.last(this.items);
        },
        filter: function() {

        },
        draggable: function() {
            var args = _.toArray(arguments);
            var items = this.items;
            _.forEach(items, function(item){
                item.draggable.apply(item, args);
            });
            return this;
        },
        droppable: function() {
            var args = _.toArray(arguments);
            var items = this.items;
            _.forEach(items, function(item){
                item.droppable.apply(item, args);
            });
            return this;
        },
        sortable: function() {
            var args = _.toArray(arguments);
            var items = this.items;
            _.forEach(items, function(item){
                item.sortable.apply(item, args);
            });
            return this;  
        }
    });

    return Collection;
}(_));
