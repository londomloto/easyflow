
(function(){

    Graph.svg.Paper = Graph.svg.Vector.extend({

        attrs: {
            'class': 'graph-paper'
        },

        props: {
            text: '',
            angle: 0,
            collectable: false,
            selectable: false,
            selected: false,
            focusable: false
        },

        canvas: null,
        hinter: null,
        definer: null,
        collector: null,
        container: null,
        scroller: null,
        pointer: null,
        linker: null,
        linkman: null,

        constructor: function(width, height) {
            var me = this;

            me.$super('svg', {
                'xmlns': Graph.config.xmlns.svg,
                'xmlns:link': Graph.config.xmlns.xlink,
                'version': Graph.config.svg.version,
                'width': _.defaultTo(width, 200),
                'height': _.defaultTo(height, 200)
            });

            me.style({
                overflow: 'hidden',
                position: 'relative'
            });

            me.collector = new Graph.util.Collector();
            me.definer = new Graph.util.Definer();
            me.linker = new Graph.util.Linker();
            me.router = new Graph.util.Router();
            me.spotlight = new Graph.util.Spotlight();
            me.hinter = null; // new Graph.util.Hinter();
            me.linkman = new Graph.util.LinkManager();

            me.definer.defineArrowMarker('marker-arrow');

            me.elem.on({
                click: function(e) {
                    me.fire('click', e, me);
                }
            });
        },
        
        shape: function(name, config) {
            var clazz, shape;

            clazz = _.capitalize(name);
            shape = new Graph.shape[clazz](config);
            shape.render(this.elem);

            return shape;
        },

        render: function(target) {
            var me = this;

            if (me.rendered) {
                return;
            }

            target = Graph.$(target);
            target.append(me.elem);
            
            me.container = target;

            me.definer.render(me);
            me.collector.render(me);
            me.linker.render(me);
            me.router.render(me);
            me.spotlight.render(me);
            // me.hinter.render(me);

            me.attr({
                width: target.width(),
                height: target.height()
            });

            me.rendered = true;
            me.fire('render');

            me.cascade(function(c){
                if (c !== me && ! c.rendered) {
                    c.canvas = me;
                    c.fire('render', c);
                }
            });
        },

        autoScroll: function(target) {
            this.scroller = Graph.$(target);
        },

        link: function(port1, port2) {
            var link = new Graph.util.Link(this, port1, port2);
            this.linkman.add(link);
            return link;
        },

        removeLink: function(link) {
            this.linkman.remove(link);
        }

    });

    var vectors = {
        ellipse: 'Ellipse',
        circle: 'Circle',
        rect: 'Rect',
        path: 'Path',
        polygon: 'Polygon',
        group: 'Group',
        text: 'Text',
        image: 'Image',
        line: 'Line',
        connector: 'Connector'
    };

    _.forOwn(vectors, function(name, method){
        (function(name, method){
            Graph.svg.Paper.prototype[method] = function() {
                var args, clazz, vector;

                args   = _.toArray(arguments);
                clazz  = Graph.svg[name];
                vector = Graph.factory(clazz, args);
                vector.canvas = this;

                return vector;
            };
        }(name, method));
    });

}());