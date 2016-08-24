
(function(){
    
    Graph.util.Resizer = Graph.extend({

        constructor: function(vector) {
            this.vector = vector;
            
            this.vector.on('dragstart', _.bind(this.remove, this));
            this.vector.on('dragend', _.bind(this.refresh, this));

            this.vertext = [];
        },

        render: function(container) {
            if (this.group) {
                this.refresh();
                return;
            }

            container = _.defaultTo(this.vector.paper);

            this.group = container.group();
            this.group.removeClass('graph-group').addClass('graph-resizer');

            this.bound = this.group.rect().attr({
                'fill': 'none',
                'stroke': '#00a8ff',
                'stroke-width': .5,
                'stroke-dasharray': '3 3',
                'pointer-event': 'none'
            });

            this.refresh();
        },
        
        /**
         * Synchronize position
         */
        refresh: function() {
            if ( ! this.group) {
                return;
            }

            var box = this.vector.bbox().value();
            
            // reset matrix
            this.group.matrix = new Graph.lang.Matrix();
            this.group.translate(box.x, box.y).apply();
            
            this.bound.attr({
                width: box.width,
                height: box.height
            });
        },

        remove: function() {
            if (this.group) {
                this.group.remove();
                this.group = null;
            }
        },

        destroy: function() {
            this.remove();
        }
    });

}());