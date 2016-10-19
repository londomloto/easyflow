
(function(){

    var Link = Graph.link.Link = Graph.extend({
        
        props: {
            id: null,
            guid: null,
            rendered: false,
            selected: false,
            label: '',
            source: null,
            target: null
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
        
        handlers: {
            source: null,
            target: null
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
            this.bindResource('source', router.source());
            this.bindResource('target', router.target());

            this.router.on('route', _.bind(this.onRouterRoute, this));
            this.router.on('reroute', _.bind(this.onRouterReroute, this));
            
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
        
        bindResource: function(type, resource) {
            var router = this.router,
                existing = this.props[type],
                handlers = this.handlers[type];
            
            if (existing && handlers) {
                existing = Graph.registry.vector.get(existing);
                if (existing) {
                    var name, ns;
                    for (name in handlers) {
                        ns = name + '.link';
                        existing.off(ns, handlers[name]);
                        ns = null;
                    }
                }
            }
            
            handlers = {};

            handlers.resize    = _.bind(getHandler(this, type, 'resize'), this);
            handlers.rotate    = _.bind(getHandler(this, type, 'rotate'), this);
            handlers.dragstart = _.bind(getHandler(this, type, 'dragstart'), this, _, resource);
            handlers.dragmove  = _.bind(getHandler(this, type, 'dragmove'), this);
            handlers.dragend   = _.bind(getHandler(this, type, 'dragend'), this);

            this.handlers[type] = handlers;
            this.props[type] = resource.guid();
            
            resource.on('resize.link', handlers.resize);
            resource.on('rotate.link', handlers.rotate);
            
            // VERY EXPENSIVE!!!
            if (resource.isDraggable()) {
                resource.on('dragstart.link', handlers.dragstart);
                if ( ! resource.draggable().ghost()) {
                    resource.on('dragmove.link', handlers.dragmove);
                } else {
                    resource.on('dragend.link', handlers.dragend);
                }
            }

            return this;
        },

        bindSource: function(source) {
            return this.bindResource('source', source);
        },

        bindTarget: function(target) {
            return this.bindResource('target', target);
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
        
        onRouterReroute: function(e) {
            var source = e.source,
                target = e.target;

            this.bindResource('source', source);
            this.bindResource('target', target);
            
            // bring to front
            var container = this.component().parent();
            this.component().elem.appendTo(container.elem);
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

        onSourceDragstart: function(e, source) {
            var lasso = this.component('coat').$collector;
            if ( ! source.$collector) {
                if (lasso) {
                    lasso.decollect(this.component('coat'));
                }
            }
        },

        onSourceDragmove: function() {
            this.router.repair('source');
        },

        onSourceDragend: function(e) {
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

        onTargetDragstart: function(e, target) {
            var lasso = this.component('coat').$collector;
            if ( ! target.$collector) {
                if (lasso) {
                    lasso.decollect(this.component('coat'));
                }
            }
        },

        onTargetDragmove: function() {
            this.router.repair('target');
        },

        onTargetDragend: function(e) {
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

    ///////// HELPERS /////////
    
    function getHandler(scope, resource, handler) {
        var name = 'on' + _.capitalize(resource) + _.capitalize(handler),
            func = scope[name];
        name = null;
        return func;
    }

}());