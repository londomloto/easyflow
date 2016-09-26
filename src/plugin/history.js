
(function(){

    Graph.plugin.History = Graph.extend({
        
        props: {
            limit: 1,
            index: 0
        },

        items: {},

        constructor: function(vector) {
            this.vector = vector;
        },

        save: function(prop, data) {
            var lim = this.props.limit, len;

            if (len > lim) {
                _.drop(this.items, len - lim);
            }

            this.items[prop] = this.items[prop] || [];

            if ((len = this.items[prop].length) > lim - 1) {
                this.items[prop].splice(0, len - lim);
            }

            this.items[prop].push(data);

            console.log(this);
        },

        last: function(prop) {

        },

        go: function() {

        },

        back: function() {

        },

        next: function() {

        },

        clear: function() {

        }
    });

}());