
(function(){

    Graph.router.Router = Graph.extend({
        props: {
            domain: null,
            source: null,
            target: null,
            command: 'M 0 0 L 0 0',
            segments: [['M', 0, 0], ['L', 0, 0]]
        },

        docks: {
            start: null,
            end: null
        },

        bends: [],
        
        constructor: function(domain, source, target, options) {
            this.props.domain = domain.guid();
            this.props.source = source.guid();
            this.props.target = target.guid();

            _.assign(this.props, options || {});

            source.on({
                resize: _.bind(this.onSourceResize, this),
                rotate: _.bind(this.onSourceRotate, this)
            });

            // VERY EXPENSIVE!!!
            if (source.isDraggable()) {
                if ( ! source.draggable().ghost()) {
                    source.on('dragmove', _.bind(this.onSourceDrag, this));
                    // source.on('dragend', _.bind(this.onSourceRoute, this));
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
                if ( ! target.draggable().ghost()) {
                    target.on('dragmove', _.bind(this.onTargetDrag, this));
                    // target.on('dragend', _.bind(this.onTargetRoute, this));
                } else {
                    target.on('dragend', _.bind(this.onTargetDragEnd, this));
                }
            }
        },

        domain: function() {
            return Graph.manager.vector.get(this.props.domain);
        },

        source: function() {
            return Graph.manager.vector.get(this.props.source);
        },

        target: function() {
            return Graph.manager.vector.get(this.props.target);
        },

        start: function() {
            return this.docks.start;
        },

        end: function() {
            return this.docks.end;
        },

        command: function(command) {
            if (_.isUndefined(command)) {
                return this.props.command;    
            }

            this.props.command = command;
            this.props.segments = Graph.util.path2segments(command);

            return this;
        },

        segments: function(segments) {
            if (_.isUndefined(segments)) {
                return this.props.segments;    
            }

            this.props.segments = segments;
            return this;
        },

        modify: function(index, x, y) {
            this.props.segments[index][1] = x;
            this.props.segments[index][2] = y;
        },

        commit: function() {
            this.props.command = Graph.util.segments2path(this.props.segments);
        },

        route: function(start, end) {
            return this;
        },
        
        reroute: function() {
            return this;
        },

        waypoints: function() {
            return [
                this.docks.start,
                this.docks.end
            ];
        },

        ///////// OBSERVERS /////////
        
        onSourceDrag: function(e) {},

        onSourceDragEnd: function(e) {},

        onSourceResize: function(e) {},

        onSourceRotate: function(e) {},

        onTargetDrag: function(e) {},

        onTargetDragEnd: function(e) {},

        onTargetResize: function(e) {},

        onTargetRotate: function(e) {}
    });

}());