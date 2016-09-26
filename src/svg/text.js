
(function(){

    Graph.svg.Text = Graph.svg.Vector.extend({
        
        attrs: {
            // 'stroke': '#000000',
            // 'stroke-width': .05,
            // 'fill': '#000000',
            // 'font-size': '12px',
            // 'font-family': 'Arial',
            'text-anchor': 'middle',
            'class': 'graph-elem graph-elem-text'
        },  

        props: {
            text: '',
            angle: 0,
            lineHeight: 1,
            collectable: true,
            selectable: true,
            selected: false
        },

        rows: [],

        constructor: function(x, y, text) {
            this.$super('text', {
                x: _.defaultTo(x, 0),
                y: _.defaultTo(y, 0)
            });

            this.attr({
                'font-size': Graph.config.font.size,
                'font-family': Graph.config.font.family
            });
            
            this.text(text);

            this.on('render', _.bind(this.arrange, this));
        },

        text: function(text) {
            if (_.isUndefined(text)) {
                return this.props.text;
            }

            var font = this.fontSize(),
                parts = (text || '').split("\n"),
                doc = Graph.doc(),
                span;

            this.empty();
            this.rows = [];

            _.forEach(parts, _.bind(function(t, i){
                span = doc.createElementNS(Graph.config.xmlns.svg, 'tspan');
                span.setAttribute('text-anchor', 'middle');
                span.setAttribute('alignment-baseline', 'center');
                span.appendChild(doc.createTextNode(t));
                Graph.$(span).data('vector', this);

                this.rows[i] = span;
                this.elem.append(span);
            }, this));

            this.props.text = text;
        },

        /**
         * Arrange position
         */
        arrange: function() {
            var rows = this.rows,
                size = this.fontSize(),
                line = this.lineHeight(),
                bbox = this.bbox(false, false).data();

            if (rows.length) {
                for (var i = 0, ii = rows.length; i < ii; i++) {
                    if (i) {
                        rows[i].setAttribute('x', this.attrs.x);
                        rows[i].setAttribute('dy', size * line);
                    }
                }

                rows[0].setAttribute('dy', 0);

                // var box = this.bbox().data(),
                //     off = this.attrs.y - (box.y + box.height / 2);

                // if (off) {
                //     rows[0].setAttribute('dy', off);    
                // }
                
            }
        },

        center: function(target) {
            if (target) {
                var targetBox = target.bbox(false, false).data(),
                    matrix = this.matrix.data();

                var textBox, dx, dy, cx, cy;

                this.reset();

                textBox = this.bbox(false, false).data();   

                dx = targetBox.width / 2;
                dy = targetBox.height / 2;
                cx = textBox.x + textBox.width / 2;
                cy = textBox.y + textBox.height / 2;

                if (matrix.rotate) {
                    this.translate(dx, dy).rotate(matrix.rotate).apply();
                } else {
                    this.translate(dx, dy).apply();
                }

            }
        },

        pathinfo: function() {
            var size = this.dimension();

            return new Graph.lang.Path([
                ['M', size.x, size.y], 
                ['l', size.width, 0], 
                ['l', 0, size.height], 
                ['l', -size.width, 0], 
                ['z']
            ]);
        },

        fontSize: function() {
            return _.parseInt(this.attrs['font-size']);
        },

        lineHeight: function() {
            return this.props.lineHeight;
        },

        toString: function() {
            return this.props.text;
        }
    });

}());