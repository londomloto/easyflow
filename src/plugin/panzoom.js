
(function(){

    Graph.plugin.Panzoom = Graph.extend({

        props: {
            enabled: true,
            vector: null,
            transition: true,
            cursor: 'move',
            disablePan: false,
            disableZoom: false,
            disableXAxis: false,
            disableYAxis: false,
            which: 1,
            increment: 0.3,
            linearZoom: false,
            panOnlyWhenZoomed: false,
            minScale: 0.3,
            maxScale: 6,
            rangeStep: 0.05,
            easing: 'ease-in-out',
            contain: false,
            scale: 1
        },

        constructor: function(vector) {
            this.props.vector = vector.guid();
            this.props.scale = vector.matrix().scale().x;
            
            // console.log(this);
        },

        vector: function() {
            return Graph.manager.vector.get(this.props.vector);
        },

        enable: function() {
            this.enabled = true;
        },

        disable: function() {
            this.enabled = false;
        }

    });

}());