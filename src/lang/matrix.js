
(function(){

    var Matrix = Graph.lang.Matrix = Graph.extend({

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

            if (a instanceof Matrix) {
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

        // helper
        invert: function() {
            var x = this.a * this.d - this.b * this.c;
            
            this.a =  this.d / x;
            this.b = -this.b / x;
            this.c = -this.c / x;
            this.d =  this.a / x;
            this.e = (this.c * this.f - this.d * this.e) / x;
            this.f = (this.b * this.e - this.a * this.f) / x;
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

        value: function() {
            var res = {}, row;
            
            res.dx = this.e;
            res.dy = this.f;

            row = [[this.a, this.c], [this.b, this.d]];
            res.scalex = Math.sqrt(circum(row[0]));
            normalize(row[0]);

            res.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
            row[1] = [row[1][0] - row[0][0] * res.shear, row[1][1] - row[0][1] * res.shear];

            res.scaley = Math.sqrt(circum(row[1]));
            normalize(row[1]);
            res.shear /= res.scaley;

            var sin = -row[0][1], cos = row[1][1];

            if (cos < 0) {
                res.rotate = Graph.deg(Math.acos(cos));
                if (sin < 0) {
                    res.rotate = 360 - res.rotate;
                }
            } else {
                res.rotate = Graph.deg(Math.asin(sin));
            }

            return res;

            /////////
            
            function circum(c) {
                return c[0] * c[0] + c[1] * c[1];
            }

            function normalize(c) { 
                var len = Math.sqrt(circum(c));
                if (len) {
                    c[0] && (c[0] /= len);
                    c[1] && (c[1] /= len);
                }
            }
        },

        /**
         * Convert to `matrix(...)` toString
         */
        toString: function() {
            var array = [
                this.get('a'),
                this.get('b'),
                this.get('c'),
                this.get('d'),
                this.get('e'),
                this.get('f')
            ];

            return 'matrix(' + _.join(array, ',') + ')';
        },

        toFilter: function() {
            return "progid:DXImageTransform.Microsoft.Matrix(" + 
               "M11=" + this.get('a') + ", " + 
               "M12=" + this.get('c') + ", " + 
               "M21=" + this.get('b') + ", " + 
               "M22=" + this.get('d') + ", " + 
               "Dx="  + this.get('e') + ", " + 
               "Dy="  + this.get('f') + ", " + 
               "sizingmethod='auto expand'"  + 
            ")";
        },

        toArray: function() {
            return [
                [this.get('a'), this.get('c'), this.get('e')], 
                [this.get('b'), this.get('d'), this.get('f')], 
                [0, 0, 1]
            ];
        },

        clone: function() {
            return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
        }

    });
    
}());