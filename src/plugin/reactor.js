
(function(){
    
    Graph.plugin.Reactor = Graph.extend({

        plugin: null,

        constructor: function(vector) {
            var me = this;

            me.vector = vector;
            me.plugin = interact(vector.node());

            me.plugin.on('down', function(e){
                e.type = 'pointerdown';
                vector.fire(e);
                e.type = 'down';
                
                if ( ! e.propagationStopped) {
                    // bubbling up
                    // vector.bubble(function(c){
                    //     if (c !== vector && c.clickable()) {
                    //         e.type = 'pointerdown';
                    //         c.fire(e);
                    //         e.type = 'down';
                    //     }
                    // });
                }

            }, true);

            me.vector.elem.on({
                mouseenter: function(e) {
                    e.type = 'pointerin'
                    vector.fire(e);
                },
                mouseleave: function(e) {
                    e.type = 'pointerout';
                    vector.fire(e);
                }
            });
            
        },

        draggable: function(options) {
            return this.plugin.draggable(options);
        },

        dropzone: function(options) {
            return this.plugin.dropzone(options);
        },

        gesturable: function(options) {
            return this.plugin.gesturable(options);
        },

        locate: function(e) {
            var paper = this.vector.paper(),
                offset = paper.offset(),
                dx = paper.scrollLeft() - offset.left,
                dy = paper.scrollTop() - offset.top,
                x = e.clientX,
                y = e.clientY;

            var point = Graph.point(x, y);
            point.expand(dx, dy);

            return point;
        },

        destroy: function() {
            this.plugin.unset();
            this.plugin = null;
        },

        toString: function() {
            return 'Graph.plugin.Reactor';
        }

    });

}());