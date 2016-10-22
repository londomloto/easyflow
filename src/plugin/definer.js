
(function(){

    Graph.plugin.Definer = Graph.extend(Graph.plugin.Plugin, {
        props: {
            vector: null
        },

        definitions: {

        },

        components: {
            holder: null
        },

        constructor: function(vector) {
            this.props.vector = vector.guid();

            this.components.holder = Graph.$('<defs/>');
            this.components.holder.prependTo(vector.elem);

            if (vector.isPaper()) {
                this.defineArrowMarker('marker-arrow');
            }

        },
        
        defineArrowMarker: function(id) {
            if (this.definitions[id]) {
                return this.definitions[id];
            }

            var marker = Graph.$('<marker/>');
            var path = Graph.$('<path/>');

            // marker.attr({
            //     id: id,
            //     refX: '8',
            //     refY: '4',
            //     markerWidth: '8',
            //     markerHeight: '8',
            //     orient: 'auto'
            // });
            
            // path.attr({
            //     d: 'M 0 0 L 0 8 L 8 4 L 0 0',
            //     fill: '#000000',
            //     'stroke-width': 1
            // });
            
            // <marker viewBox="0 0 20 20" markerWidth="10" markerHeight="10" orient="auto" refX="11" refY="10" id="markerSitvw7kt89">
            // <path d="M 1 5 L 11 10 L 1 15 Z" style="stroke-width: 1; stroke-linecap: round; stroke-dasharray: 10000, 1;" fill="#000000"/></marker>

            marker.attr({
                id: id,
                refX: '11',
                refY: '10',
                viewBox: '0 0 20 20',
                markerWidth: '10',
                markerHeight: '10',
                orient: 'auto'
            });

            path.attr({
                d: 'M 1 5 L 11 10 L 1 15 Z',
                fill: '#000000',
                'stroke-width': 1,
                'stroke-linecap': 'round',
                'stroke-dasharray': '10000, 1'
            });

            marker.append(path);

            this.definitions[id] = marker;
            this.components.holder.append(marker);

            return marker;
        },

        toString: function() {
            return 'Graph.plugin.Definer';
        }
    });

}());