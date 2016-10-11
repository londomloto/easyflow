
(function(){

    var Point = Graph.lang.Point = Graph.extend({

        props: {
            x: 0,
            y: 0
        },

        constructor: function(x, y) {
            var tmp;

            if (_.isPlainObject(x)) {
                tmp = x;
                x = tmp.x;
                y = tmp.y;
            } else if (_.isString(x)) {
                tmp = _.split(_.trim(x), ',');
                x = _.toNumber(tmp[0]);
                y = _.toNumber(tmp[1]);
            }

            this.props.x = x;
            this.props.y = y;
        },

        x: function(x) {
            if (_.isUndefined(x)) {
                return this.props.x;
            }
            this.props.x = x;
            return this;
        },

        y: function(y) {
            if (_.isUndefined(y)) {
                return this.props.y;
            }
            this.props.y = y;
            return this;
        },

        distance: function(b) {
            var dx = this.props.x - b.props.x,
                dy = this.props.y - b.props.y;

            return Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2));
        },

        /**
         * Manhattan (taxi-cab) distance
         */
        manhattan: function(p) {
            return Math.abs(p.props.x - this.props.x) + Math.abs(p.props.y - this.props.y);
        },

        /**
         * Angle to another point
         */
        angle: function(b) {
            return Graph.math.angle(this.props.x, this.props.y, b.props.x, b.props.y);
        },
        
        /**
         * Angle created by two another points
         */
        triangle: function(b, c) {
            return this.angle(c) - b.angle(c);
        },

        theta: function(p) {
            return Graph.math.theta(this.props.x, this.props.y, p.props.x, p.props.y);
        },

        difference: function(p) {
            return new Point(this.props.x - p.props.x, this.props.y - p.props.y);
        },

        alignment: function(p) {
            var cx = this.props.x,
                cy = this.props.y,
                px = p.props.x,
                py = p.props.y;

            if (Math.abs(cx - px) <= 2) {
                return 'h';
            }

            if (Math.abs(cy - py) <= 2) {
                return 'v';
            }

            return false;
        },

        bbox: function() {
            var x = this.props.x,
                y = this.props.y;
                
            return Graph.bbox({
                x: x,
                y: y,
                x2: x,
                y2: y,
                width: 0,
                height: 0
            });
        },

        bearing: function(p) {
            var line = new Graph.lang.Line(this, p),
                bear = line.bearing();
            line = null;
            return bear;
        },

        /**
         * Snap to grid
         */
        snap: function(x, y) {
            y = _.defaultTo(y, x);

            this.props.x = snap(this.props.x, x);
            this.props.y = snap(this.props.y, y);

            return this;
        },

        move: function(to, distance) {
            var rad = Graph.math.rad(to.theta(this));
            this.expand(Math.cos(rad) * distance, -Math.sin(rad) * distance);
            return this;
        },

        expand: function(dx, dy) {
            this.props.x += dx;
            this.props.y += dy;

            return this;
        },

        round: function(dec) {
            this.props.x = dec ? this.props.x.toFixed(dec) : Math.round(this.props.x);
            this.props.y = dec ? this.props.y.toFixed(dec) : Math.round(this.props.y);
            return this;
        },

        equals: function(p) {
            return this.props.x == p.props.x && this.props.y == p.props.y;
        },

        rotate: function(angle, origin) {
            var rd = Graph.math.rad(angle), 
                dx = this.props.x - (origin ? origin.props.x : 0),
                dy = this.props.y - (origin ? origin.props.y : 0),
                si = Math.sin(rd),
                co = Math.cos(rd);

            var rx = dx *  co + dy * si,
                ry = dx * -si + dy * co;

            this.props.x = this.props.x + rx;
            this.props.y = this.props.y + ry;

            return this;
        },

        transform: function(matrix) {
            var x = this.props.x,
                y = this.props.y;

            this.props.x = matrix.x(x, y);
            this.props.y = matrix.y(x, y);

            return this;
        },

        comply: function(bbox) {

        },  

        /**
         * Export to polar
         */
        polar: function() {

        },

        adhereToBox: function(box) {
            if (box.contains(this)) {
                return this;
            }

            this.props.x = Math.min(Math.max(this.props.x, box.props.x), box.props.x + box.props.width);
            this.props.y = Math.min(Math.max(this.props.y, box.props.y), box.props.y + box.props.height);
            
            return this;
        },

        stringify: function(sep) {
            sep = _.defaultTo(sep, ',');
            return this.props.x + sep + this.props.y;
        },

        toString: function() {
            return this.stringify();
        },

        toJson: function() {
            return {
                x: this.props.x, 
                y: this.props.y
            };
        },

        clone: function(){
            return new Point(this.props.x, this.props.y);
        }
    });

    ///////// STATIC /////////
    Graph.lang.Point.toString = function() {
        return 'function(x, y)';
    };

    ///////// HELPER /////////
    
    function snap(value, size) {
        return size * Math.round(value / size);
    }

    ///////// EXTENSION /////////
    
    Graph.isPoint = function(obj) {
        return obj instanceof Graph.lang.Point;
    };

    Graph.point = function(x, y) {
        return new Graph.lang.Point(x, y);
    };
    
}());