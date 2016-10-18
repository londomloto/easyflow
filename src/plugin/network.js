
(function(){

    Graph.plugin.Network = Graph.extend(Graph.plugin.Plugin, {

        props: {
            vector:  null,
            wiring: 'h:h'
        },

        links: [],

        cached: {
            bboxMatrix: null,
            pathMatrix: null
        },

        constructor: function(vector, options) {
            _.assign(this.props, options || {});
            this.props.vector = vector.guid();
            
            vector.addClass('graph-connectable');
        },

        invalidate: function() {
            this.cached.bboxMatrix = null;
            this.cached.pathMatrix = null;
        },
        
        bboxMatrix: function() {
            var matrix = this.cached.bboxMatrix;
            
            if ( ! matrix) {
                var vector = this.vector(),
                    paper  = vector.paper(),
                    matrix = vector.matrix(),
                    scope  = null;
                
                if (paper) {
                    scope = paper.viewport();
                }
                
                vector.bubble(function(curr){
                    if (scope && scope === curr) {
                        return false;
                    }
                    matrix = curr.matrix();
                });
                
                matrix = matrix.clone();
                this.cached.bboxMatrix = matrix;
            }
            
            return matrix;
        },
        
        pathMatrix: function() {
            var matrix = this.cached.pathMatrix;
            
            if ( ! matrix) {
                var vector = this.vector(),
                    paper  = vector.paper(),
                    matrix = Graph.matrix(),
                    scope  = null;
                
                if (paper) {
                    scope = paper.viewport();
                }
                
                vector.bubble(function(curr){
                    if (scope && scope === curr) {
                        return false;
                    }
                    matrix.multiply(curr.matrix());
                });
                
                this.cached.pathMatrix = matrix;
            }
            
            return matrix;
        },

        bbox: function() {
            var matrix = this.bboxMatrix(),
                path = this.vector().pathinfo().transform(matrix),
                bbox = path.bbox();
            
            matrix = path = null;
            
            return bbox;
        },

        pathinfo: function() {
            var matrix = this.pathMatrix(),
                path = this.vector().pathinfo().transform(matrix);
            
            matrix = null;
            
            return path;
        },

        wiring: function() {
            return this.props.wiring;
        },

        treshold: function() {
            var wiring = this.props.wiring;

            switch(wiring) {
                case 'h:h':
                case 'v:v':
                    return 20;
                case 'h:v':
                case 'v:h':
                    return -10;
            }

            return 0;
        },
        
        direction: function (network) {
            var orient = this.orientation(network);
            
            switch(orient) {
                case 'intersect':
                    return null;
                case 'top':
                case 'bottom':
                    return 'v:v';
                case 'left':
                case 'right':
                    return 'h:h';
                default:
                    return this.props.wiring;
            }
        },
        
        orientation: function(network) {
            var srcbox = this.bbox().toJson(),
                refbox = network.bbox().toJson(),
                orient = Graph.util.boxOrientation(srcbox, refbox, this.treshold());
            
            srcbox = refbox = null;
            
            return orient;
        }

    });

}());