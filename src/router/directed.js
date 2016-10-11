
(function(){

    Graph.router.Directed = Graph.extend(Graph.router.Router, {

        props: {
            domain: null,
            source: null,
            target: null,
            command: 'M 0 0 L 0 0',
            segments: [['M', 0, 0], ['L', 0, 0]]
        },

        direction: {
            orientation: null
        },

        ports: {
            start: null,
            end: null
        },

        docks: {
            start: null,
            end: null
        },

        bends: [],

        orienting: function(sbox, tbox) {
            if ( ! sbox) {
                sbox = this.source().bbox();
            }

            if ( ! tbox) {
                tbox = this.target().bbox();
            }

            var sori = sbox.origin(),
                tori = tbox.origin(),
                scor = sbox.corner(),
                tcor = tbox.corner();

            var top = scor.props.y <= tori.props.y,
                right = sori.props.x >= tcor.props.x,
                bottom = sori.props.y >= tcor.props.y,
                left = scor.props.x <= tori.props.x;

            var ver = top  ? 'top'  : (bottom ? 'bottom' : null),
                hor = left ? 'left' : (right ? 'right' : null);

            if (hor && ver) {
                this.direction.orientation = ver + '-' + hor;
            } else {
                this.direction.orientation = hor || ver || 'intersect';
            }

            return this;
        },

        directing: function(start, end) {
            var orient = this.direction.orientation,
                source = this.source(),
                target = this.target();

            var spath, tpath, lpath, cpath, dirs, sdot, edot;
            var inter, imaxs, found;

            // validate
            spath = source.pathinfo().transform(source.matrix());
            tpath = target.pathinfo().transform(target.matrix());
            
            lpath = Graph.path([
                ['M', start.props.x, start.props.y],
                ['L', end.props.x, end.props.y]
            ]);

            inter = spath.intersection(lpath, true);

            if (inter.length) {
                imaxs = inter.length - 1;
                this.docks.start = Graph.point(inter[imaxs].x, inter[imaxs].y);
            }
            
            inter = tpath.intersection(lpath, true);

            if (inter.length) {
                imaxs = inter.length - 1;
                this.docks.end = Graph.point(inter[imaxs].x, inter[imaxs].y);
            }
            
            return this;
        },

        route: function(start, end) {
            var source = this.source(),
                target = this.target();

            var sbox = source.bbox(),
                tbox = target.bbox();

            if (start) {
                this.ports.start = start;
            }

            if (end) {
                this.ports.end = end;
            }

            start = sbox.center();
            end   = tbox.center();

            this.orienting(sbox, tbox);
            this.directing(start, end);

            this.build();

            this.fire('route', {
                command: this.props.command
            });

            return this;
        },

        reroute: function() {
            this.route();
        },

        build: function() {
            var start = this.docks.start,
                end = this.docks.end;

            var segments;

            segments = [
                ['M', start.props.x, start.props.y], 
                ['L', end.props.x, end.props.y]
            ];

            this.segments(segments);
            this.commit();

            return this;
        },

        toString: function() {
            return 'Graph.router.Directed';
        },

        ///////// OBSERVERS /////////
        
        onSourceDrag: function(e) {
            this.reroute();
        },

        onSourceDragEnd: function() {
            this.reroute();
        },

        onSourceResize: function() {
            this.reroute();
        },

        onTargetDrag: function() {
            this.reroute();
        },

        onTargetDragEnd: function() {
            this.reroute();
        },

        onTargetResize: function() {
            this.reroute();
        }
    });

}());