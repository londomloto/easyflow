
(function(){

    Graph.util.Definer = Graph.extend({
        definitions: {

        },

        components: {
            holder: null
        },

        canvas: null,

        constructor: function() {
            var me = this;
            me.components.holder = Graph.$svg('defs');
        },

        render: function(canvas) {
            this.canvas = canvas;
            this.canvas.elem.prepend(this.components.holder);
        },

        defineArrowMarker: function(id) {
            if (this.definitions[id]) {
                return this.definitions[id];
            }

            var marker = Graph.$svg('marker');

            marker.attr({
                id: id,
                refX: '8',
                refY: '4',
                markerWidth: '8',
                markerHeight: '8',
                orient: 'auto'
            });

            var path = Graph.$svg('path');
            
            path.attr({
                d: 'M 0 0 L 0 8 L 8 4 L 0 0',
                fill: '#333',
                'stroke-width': '0'
            });

            marker.append(path);

            this.definitions[id] = marker;
            this.components.holder.append(marker);

            return marker;
        }
    });

}());