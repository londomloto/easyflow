
(function(){

    Graph.util.Linker = Graph.extend({
        props: {
            suspended: true,
            x: 0,
            y: 0
        },
        components: {
            block: null,
            point: null
        },
        ports: {
            source: null,
            target: null
        },
        constructor: function() {
            var me = this, comp = me.components;

            comp.block = new Graph.svg.Group();
            comp.block.addClass('graph-util-linker');
            comp.block.removeClass('graph-elem graph-elem-group');
            comp.block.collectable(false);
            comp.block.selectable(false);

            comp.point = new Graph.svg.Ellipse(0, 0, 3, 3);
            comp.point.addClass('graph-util-linker-point');
            comp.point.removeClass('graph-elem graph-elem-ellipse');
            comp.point.collectable(false);
            comp.point.selectable(false);
            comp.point.render(comp.block);

            comp.link = new Graph.svg.Path('M 0 0');
            comp.link.attr('marker-end', 'url(#marker-arrow)');
            comp.link.addClass('graph-util-linker-link');
            comp.link.removeClass('graph-elem graph-elem-path');
            comp.link.selectable(false);
            comp.link.collectable(false);
            comp.link.render(comp.block);

        },
        component: function() {
            return this.components.block;
        },
        pointer: function() {
            return this.components.point;
        },
        render: function(canvas) {
            this.canvas = canvas;
            this.canvas.append(this.components.block);
        },
        resume: function() {
            this.props.suspended = false;
            this.components.block.addClass('visible');
        },
        suspend: function() {
            this.props.suspended = true;
            this.components.block.removeClass('visible');  
        },
        
        reset: function() {
            this.ports.source = null;
            this.ports.target = null;
            this.props.x = 0;
            this.props.y = 0;
            this.components.point.attr({cx: 0, cy: 0});
            this.components.link.attr('d', 'M 0 0');
        },
        
        source: function(port) {
            var x = port.props.x,
                y = port.props.y;

            this.reset();

            this.ports.source = port;
            this.startAt(x, y);
        },

        target: function(port) {
            var x = port.props.x,
                y = port.props.y;

            this.ports.target = port;
            this.stopAt(x, y);
        },
        
        startAt: function(x, y) {
            var prop = this.props,
                comp = this.components;

            prop.x = x;
            prop.y = y;

            comp.point.attr({
                cx: x,
                cy: y
            });

            comp.link.startAt(x, y);
        },
        
        stopAt: function(x, y) {
            var prop = this.props,
                comp = this.components;

            prop.x = x;
            prop.y = y;

            comp.point.attr({
                cx: x,
                cy: y
            });

            comp.link.stopAt(x, y);
        },
        
        closeTo: function(x, y) {
            
        },
        
        expandBy: function(dx, dy) {
            var prop = this.props,
                comp = this.components

            prop.x += dx;
            prop.y += dy;

            comp.point.attr({
                cx: prop.x,
                cy: prop.y
            });

            var deg = comp.link.angle(),
                rad = Graph.rad(deg),
                sin = Math.sin(rad),
                cos = Math.cos(rad);

            var vdx = dx * cos + dy * sin,
                vdy = dx * -sin + dy * cos;

            comp.link.expandBy(dx, dy);
        },

        revert: function() {
            this.ports.source = null;
            this.ports.target = null;
            this.suspend();
        },

        commit: function() {
            var source = this.ports.source,
                target = this.ports.target;

            if (source && target) {
                var connector = new Graph.util.Connector();
                connector.connect(source, target);
                connector.render(this.canvas);
            }
            
            this.suspend();
        }
    });

}());
