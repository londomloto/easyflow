
(function(){

    var Link = Graph.link.Link = Graph.extend({
        
        props: {
            id: null,
            guid: null,
            rendered: false,
            selected: false,
            label: '',
            labelDistance: null,
            labelX: null,
            labelY: null,
            source: null,
            target: null
        },

        components: {
            block: null,
            coat: null,
            path: null,
            label: null,
            editor: null
        },

        cached: {
            bendpoints: null,
            controls: null,
            convex: null
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
                height: 80,
                offset: 'pointer'
            });

            coat.on('select.link', _.bind(this.onCoatSelect, this));
            coat.on('deselect.link', _.bind(this.onCoatDeselect, this));
            coat.on('dragstart.link', _.bind(this.onCoatDragStart, this));
            coat.on('dragend.link', _.bind(this.onCoatDragEnd, this));
            coat.on('edit.link', _.bind(this.onCoatEdit, this));
            coat.on('beforeedit.link', _.bind(this.onCoatBeforeEdit, this));
            coat.on('remove.link', _.bind(this.onCoatRemove, this));

            path = (new Graph.svg.Path())
                .removeClass(Graph.string.CLS_VECTOR_PATH)
                .addClass('graph-link-path')
                .selectable(false)
                .clickable(false)
                .attr('marker-end', 'url(#marker-arrow)')
                .render(block);

            path.elem.data(Graph.string.ID_LINK, this.props.guid);

            label = (new Graph.svg.Text(0, 0, ''))
                .addClass('graph-link-label')
                .selectable(false)
                // .attr('text-anchor', 'left')
                .render(block);
            
            label.draggable({ghost: true});
            
            label.on('render.link', _.bind(this.onLabelRender, this));
            label.on('dragend.link', _.bind(this.onLabelDragend, this));

            // enable label doubletap
            var labelVendor = label.interactable().vendor();
            labelVendor.on('doubletap', _.bind(this.onLabelDoubletap, this));
                
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
            var paper;

            this.component().render(container);
            paper = container.paper();

            if (paper) {
                Graph.registry.link.setContext(this.guid(), paper.guid());
            }
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
        
        update: function(command, silent) {
            
            silent = _.defaultTo(silent, false);
            
            this.component('coat').attr('d', command).dirty(true);
            this.component('path').attr('d', command);
            this.invalidate();
            
            if ( ! silent) {
                this.redraw();
                this.fire('update');
                Graph.topic.publish('link/update');
            }
        },
        
        refresh: function(silent) {
            var command = this.router.command();
            this.update(command, silent);
        },

        updateConvex: function(convex) {
            this.cached.convex = convex;
        },
        
        removeConvex: function() {
            this.cached.convex = null;
        },
        
        redraw: function() {
            // TODO: update label position
            
            if (this.props.label) {
                var label = this.component('label'),
                    bound = label.bbox().toJson(),
                    distance = this.props.labelDistance || .5,
                    scale = this.router.layout().currentScale(),
                    path = this.router.pathinfo(),
                    dots = path.pointAt(distance * path.length(), true),
                    align = Graph.util.pointAlign(dots.start, dots.end, 10);
                
                if (align == 'h') {
                    dots.x += ((10 + bound.width / 2) / scale.x);
                } else {
                    dots.y -= ((10 + bound.height / 2) / scale.y);
                }
                
                label.attr({
                    x: dots.x,
                    y: dots.y
                });
                
                path = null;
                dots = null;

                label.dirty(true);
            }
            
        },
        
        label: function(text, x, y) {
            var path, distance, point, align;
            
            if (text === undefined) {
                return this.props.label;
            }

            this.props.label = text;
            
            if (x !== undefined && y !== undefined) {
                path = this.router.pathinfo();
                point = path.nearest({x: x, y: y});
                distance = point.distance / path.length();
            } else if (_.isNull(this.props.labelDistance)) {
                path = this.router.pathinfo();
                distance = 0.5;
                point = path.pointAt(path.length() / 2, true);
            }
            
            if (point) {
                this.props.labelDistance = distance;
                path = point = null;
            }
            
            this.component('label').write(text);
            this.component('coat').data('text', text);
            
            this.redraw();
            return this;
        },

        select: function() {
            this.props.selected = true;
            this.component('block').addClass('selected');
            this.sendToFront();
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

        sendToFront: function() {
            var container = this.component().parent();
            this.component().elem.appendTo(container.elem);
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
            this.sendToFront();
        },
        
        onLabelRender: function(e) {
            if (this.props.label) {
                this.label(this.props.label);
            }
        },
        
        onLabelDragend: function(e) {
            var label = this.component('label'),
                matrix = label.matrix(),
                x = label.attrs.x,
                y = label.attrs.y,
                p = {
                    x: matrix.x(x, y),
                    y: matrix.y(x, y)
                }
            
            label.attr({
                x: p.x,
                y: p.y
            });
            
            // update label distance
            var path = this.router.pathinfo(),
                near = path.nearest(p);
            
            this.props.labelDistance = near.distance / path.length();
            
            label.reset();
            
            matrix = path = null;
        },

        onLabelDoubletap: function(e) {
            var coat = this.component('coat');
            coat.editable().startEdit(e);
        },

        onCoatBeforeEdit: function(e) {
            this.component('label').hide();
            this.component().addClass('editing');
        },

        onCoatEdit: function(e) {
            this.component().removeClass('editing');
            this.component('label').show();
            this.label(e.text, e.left, e.top);
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

        onCoatRemove: function(e) {
            this.destroy();
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

            // remove convex
            this.cached.convex = null;
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

            // remove convex
            this.cached.convex = null;
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
        },

        destroy: function() {
            var me = this;
            var prop;

            // remove label
            me.component('label').remove();

            // remove vertexs
            if (me.cached.controls) {
                _.forEach(me.cached.controls, function(id){
                    var c = Graph.registry.vector.get(id);
                    c && c.remove();
                });
                me.cached.controls = null;
            }

            // remove editor
            me.component('editor').remove();

            // remove path
            me.component('path').remove();

            // remove block
            me.component('block').remove();
            
            for (prop in me.components) {
                me.components[prop] = null;
            }

            // unbind resource
            _.forEach(['source', 'target'], function(res){
                var handlers = me.handlers[res],
                    resource = me.router[res]();
                
                var key, ns;

                if (handlers && resource) {
                    for (key in handlers) {
                        ns = key + '.link';
                        resource.off(ns, handlers[key]);
                    }
                }
                
                handlers = null;
            });

            // clear cache
            for (prop in me.cached) {
                me.cached[prop] = null;
            }

            me.router.destroy();
            me.router = null;

            // unregister
            Graph.registry.link.unregister(me);
            
            // publish
            Graph.topic.publish('link/remove');
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