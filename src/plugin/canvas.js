
(function(){

    Graph.plugin.Canvas = Graph.extend({

        paper: null,

        drawing: {
            moveHandler: null,
            stopHandler: null
        },

        constructor: function(paper) {
            this.paper = paper;
        },

        draw: function(/*shape*/) {
            var args = _.toArray(arguments),
                part = _.split(args.shift(), '.'),
                tail = _.capitalize(part.pop() || ''),
                name  = 'Graph.shape.' + _.join(part.concat([tail]), '.'),
                clazz = Graph.ns(name);

            var shape;

            if (clazz && _.isFunction(clazz)) {
                shape = Graph.factory(clazz, args);
            } else {
                console.warn("Class {" + name + "} doesn't exists!");
                shape = null;
            }

            name = null;

            shape.place(this.paper);
            shape.move(-500, -500);

            this.paper.state('drawing');
            this.refresh(shape);

            var vendor = this.paper.interactable().vendor();

            this.drawing.moveHandler = _.bind(this.onPointerMove, this, _, shape);
            this.drawing.stopHandler = _.bind(this.onPointerStop, this, _, shape);

            vendor.on('move', this.drawing.moveHandler);
            vendor.on('up', this.drawing.stopHandler);

            return shape;
        },

        refresh: function(shape) {
            var snapping = this.paper.layout().snapping();

            shape.component().cascade(function(comp){
                if (comp.isDraggable()) {
                    comp.draggable().snap(snapping);
                }

                if (comp.isResizable()) {
                    comp.resizable().snap(snapping);
                }
            });

        },

        onPointerMove: function(e, shape) {
            
        },

        onPointerStop: function(e, shape) {
            var vendor = this.paper.interactable().vendor();
            var delay;

            delay = _.delay(_.bind(function(){
                if (this.drawing.moveHandler) {
                    vendor.off('move', this.drawing.moveHandler);    
                    this.drawing.moveHandler = null;
                }

                if (this.drawing.stopHandler) {
                    vendor.off('up', this.drawing.stopHandler);    
                    this.drawing.stopHandler = null;
                }
            }, this), 0);
            
        }

    });

}());