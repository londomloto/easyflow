
(function(){
    
    Graph.util.Dragger = Graph.extend({
        
        snap: [10, 10],

        constructor: function(vector, config) {
            this.vector = vector;

            var me = this;

            config = _.extend({}, {inertia: true}, config || {});

            if ( ! _.isUndefined(config.snap)) {
                this.snap = config.snap;
                delete config.snap;
            }

            if (this.snap.length) {
                config.snap = {
                    targets: [
                        interact.createSnapGrid({x: this.snap[0], y: this.snap[1]})
                    ]
                }
            }

            config.onstart = function(e) {
                me.fire('dragstart');
            };

            config.onmove = function(e) {
                me.vector.translate(e.dx, e.dy).apply(true);
                me.fire('dragmove');
            };

            config.onend = function(e) {
                me.fire('dragend');
            };

            interact(this.vector.elem[0]).draggable(config);
        }

    });

}());