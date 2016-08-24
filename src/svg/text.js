
(function(){

    Graph.svg.Text = Graph.svg.Vector.extend({
        
        attrs: {
            'text-anchor': 'middle',
            'stroke': 'none',
            'fill': '#000000',
            'font-size': '10px',
            'font-family': 'Arial'
        },  

        props: {
            text: ''
        },

        rows: [],

        constructor: function(x, y, text) {
            this.$super('text', {
                x: _.defaultTo(x, 0),
                y: _.defaultTo(y, 0)
            });

            this.value(text);
            this.on('render', _.bind(this.refresh, this));
        },

        value: function(text) {
            if (_.isUndefined(text)) {
                return this.props.text;
            }

            var font = _.int(this.attrs['font-size'], 10) || 10,
                parts = (text || '').split("\n"),
                span;

            this.empty();
            this.rows = [];

            _.forEach(parts, _.bind(function(t, i){
                span = Graph.doc.createElementNS(Graph.XMLNS_SVG, 'tspan');
                span.appendChild(Graph.doc.createTextNode(t));
                this.rows[i] = span;
                this.elem.append(span);
            }, this));

            this.props.text = text;
        },

        /**
         * Synchronize position
         */
        refresh: function() {
            var rows = this.rows,
                font = _.int(this.attrs['font-size'], 10) || 10;

            if (rows.length) {
                for (var i = 0, ii = rows.length; i < ii; i++) {
                    if (i) {
                        rows[i].setAttribute('x', this.attrs.x);
                        rows[i].setAttribute('dy', font * 1.2);
                    }
                }

                var box = this.bbox().value(),
                    off = this.attrs.y - (box.y + box.height / 2);

                if (off) {
                    rows[0].setAttribute('dy', off);
                }
            }
        },
        
        pathinfo: function() {
            var bbox = {};
                     
            try {
                bbox = this.elem[0].getBBox();
            } catch(e) {
                bbox = {
                    x: this.elem[0].clientLeft,
                    y: this.elem[0].clientTop,
                    width: this.elem[0].clientWidth,
                    height: this.elem[0].clientHeight
                };
            } finally {
                bbox = bbox || {};
            }
            
            return new Graph.lang.Path([
                ['M', bbox.x, bbox.y], 
                ['l', bbox.width, 0], 
                ['l', 0, bbox.height], 
                ['l', -bbox.width, 0], 
                ['z']
            ]);
        },

        toString: function() {
            return this.props.text;
        }
    });

}());