
EF.vector.Diamond = (function(_){
    var Point = EF.lang.Point;
    var Vector = EF.vector.Vector;
    var Text = EF.vector.Text;

    var Diamond = Vector.extend({

        constructor: function(width, height, left, top) {
            this.$super('g');
            this.addClass('ef-vector-diamond');

            this.components = {
                polygon: new Vector('polygon'),
                text: new Text()
            };

            width = _.defaultTo(width, 0);
            height = _.defaultTo(height, 0);
            left = _.defaultTo(left, 0);
            top = _.defaultTo(top, 0);

            this.offset = new Point(left, top);

            this.points = [
                new Point(0, 0),
                new Point(0, 0),
                new Point(0, 0),
                new Point(0, 0)
            ];

            this.resize(width, height);
            this.translate();
        },

        resize: function(width, height) {
            if ( ! _.isUndefined(width) && ! _.isUndefined(height)) {
                
                var midx = Math.round(width / 2, 0);
                var midy = Math.round(height / 2, 0);

                this.points[0].x = midx;

                this.points[1].x = width;
                this.points[1].y = midy;

                this.points[2].x = midx;
                this.points[2].y = height;

                this.points[3].y = midy;
            }

            var points = _.join(_.map(this.points, function(p){ return p.stringify(); }), ' ');
            this.components.polygon.attr('points', points);

            return this;
        },

        translate: function(left, top) {
            if ( ! _.isUndefined(left) && ! _.isUndefined(top)) {
                this.offset.x = left;
                this.offset.y = top;
            }

            var offset = 'translate(' + this.offset.stringify() + ')';
            this.attr('transform', translate);

            return this;
        }
    });

    return Diamond;
}(_));