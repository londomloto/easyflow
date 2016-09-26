
(function(){

    Graph.util.Spotlight = Graph.extend({
        props: {
            suspended: true
        },
        
        components: {
            G: null,
            N: null,
            E: null,
            S: null,
            W: null
        },

        canvas: null,
        
        constructor: function() {
            var me = this,
                comp = me.components;

            comp.G = new Graph.svg.Group();
            comp.G.collectable(false);
            comp.G.selectable(false);
            comp.G.addClass('graph-util-spotlight');
            comp.G.removeClass('graph-elem graph-elem-group');

            _.forEach(['N', 'E', 'S', 'W'], function(name){
                comp[name] = new Graph.svg.Line(0, 0, 0, 0);
                comp[name].removeClass('graph-elem graph-elem-line');
                comp[name].collectable(false);
                comp[name].selectable(false);
                comp[name].attr('shape-rendering', 'crispEdges');
                comp[name].render(comp.G);
            });
        },
        
        component: function() {
            return this.components.G;
        },

        render: function(canvas) {
            this.canvas = canvas;
            this.canvas.append(this.components.G);
        },

        suspend: function() {
            this.props.suspended = true;
            this.components.G.removeClass('visible');
        },

        resume: function() {
            this.props.suspended = false;
            this.components.G.addClass('visible');
        },

        focus: function(target, state) {
            if ( ! state) {
                this.suspend();
                return;
            }

            var tbox = target.bbox(false, false).data(),
                dots = target.dots(true),
                tsvg = target.canvas,
                comp = this.components;

            var x, y, h, w;

            x = dots[0][0];
            y = dots[0][1];
            h = tsvg.attrs.height;
            w = tsvg.attrs.width;

            this.resume();

            comp.W.attr({
                x1: x,
                y1: 0,
                x2: x,
                y2: h
            });

            comp.E.attr({
                x1: x + tbox.width,
                y1: 0,
                x2: x + tbox.width,
                y2: h
            });

            comp.N.attr({
                x1: 0,
                y1: y,
                x2: w,
                y2: y
            });

            comp.S.attr({
                x1: 0,
                y1: y + tbox.height,
                x2: w,
                y2: y + tbox.height
            });
        }
    });

}());