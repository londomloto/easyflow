
(function(){

    Graph.svg.Group = Graph.svg.Vector.extend({

        attrs: {
            'class': 'graph-group'
        },

        constructor: function(x, y) {
            this.$super('g');

            if ( ! _.isUndefined(x) && ! _.isUndefined(y)) {
                this.matrix.translate(x, y);
                this.attr('transform', this.matrix.toString());
            }

            this.items = new Graph.svg.Collection();
        },

        pathinfo: function() {
            var bbox = {};
                     
            try {
                bbox = this.elem[0].getBBox();
            } catch(e) {
                bbox = {
                    x: this.elem[0].clientLeft,
                    y: this.elem[0].clientTop,
                    width: this.elem[0].clientWidth,
                    height: this.elem[0].clientHeight
                };
            } finally {
                bbox = bbox || {};
            }
            
            return new Graph.lang.Path([
                ['M', bbox.x, bbox.y], 
                ['l', bbox.width, 0], 
                ['l', 0, bbox.height], 
                ['l', -bbox.width, 0], 
                ['z']
            ]);
        }
    });

    var enums = {
        circle: 'Circle',
        rect: 'Rect',
        path: 'Path',
        polygon: 'Polygon',
        group: 'Group',
        text: 'Text'
    };

    _.forOwn(enums, function(name, method){
        (function(name, method){
            Graph.svg.Group.prototype[method] = function() {
                var args = _.toArray(arguments);
                var clazz = Graph.svg[name];
                var vector = Graph.factory(clazz, args);
                
                vector.render(this);
                vector.paper = this.paper;
                
                this.items.push(vector);
                return vector;
            };
        }(name, method));
    });

}());