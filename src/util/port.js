
(function(){

    var Port = Graph.util.Port = Graph.extend({

        props: {
            id: null,
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            segment: 0,
            weight: 0,
            connected: false
        },
        
        network: null,

        components: {
            port: null,
            slot: null,
            core: null
        },

        connection: {
            connecting: false,
            valid: false
        },

        links: [],

        dragLink: null,

        constructor: function(x, y, options) {
            
            options = _.extend({
                id: 'P' + (++Port.guid),
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

            comp.port = (new Graph.svg.Group())
                .addClass('graph-util-port')
                .removeClass(Graph.string.CLS_VECTOR_GROUP);

            comp.port.on({
                render: _.bind(me.onPortRender, me)
            });

            comp.slot = (new Graph.svg.Ellipse(prop.x, prop.y, prop.width, prop.height))
                .addClass('graph-util-port-slot')
                .removeClass(Graph.string.CLS_VECTOR_ELLIPSE);

            comp.core = (new Graph.svg.Ellipse(prop.x, prop.y, 2, 2))
                .addClass('graph-util-port-core')
                .removeClass(Graph.string.CLS_VECTOR_ELLIPSE)
                .clickable(false);

            for(var name in comp) {
                comp[name].props.selectable = false;
                comp[name].props.traversable = false;
                comp[name].elem.data(Graph.string.ID_PORT, prop.id);
                comp[name].elem.group('graph-util-port');

                if (name != 'port') {
                    comp[name].render(comp.port);
                }
            }
        },

        component: function() {
            return this.components.port;
        },

        connected: function(state) {
            if (_.isUndefined(state)) {
                return this.props.connected;
            }
            this.props.connected = state;
            return this;
        },

        vector: function() {
            return this.network.vector;
        },

        render: function() {
            var me = this, network = me.network;

            me.components.port.render(network.component());

            network.on({
                suspend: function() {
                    if (network.$dropready) {
                        console.log('dropready_false');
                        network.$dropready = false;
                    }
                }
            });

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
            return Graph.point(this.props.x, this.props.y);
        },

        offset: function() {
            var poffset = this.vector().paper().elem.position()
                offset = {
                    left: this.props.x,
                    top: this.props.y
                };

            offset.left += poffset.left;
            offset.top  += poffset.top;

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
                prop = me.props;

            if (me.draggable) {
                return;
            }

            me.draggable = comp.slot.interactable().draggable({
                manualStart: true,
                inertia: false,

                snap: {
                    targets: [
                        interact.createSnapGrid({x: 1, y: 1})
                    ]
                },
                onstart: function(e) {
                    
                    /*linker.source(me);

                    me.connection.connecting = true;
                    me.draggable.setOptions('snap', {
                        targets: [
                            interact.createSnapGrid({x: 1, y: 1})
                        ]
                    });*/
                    
                },
                onmove: function(e) {
                    if (me.dragLink) {
                        me.dragLink.dragging(e.dx, e.dy);
                    }
                    // linker.expandBy(e.dx, e.dy);
                },
                onend: function(e) {
                    if (me.dragLink) {
                        me.dragLink.stopDragging();
                    }
                    /*if (me.connection.connecting && ! me.connection.valid) {
                        linker.revert();
                    }*/
                }
            });

            me.draggable.styleCursor(false);

            var dropel = comp.slot.node(),
                paper = this.vector().paper();

            me.draggable.on({
                move: function(e) {
                    var i = e.interaction, dragel;

                    if (i.pointerIsDown && e.currentTarget === dropel) {
                        if ( ! i.interacting()) {

                            if ( ! me.dragLink) {
                                me.dragLink = paper.link(me, me);
                                me.dragLink.render();
                            }

                            me.dragLink.startDragging('head', i);
                            
                            dragel = me.dragLink.components.head.node();
                            i.start({name: 'drag'}, e.interactable, dragel);
                        }
                    }
                }
            });

            me.droppable = comp.slot.interactable().dropzone({
                overlap: .2,
                accept: '.graph-util-link-head, .graph-util-link-tail'
            });

            me.droppable.on({
                dropactivate: _.bind(me.onLinkActivate, me),
                dropdeactivate: _.bind(me.onLinkDeactivate, me),
                dragenter: _.bind(me.onLinkEnter, me),
                dragleave: _.bind(me.onLinkLeave, me),
                drop: _.bind(me.onLinkDrop, me)
            });

            // droppable
            /*me.droppable = comp.slot.interactable().dropzone({
                overlap: .2,
                accept: '.graph-util-linker-point',
                manualStart: true
            });
            
            me.droppable.on({
                dropactivate: _.bind(me.onLinkActivate, me),
                dropdeactivate: _.bind(me.onLinkDeactivate, me),
                dragenter: _.bind(me.onLinkEnter, me),
                dragleave: _.bind(me.onLinkLeave, me),
                drop: _.bind(me.onLinkDrop, me)
            });*/
            
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

        connectLink: function(link) {
            var index = this.links.indexOf(link);
            if (index > -1) {
                this.links.splice(index, 1);
            }
            this.links.push(link);
            return this;
        },

        disconnectLink: function(link) {
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

        onLinkActivate: function(e) {
            /*var port = Graph.$(e.target).data('port');
            console.log(port.network != this.network);
            if (port.network != this.network) {
                port.network.resume();
                console.log('called');
                port.components.port.addClass('drop-active');    
            }*/
        },

        onLinkDeactivate: function(e) {
            var el = Graph.$(e.target), id;
            if ((id = el.data(Graph.string.ID_PORT))) {
                
            }
            // var port = Graph.$(e.target).data('port');
            // port.components.port.removeClass('drop-active');
        },

        onLinkEnter: function(e) {
            var me = this,
                link = Graph.manager.link.get(e.relatedTarget);

            if (link) {
                var source = link.ports.source,
                    target = link.ports.target;

                if (source !== me && target !== me) {
                    var offset = me.offset(),
                        snap = {
                            x: offset.left,
                            y: offset.top
                        };

                    e.draggable.setOptions('snap', {
                        targets: [snap],
                        endOnly: true
                    });

                    me.components.port.addClass('drop-enter');
                }
            }
        },

        onLinkLeave: function(e) {
            var me = this,
                link = Graph.manager.link.get(e.relatedTarget);

            if (link) {
                var source = link.ports.source,
                    target = link.ports.target;

                if (source !== me && target !== me) {
                    me.components.port.removeClass('drop-enter');
                }
            }
        },

        onLinkDrop: function(e) {
            var me = this,
                link = Graph.manager.link.get(e.relatedTarget);

            if (link) {
                var source = link.ports.source,
                    target = link.ports.target;

                if (source !== me && target !== me) {
                    link.target(me);
                    link.connect();
                    me.components.port.removeClass('drop-enter');
                }
            }
        },

        toString: function() {
            return 'Graph.util.Port';
        }
    });


    ///////// STATICS /////////
    
    Port.guid = 0;

}());