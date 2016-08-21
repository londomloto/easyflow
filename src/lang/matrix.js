
(function(){

    Graph.lang.Matrix = Graph.lang.Class.extend({

        constructor: function(a, b, c, d, e, f) {
            this.a = _.defaultTo(a, 1);
            this.b = _.defaultTo(b, 0);
            this.c = _.defaultTo(c, 0);
            this.d = _.defaultTo(d, 1);
            this.e = _.defaultTo(e, 0);
            this.f = _.defaultTo(f, 0);
        },

        x: function(x, y) {
            return x * this.a + y * this.c + this.e;
        },

        y: function(x, y) {
            return x * this.b + y * this.d + this.f;
        },

        get: function(chr) {
            return +this[chr].toFixed(4);
        },

        add: function(a, b, c, d, e, f) {
            var 
                result = [[], [], []],
                source = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]],
                matrix = [[a, c, e], [b, d, f], [0, 0, 1]];

            var x, y, z, tmp;

            if (a instanceof Graph.lang.Matrix) {
                matrix = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]];
            }

            for (x = 0; x < 3; x++) {
                for (y = 0; y < 3; y++) {
                    tmp = 0;
                    for (z = 0; z < 3; z++) {
                        tmp += source[x][z] * matrix[z][y];
                    }
                    result[x][y] = tmp;
                }
            }

            this.a = result[0][0];
            this.b = result[1][0];
            this.c = result[0][1];
            this.d = result[1][1];
            this.e = result[0][2];
            this.f = result[1][2];
        },

        translate: function(x, y) {
            x = _.defaultTo(x, 0);
            y = _.defaultTo(y, 0);
            this.add(1, 0, 0, 1, x, y);
        },

        rotate: function(angle, cx, cy) {
            angle = Graph.rad(angle);
            cx = _.defaultTo(cx, 0);
            cy = _.defaultTo(cy, 0);

            var cos = +Math.cos(angle).toFixed(9),
                sin = +Math.sin(angle).toFixed(9);

            this.add(cos, sin, -sin, cos, cx, cy);
            this.add(1, 0, 0, 1, -cx, -cy);
        },

        scale: function(x, y, cx, cy) {
            y = _.defaultTo(y, x);

            if (cx || cy) {
                cx = _.defaultTo(cx, 0);
                cy = _.defaultTo(cy, 0);
            }

            (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
            this.add(x, 0, 0, y, 0, 0);
            (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
        },

        stringify: function() {
            var array = [
                this.get('a'),
                this.get('b'),
                this.get('c'),
                this.get('d'),
                this.get('e'),
                this.get('f')
            ];

            return 'matrix(' + _.join(array, ',') + ')';
        }
    });
    
}());