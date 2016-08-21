
EF.vector.Rectangle = (function(_){

    var Point = EF.lang.Point;
    var Text = EF.vector.Text;
    var Vector = EF.vector.Vector;

    var Rectangle = Vector.extend({
        
        constructor: function(width, height, left, top) {

            this.$super('g');
            this.addClass('ef-vector-rectangle');
            
            this.components = {
                polygon: new Vector('polygon'),
                text: new Text()
            };

            this.append(this.components.polygon);
            this.append(this.components.text);

            top = _.defaultTo(top, 0);
            left = _.defaultTo(left, 0);
            width = _.defaultTo(width, 0);
            height = _.defaultTo(height, 0);

            this.offset = new Point(left, top);

            this.points = [
                new Point(0, 0),
                new Point(width, 0),
                new Point(width, height),
                new Point(0, height)
            ];

            this.resize();
            this.translate();
        },

        resize: function(width, height) {

            if ( ! _.isUndefined(width) && ! _.isUndefined(height)) {
                this.points[1].x = width;
                this.points[2].x = width;

                this.points[2].y = height;
                this.points[3].y = height;
            }

            var points = _.join(_.map(this.points, function(p){ return p.stringify(); }), ' ');

            this.components.polygon.attr('points', points);

            return this;
        },

        translate: function(left, top) {

            if ( ! _.isUndefined(left) && _.isUndefined(top)) {
                this.offset.x = left;
                this.offset.y = top;
            }

            var offset = 'translate(' + this.offset.stringify() + ')';

            this.attr('transform', offset);

            return this;
        },

        left: function(left) {
            if (_.isUndefined(left)) {
                return this.offset.x;
            }

            this.offset.x = left;
            this.translate();

            return this;
        },

        top: function(top) {
            if (_.isUndefined(top)) {
                return this.offset.y;
            }

            this.offset.y = top;
            this.translate();

            return this;
        },

        width: function(width) {
            if (_.isUndefined(width)) {
                return this.points[0].distance(this.points[1]);
            }

            this.points[1].x = width;
            this.points[2].x = width;

            this.resize();

            return this;
        },

        height: function(height) {
            if (_.isUndefined(height)) {
                return this.points[1].distance(this.points[2]);
            }

            this.points[2].y = height;
            this.points[3].y = height;

            this.resize();

            return this;
        },

        // @Override
        text: function(text) {
            this.components.text.text(text);
        },

        serialize: function() {
            return {
                text: '',
                width: 0,
                height: 0
            };
        }
    });

    return Rectangle;
}(_));