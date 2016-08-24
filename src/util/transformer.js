
(function(){

    Graph.util.Transformer = Graph.extend({
        constructor: function(vector) {
            this.actions = [];
            this.vector = vector;
        },
        transform: function(command) {
            var me = this, transform = Graph.cmd2transform(command);
            
            _.forEach(transform, function(args){
                var method = args.shift();
                if (me[method] && _.isFunction(me[method])) {
                    (function(){
                        me[method].apply(me, args);
                    }(method, args));    
                }
            });

            return this;
        },
        queue: function() {
            var args = _.toArray(arguments);
            
            this.actions.push({
                name: args.shift(),
                args: args,
                sort: this.actions.length
            });

            return this;
        },
        translate: function(dx, dy) {
            dx = _.defaultTo(dx, 0);
            dy = _.defaultTo(dy, 0);
            this.queue('translate', dx, dy);
            return this;
        },
        rotate: function(deg, cx, cy) {
            if (_.isUndefined(cx) || _.isUndefined(cy)) {
                var bbox = this.vector.bbox(true);
                cx = bbox.x + bbox.width / 2;
                cy = bbox.y + bbox.height / 2;
            }
            this.queue('rotate', deg, cx, cy);
            return this;
        },
        scale: function(sx, sy, cx, cy) {
            sy = _.defaultTo(sy, sx);

            if (_.isUndefined(cx) || _.isUndefined(cy)) {
                var bbox = this.vector.bbox(true);
                cx = bbox.x + bbox.width / 2;
                cy = bbox.y + bbox.height / 2;
            }

            this.queue('scale', sx, sy, cx, cy);
            return this;
        },
        
        apply: function(absolute) {
            var me = this;
            var actions = this.actions;

            if ( ! actions.length) {
                return;
            }
            
            absolute = _.defaultTo(absolute, false);
            
            var deg = 0, dx = 0, dy = 0, sx = 1, sy = 1;
            var mat = this.vector.matrix.clone();
            
            _.forEach(actions, function(act){
                var arg = act.args,
                    cmd = act.name,
                    len = arg.length,
                    inv = false;

                if (absolute) {
                    inv = mat.clone();
                    inv.invert();
                }

                var x1, y1, x2, y2, bb;
                
                if (cmd == 'translate' && len === 2) {
                    if (absolute) {
                        x1 = inv.x(0, 0);
                        y1 = inv.y(0, 0);
                        x2 = inv.x(arg[0], arg[1]);
                        y2 = inv.y(arg[0], arg[1]);
                        mat.translate(x2 - x1, y2 - y1);
                    } else {
                        mat.translate(arg[0], arg[1]);
                    }
                } else if (cmd == 'rotate') {
                    if (len == 1) {
                        bb = bb || me.vector.bbox(true).value();
                        mat.rotate(arg[0], bb.x + bb.width / 2, bb.y + bb.height / 2);
                        deg += arg[0];
                    } else if (len == 3) {
                        if (absolute) {
                            x2 = inv.x(arg[1], arg[2]);
                            y2 = inv.y(arg[1], arg[2]);
                            mat.rotate(arg[0], x2, y2);
                        } else {
                            mat.rotate(arg[0], arg[1], arg[2]);
                        }
                        deg += arg[0];
                    }
                } else if (cmd == 'scale') {
                    if (len === 1 || len === 2) {
                        bb = bb || me.vector.bbox(true).value();
                        mat.scale(arg[0], arg[len - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                        sx *= arg[0];
                        sy *= arg[len - 1];
                    } else if (len === 4) {
                        if (absolute) {
                            x2 = inv.x(arg[2], arg[3]);
                            y2 = inv.y(arg[2], arg[3]);
                            mat.scale(arg[0], arg[1], x2, y2);
                        } else {
                            mat.scale(arg[0], arg[1], arg[2], arg[3]);
                        }
                        sx *= arg[0];
                        sy *= arg[1];
                    }
                } else if (cmd == 'matrix') {
                    mat.add(arg[0], arg[1], arg[2], arg[3], arg[4], arg[5]);
                }
            });
            
            this.vector.matrix = mat;
            this.vector.attr('transform', mat);
            
            this.actions = [];
            me.fire('transform');

            return this.vector;
        }
    });

}());