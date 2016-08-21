
EF.vector.Circle = (function(_){

    var Point = EF.lang.Point;
    var Vector = EF.vector.Vector;
    var Text = EF.vector.Text;

    var Circle = Vector.extend({
        
        constructor: function(radius, left, top) {
            this.$super('g');

            this.components = {
                circle: new Vector('circle'),
                text: new Text()
            };

            radius = _.defaultTo(radius, 0);
            left = _.defaultTo(left, 0);
            top = _.defaultTo(top, 0);

            this.offset = new Point(left, top);
            this.radius = radius;

            this.resize();
            this.translate();
        },

        resize: function(radius) {
            if ( ! _.isUndefined(radius)) {
                this.radius = radius;
            }

            this.attr('r', this.radius);
        },

        translate: function(left, top) {
            if ( ! _.isUndefined(left) && ! _.isUndefined(top)) {
                this.offset.x = left;
                this.offset.y = top;
            }

            var offset = 'translate(' + this.offset.stringify() + ')';
            this.attr('transform', offset);

            return this;
        },

        text: function(text) {
            if (_.isUndefined(text)) {
                return this.components.text.text();
            }

            this.components.text.text(text);
            
            return this;
        }

    });

    return Circle;
}(_));