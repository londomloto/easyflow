
EF.Action = (function(_){

    var Class = EF.Shape.extend({
        
        width: 200,
        height: 60,

        constructor: function(config) {
            config = config || {};
            _.extend(this, config);

            this.vectors = {
                group: new EF.Vector('g'),
                polygon: new EF.Vector('polygon'),
                text: new EF.Text(this.text)
            };

            this.vectors.group.addClass('ef-shape ef-shape-action');
            this.vectors.group.append(this.vectors.polygon);
            this.vectors.group.append(this.vectors.text);

            
            // translate
            
            var translate = 'translate(' + (this.left + ',' + this.top) + ')';
            this.vectors.group.attr('transform', translate);

            // points
            var points = "0,0 " + this.width + ",0 " + this.width + "," + this.height + " " + "0," + this.height;
            this.vectors.polygon.attr('points', points);

            this.vectors.text.attr({
                x: 0,
                y: 0,
                width: this.width,
                height: this.height
            });


            var me = this;

            this.vectors.group.on('click', function(e){
                e.stopPropagation();
                this.addClass('ef-selected');
            });

            this.draggie = new EF.Draggable(this.vectors.group, {
                onmove: function(e) {
                    me.left += e.dx;
                    me.top += e.dy;
                    
                    var translate = 'translate(' + (me.left + ',' + me.top) + ')';
                    me.vectors.group.attr('transform', translate);
                },
                onstart: function() {
                    me.vectors.group.addClass('ef-selected ef-dragging');
                },
                onend: function() {
                    me.vectors.group.removeClass('ef-dragging');
                }
            });

            // defaults
            /*this.points = [];

            this.vector = new EF.Vector('g');
            this.vector.addClass('ef-shape ef-shape-action');

            this.polygon = new EF.Vector('polygon');
            this.vector.append(this.polygon);

            _.extend(this, config);

            var points = _.isString(this.points) ? this.points : _.join(_.map(this.points, function(e){
                return _.join(e, ',');
            }), ' ');

            var translate = 'translate(' + (_.join(this.offset, ',')) + ')';

            this.polygon.attr('points', points);
            this.vector.attr('transform', translate);*/

        },

        doLayout: function() {
            
        },

        setPoints: function() {

        },

        setText: function(text) {
            if (text !== undefined) {
                this.text = text;
            }

            /*this.vectors.html.content(

            );*/

            // this.vectors.text.text(this.text);
            // this.vectors.foreign.content(this.text);
        },

        render: function() {
            this.vectors.group.render(EF('.e-paper svg').first());
        }

    });

    return Class;
}(_));