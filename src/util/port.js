
(function(){

    var guid = 0;

    Graph.util.Port = Graph.extend({

        props: {
            id: null,
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            segment: 0,
            weight: 0
        },
        
        vector: null,
        canvas: null,
        network: null,

        components: {
            port: null,
            slot: null,
            core: null
        },

        snapping: {
            x: 0,
            y: 0
        },

        connection: {
            connecting: false,
            valid: false
        },

        links: [],

        constructor: function(x, y, options) {
            
            options = _.extend({
                id: 'P' + (++guid),
                x: _.defaultTo(x, 0),
                y: _.defaultTo(y, 0)
            }, options || {});

            _.extend(this.props, options);
            
            this.initComponent();
        },

        initComponent: function() {
            var me = this, 
                comp = me.components, 
                prop = me.props;

            comp.port = new Graph.svg.Group();
            comp.port.addClass('graph-util-port');
            comp.port.removeClass('graph-elem graph-elem-group');
            comp.port.on({
                render: _.bind(me.onPortRender, me)
            });

            comp.slot = comp.port.append(new Graph.svg.Ellipse(
                prop.x,
                prop.y,
                prop.width,
                prop.height
            ));

            comp.slot.elem.data('port', me);

            comp.slot.addClass('graph-util-port-slot');
            comp.slot.removeClass('graph-elem graph-elem-ellipse');

            comp.slot.elem.on({
                click: function(e) {
                    me.fire('click', e, me);
                    e.stopPropagation();
                }
            });

            comp.core = comp.port.append(new Graph.svg.Ellipse(
                prop.x,
                prop.y,
                2,
                2
            ));

            comp.core.addClass('graph-util-port-core');
            comp.core.removeClass('graph-elem graph-elem-ellipse');
            comp.core.attr({
                'pointer-events': 'none'
            });

            comp.core.elem.on({
                click: function(e) {
                    e.stopPropagation();
                }
            });

            for(var name in comp) {
                comp[name].selectable(false);
                comp[name].collectable(false);
            }

        },

        component: function() {
            return this.components.port;
        },

        render: function() {
            var network = this.network;
            this.canvas = network.canvas;
            this.components.port.render(network.components.block);
        },

        data: function(name, value) {
            if (_.isPlainObject(name)) {
                _.extend(this.props, name);
                return this;
            }

            if (_.isUndefined(name) && _.isUndefined(value)) {
                return this.props;
            }

            if (_.isUndefined(value)) {
                return this.props[name];
            }

            this.props[name] = value;
            return this;
        },

        x: function(value) {
            if (_.isUndefined(value)) {
                return this.props.x;
            }
            this.props.y = value;
            return this;
        },

        y: function(value) {
            if (_.isUndefined(value)) {
                return this.props.y;
            }
            this.props.y = value;
            return this;
        },
        
        location: function() {
            return new Graph.lang.Point(this.props.x, this.props.y);
        },

        offset: function() {
            var offset = {
                left: this.props.x,
                top: this.props.y
            };

            var pcanvas = this.canvas.elem.position();

            offset.left += pcanvas.left;
            offset.top  += pcanvas.top;

            return offset;
        },

        position: function() {
            var pos = this.components.slot.position();
            return {
                left: pos.left + this.props.width,
                top: pos.top + this.props.height
            };
        },

        setup: function() {
            var me = this,
                comp = me.components,
                prop = me.props,
                linker = me.canvas.linker;

            if (me.draggable) {
                return;
            }

            me.draggable = interact(comp.slot.node()).draggable({
                manualStart: true,
                inertia: false,
                snap: {
                    targets: [
                        interact.createSnapGrid({x: 1, y: 1})
                    ]
                },
                onstart: function(e) {
                    linker.source(me);

                    me.connection.connecting = true;
                    me.draggable.setOptions('snap', {
                        targets: [
                            interact.createSnapGrid({x: 1, y: 1})
                        ]
                    });
                    
                },
                onmove: function(e) {
                    linker.expandBy(e.dx, e.dy);
                },
                onend: function(e) {
                    /*if (me.connection.connecting && ! me.connection.valid) {
                        linker.revert();
                    }*/
                }
            });

            me.draggable.styleCursor(false);

            me.draggable.on({
                move: function(e) {
                    var i = e.interaction;

                    if (i.pointerIsDown && ! i.interacting() && e.currentTarget === comp.slot.node()) {
                        linker.resume();
                        i.start({name: 'drag'}, e.interactable, linker.pointer().node());    
                    }
                }
            });

            // droppable
            me.droppable = interact(comp.slot.node()).dropzone({
                overlap: .2,
                accept: '.graph-util-linker-point'
            });

            me.droppable.on({
                dropactivate: _.bind(me.onLinkerActivate, me),
                dropdeactivate: _.bind(me.onLinkerDeactivate, me),
                dragenter: _.bind(me.onLinkerEnter, me),
                dragleave: _.bind(me.onLinkerLeave, me),
                drop: _.bind(me.onLinkerDrop, me)
            });
        },

        translate: function(dx, dy) {
            var c = this.components;
            
            this.props.x += dx;
            this.props.y += dy;

            c.core.attr({
                cx: this.props.x,
                cy: this.props.y
            });

            c.slot.attr({
                cx: this.props.x,
                cy: this.props.y
            });
        },

        relocate: function(x, y) {
            this.props.x = 0;
            this.props.y = 0;
            this.translate(x, y);
        },

        transform: function(matrix) {
            var px = this.props.x,
                py = this.props.y,
                x = matrix.x(px, py),
                y = matrix.y(px, py);

            this.props.x = 0;
            this.props.y = 0;

            this.translate(x, y);
        },

        addLink: function(link) {
            var index = this.links.indexOf(link);
            if (index > -1) {
                this.links.splice(index, 1);
            }
            this.links.push(link);
            return this;
        },

        removeLink: function(link) {
            var index = this.links.indexOf(link);
            if (index > -1) {
                this.links.splice(index, 1);
            }
            return this;
        },

        refreshLinks: function() {
            var me = this;
            if (me.links.length) {
                _.forEach(me.links, function(link){
                    link.refresh();
                });
            }
        },

        onPortRender: function() {
            this.setup();
        },

        onLinkerActivate: function(e) {
            /*var port = Graph.$(e.target).data('port');
            console.log(port.network != this.network);
            if (port.network != this.network) {
                port.network.resume();
                console.log('called');
                port.components.port.addClass('drop-active');    
            }*/
        },

        onLinkerDeactivate: function(e) {
            var port = Graph.$(e.target).data('port');
            port.components.port.removeClass('drop-active');
        },

        onLinkerEnter: function(e) {
            var me = this, 
                snap = me.snapping, 
                linker = me.canvas.linker;

            var offset;

            if (linker.ports.source !== me) {
                offset = me.offset();

                snap.x = offset.left;
                snap.y = offset.top;
                snap.range = Infinity;

                e.draggable.setOptions('snap', {
                    targets: [
                        snap
                    ],
                    endOnly: true
                });

                me.connection.valid = true;
                me.components.port.addClass('drop-enter');
            }
        },

        onLinkerLeave: function(e) {
            var me = this, linker = me.canvas.linker;
            
            if (linker.ports.source !== me) {
                me.components.port.removeClass('drop-enter');
                me.connection.valid = false;
            }
        },

        onLinkerDrop: function(e) {
            var me = this, linker = me.canvas.linker;

            if (linker.ports.source !== me) {
                linker.target(me);
                linker.commit();
                me.components.port.removeClass('drop-enter');
                me.connection.connecting = false;
            }
        }
    });

}());