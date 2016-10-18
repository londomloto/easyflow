
(function(){

    var Link = Graph.link.Link = Graph.extend({
        
        props: {
            id: null,
            guid: null,
            rendered: false,
            selected: false,
            label: ''
        },

        components: {
            block: null,
            coat: null,
            path: null
        },

        cached: {
            bendpoints: null,
            controls: null
        },

        router: null,

        constructor: function(router, options) {
            options = _.extend({
                id: 'graph-link-' + (++Link.guid)
            }, options || {});

            _.assign(this.props, options);

            this.props.guid = this.props.id; // Graph.uuid();
            this.router = router;

            this.initComponent();

            this.router.on('route', _.bind(this.onRouterRoute, this));
            this.router.on('routing', _.bind(this.onRouterRoute, this));

            var source = router.source(),
                target = router.target();

            source.on({
                resize: _.bind(this.onSourceResize, this),
                rotate: _.bind(this.onSourceRotate, this)
            });

            // VERY EXPENSIVE!!!
            if (source.isDraggable()) {
                source.on('dragstart', _.bind(this.onSourceDragStart, this, _, source));
                if ( ! source.draggable().ghost()) {
                    source.on('dragmove', _.bind(this.onSourceDrag, this));
                } else {
                    source.on('dragend', _.bind(this.onSourceDragEnd, this));
                }
            }
            
            target.on({
                resize: _.bind(this.onTargetResize, this),
                rotate: _.bind(this.onTargetRotate, this)
            });

            // VERY EXPENSIVE!!!
            if (target.isDraggable()) {
                target.on('dragstart', _.bind(this.onTargetDragStart, this, _, target));

                if ( ! target.draggable().ghost()) {
                    target.on('dragmove', _.bind(this.onTargetDrag, this));
                } else {
                    target.on('dragend', _.bind(this.onTargetDragEnd, this));
                }
            }

            Graph.registry.link.register(this);
        },

        initComponent: function() {
            var comp = this.components;
            var block, coat, path, editor, label;

            block = (new Graph.svg.Group())
                .addClass('graph-link')
                .selectable(false);

            block.elem.data(Graph.string.ID_LINK, this.props.guid);

            coat = (new Graph.svg.Path())
                .removeClass(Graph.string.CLS_VECTOR_PATH)
                .addClass('graph-link-coat')
                // .selectable(false)
                .render(block);

            coat.data('text', this.props.label);
            coat.elem.data(Graph.string.ID_LINK, this.props.guid);

            coat.draggable({
                ghost: true,
                single: false,
                manual: true
            });
            
            coat.editable({
                width: 150,
                height: 80
            });

            coat.on('select',    _.bind(this.onCoatSelect, this));
            coat.on('deselect',  _.bind(this.onCoatDeselect, this));
            coat.on('dragstart', _.bind(this.onCoatDragStart, this));
            coat.on('dragend',   _.bind(this.onCoatDragEnd, this));
            coat.on('edit',      _.bind(this.onCoatEdit, this));

            path = (new Graph.svg.Path())
                .removeClass(Graph.string.CLS_VECTOR_PATH)
                .addClass('graph-link-path')
                .selectable(false)
                .clickable(false)
                .attr('marker-end', 'url(#marker-arrow)')
                .render(block);

            path.elem.data(Graph.string.ID_LINK, this.props.guid);

            label = (new Graph.svg.Text(0, 0, this.props.label))
                .selectable(false)
                .clickable(false)
                .render(block);

            editor = (new Graph.svg.Group())
                .selectable(false)
                .render(block);
                
            comp.block = block.guid();
            comp.coat = coat.guid();
            comp.path = path.guid();
            comp.label = label.guid();
            comp.editor = editor.guid();
        },

        component: function(name) {
            if (name === undefined) {
                return Graph.registry.vector.get(this.components.block);
            }
            return Graph.registry.vector.get(this.components[name]);
        },

        invalidate: function() {
            this.cached.bendpoints = null;
        },

        render: function(container) {
            this.component().render(container);
        },

        id: function() {
            return this.props.id;
        },

        guid: function() {
            return this.props.guid;
        },

        connect: function(/*start, end*/) {
            this.router.route();
        },
        
        update: function(command) {
            this.component('coat').attr('d', command).dirty(true);
            this.component('path').attr('d', command);
            this.invalidate();
            this.redraw();
        },

        redraw: function() {
            
            // TODO: update label position
            
            if (this.props.label) {
                var label = this.component('label'),
                    middle = this.router.middle();
                    
                var p = Graph.util.perpendicular(middle.start, middle.end, 15);

                label.attr({
                    x: p.to.x, 
                    y: p.to.y
                });
            }
            
        },

        select: function() {
            this.props.selected = true;
            this.component('block').addClass('selected');
            this.resumeControl();
        },

        deselect: function() {
            this.props.selected = false;
            this.component('block').removeClass('selected');
            this.suspendControl();
        },
        
        renderControl: function() {
            // TODO: render bends control
        },
        
        resumeControl: function() {
            var me = this, editor = me.component('editor');

            if ( ! me.cached.bendpoints) {
                me.cached.bendpoints = me.router.bendpoints();
                me.renderControl();
            }

            editor.elem.appendTo(this.component('block').elem);
        },
        
        suspendControl: function() {
            this.component('editor').elem.detach();
        },

        toString: function() {
            return 'Graph.link.Link';
        },

        ///////// OBSERVERS /////////
        
        onRouterRoute: function(e) {
            var command = e.command;
            this.update(command);
        },

        onCoatEdit: function(e) {
            var label = this.component('label');
            label.write(e.text);
            
            this.props.label = label;
            this.redraw();
        },

        onCoatSelect: function(e) {
            this.select();
        },

        onCoatDeselect: function(e) {
            this.deselect();
        },

        onCoatDragStart: function(e) {
            this.suspendControl();
        },

        onCoatDragEnd: function(e) {
            var dx = e.dx,
                dy = e.dy;
            this.router.relocate(dx, dy);
            this.update(this.router.command());
        },

        ///////// OBSERVERS /////////
        
        onSourceRotate: function() {
    
        },

        onSourceDragStart: function(e, source) {
            var lasso = this.component('coat').$collector;
            if ( ! source.$collector) {
                if (lasso) {
                    lasso.decollect(this.component('coat'));
                }
            }
        },

        onSourceDrag: function() {
            this.router.repair('source');
        },

        onSourceDragEnd: function(e) {
            var lasso = this.component('coat').$collector;
            if ( ! lasso) {
                var port = this.router.tail();
                port.x += e.dx;
                port.y += e.dy;
                
                this.router.repair(this.router.source(), port);
            }
        },

        onSourceResize: function(e) {
            var port = this.router.tail();
            
            port.x += e.translate.dx;
            port.y += e.translate.dy;
            
            this.router.repair(this.router.source(), port);
        },

        onTargetRotate: function() {
            
        },

        onTargetDragStart: function(e, target) {
            var lasso = this.component('coat').$collector;
            if ( ! target.$collector) {
                if (lasso) {
                    lasso.decollect(this.component('coat'));
                }
            }
        },

        onTargetDrag: function() {
            this.router.repair('target');
        },

        onTargetDragEnd: function(e) {
            var lasso = this.component('coat').$collector;
            if ( ! lasso) {
                var port = this.router.head();
                
                port.x += e.dx;
                port.y += e.dy;
                    
                this.router.repair(this.router.target(), port);
            }
        },

        onTargetResize: function(e) {
            var port = this.router.head();
            
            port.x += e.translate.dx;
            port.y += e.translate.dy;
            
            this.router.repair(this.router.target(), port);
        }

    });

    ///////// STATICS /////////
    
    Link.guid = 0;

}());