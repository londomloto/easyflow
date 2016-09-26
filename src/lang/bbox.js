
(function(){
    
    var BBox = Graph.lang.BBox = Graph.extend({
        
        props: {
            // origin
            x: 0,
            y: 0,

            // corner
            x2: 0,
            y2: 0,

            // dimension
            width: 0,
            height: 0
        },

        constructor: function(bbox) {
            this.props = _.cloneDeep(bbox);
        },
        
        data: function(name, value) {
            if (_.isUndefined(name) && _.isUndefined(value)) {
                return this.props;
            }

            if (_.isUndefined(value)) {
                return this.props[name];
            }

            return null;
        },
        
        x: function() {
            return this.props.x;
        },
        
        y: function() {
            return this.props.y;
        },
        
        origin: function() {
            return new Graph.lang.Point(this.props.x, this.props.y);
        },

        center: function() {
            return new Graph.lang.Point(
                this.props.x + this.props.width / 2,
                this.props.y + this.props.height / 2
            );
        },

        corner: function() {
            return new Graph.lang.Point(
                this.props.x + this.props.width, 
                this.props.y + this.props.height
            );
        },
        
        width: function() {
            return this.props.width;
        },
        
        height: function() {
            return this.props.height;
        },
        
        clone: function() {
            return new BBox(_.cloneDeep(this.props));
        },

        contain: function(obj) {
            var contain = true,
                bbox = this.props,
                dots = [];

            var vbox, papa, mat, dot;

            if (obj instanceof Graph.lang.Point) {
                dots = [
                    [obj.props.x, obj.props.y]
                ];
            } else if (obj instanceof Graph.svg.Vector) {
                dots = obj.dots(true);
            } else if (obj instanceof Graph.lang.BBox) {
                dots = [
                    [obj.props.x, obj.props.y],
                    [obj.props.x2, obj.props.y2]
                ];
            } else {
                var args = _.toArray(arguments);
                if (args.length === 2) {
                    dots = [args];
                }
            }

            if (dots.length) {
                var l = dots.length;
                while(l--) {
                    dot = dots[l];
                    contain = dot[0] >= bbox.x  && 
                              dot[0] <= bbox.x2 && 
                              dot[1] >= bbox.y  && 
                              dot[1] <= bbox.y2;
                    if ( ! contain) {
                        break;
                    }
                }
            }

            return contain;
        },

        expand: function(dx, dy, dw, dh) {
            this.props.x += _.defaultTo(dx, 0);
            this.props.y += _.defaultTo(dy, 0);
            this.props.width  += _.defaultTo(dw, 0);
            this.props.height += _.defaultTo(dh, 0);

            return this;
        },

        intersect: function(tbox) {
            var me = this,
                bdat = me.props,
                tdat = tbox.data(),
                func = me.contain;

            return tbox.contain(bdat.x, bdat.y)
                || tbox.contain(bdat.x2, bdat.y)
                || tbox.contain(bdat.x, bdat.y2)
                || tbox.contain(bdat.x2, bdat.y2)
                || me.contain(tdat.x, tdat.y)
                || me.contain(tdat.x2, tdat.y)
                || me.contain(tdat.x, tdat.y2)
                || me.contain(tdat.x2, tdat.y2)
                || (bdat.x < tdat.x2 && bdat.x > tdat.x || tdat.x < bdat.x2 && tdat.x > bdat.x)
                && (bdat.y < tdat.y2 && bdat.y > tdat.y || tdat.y < bdat.y2 && tdat.y > bdat.y);
        },

        sideNearestPoint: function(point) {
            var px = point.props.x,
                py = point.props.y,
                tx = this.props.x,
                ty = this.props.y,
                tw = this.props.width,
                th = this.props.height;

            var distToLeft = px - tx;
            var distToRight = (tx + tw) - px;
            var distToTop = py - ty;
            var distToBottom = (ty + th) - py;
            var closest = distToLeft;
            var side = 'left';

            if (distToRight < closest) {
                closest = distToRight;
                side = 'right';
            }

            if (distToTop < closest) {
                closest = distToTop;
                side = 'top';
            }
            if (distToBottom < closest) {
                closest = distToBottom;
                side = 'bottom';
            }

            return side;
        },

        pointNearestPoint: function(point) {
            if (this.contain(point)) {
                var side = this.sideNearestPoint(point);
                switch (side){
                    case 'right': return Graph.point(this.props.x + this.props.width, point.props.y);
                    case 'left': return Graph.point(this.props.x, point.props.y);
                    case 'bottom': return Graph.point(point.props.x, this.props.y + this.props.height);
                    case 'top': return Graph.point(point.props.x, this.props.y);
                }
            }
            return point.clone().adhereToBox(this);
        }
    });

}());