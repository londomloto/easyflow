
(function(){

    Graph.util.LinkManager = Graph.extend({

        links: [],

        constructor: function() {},

        add: function(link) {
            var me = this;
            me.links.push(link);
        },

        remove: function(link) {
            var index = _.indexOf(this.links, link);
            if (index > -1) {
                this.links.splice(index, 1);
            }
        },

        onSourceVectorDragend: function() {

        },

        onTargetVectorDragend: function() {
            
        }
    });

}());