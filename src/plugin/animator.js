
(function(){
    var global = this;

    var Animator = Graph.plugin.Animator = Graph.extend({

        props: {
            vector: null,

            // default duration
            duration: 1000,

            // default easing
            easing: 'linier'
        },

        queue: [],

        constructor: function(vector) {
            this.props.vector = vector.guid();
        },

        vector: function() {
            return Graph.manager.vector.get(this.props.vector);
        },

        animate: function(params, duration, easing, callback) {
            var vector = this.vector();
            var scenes, animation;

            duration = _.defaultTo(duration, this.props.duration);

            if (_.isFunction(easing)) {
                callback = easing;
                easing = this.props.easing;
            }

            if ( ! easing) {
                easing = this.props.easing;
            }

            scenes = {
                100: params
            };

            animation = new Animation(vector, scenes, duration, easing, callback);
            this.start(animation, animation.frame(0), null);

            return animation;
        },

        resume: function() {

        },

        pause: function() {

        },

        stop: function() {

        },

        start: function(animation, frame, status, repeat) {
            var vector = this.vector(),
                queue = {
                    animation: animation,
                    vector: vector,
                    from: {},
                    to: {},
                    delta: {}
                },
                asize = animation.count(),
                qsize = this.queue.length,
                last = animation.scene(asize - 1).frame;

            var prev, next, last, scene, duration, playing, applied, q, i;

            if (status) {
                for (i = 0; i < qsize; i++) {
                    q = this.queue[i];
                    if (q.animation == animation) {
                        if (q.curr != curr) {
                            this.queue.splice(i, 1);
                            applied = 1;
                        } else {
                            playing = q;
                        }
                        vector.attr(q.origins);
                        break;
                    }
                }
            } else {
                status = +queue.to;
            }

            for (i = 0; i < asize; i++) {
                scene = animation.scene(i);
                if (scene.frame == frame || scene.frame > status * last) {
                    // prev scene
                    prev = animation.scene(i - 1);
                    queue.prev = prev ? prev.frame : 0;

                    // curr scene
                    queue.frame = scene.frame;

                    // next scene
                    next = animation.scene(i + 1);
                    queue.next = next;

                    break;
                } else if (status) {
                    vector.attr(scene.attrs);
                }
            }

            if ( ! scene || (scene && ! scene.valid)) {
                queue = null;
                return;
            }

            if ( ! playing) {

                var timestamp = +new Date,
                    delay = animation.delay();

                repeat = repeat || animation.repeat();

                _.extend(queue, {
                    timestamp: timestamp,
                    delay: delay,
                    start: timestamp + delay,

                    // origin: vector.attrs,
                    origins: vector.attrs,

                    repeat: repeat,
                    callback: scene.callback,
                    easing: scene.easing,
                    from: scene.from,
                    to: scene.to,
                    delta: scene.delta,
                    duration: scene.duration,
                    status: 0,
                    initstatus: status || 0,
                    stop: false,
                    last: last
                });

                this.queue.push(queue);

                if (status && ! playing && ! applied) {
                    queue.stop = true;
                    queue.start = new Date - scene.duration * status;
                    if (this.queue.length === 1) {
                        return this.player();
                    }
                }

                if (applied) {
                    queue.start = new Date - scene.duration * status;
                }

                if (this.queue.length === 1) {
                    Animator.play(_.bind(this.player, this));
                }
            } else {
                playing.initstatus = status;
                playing.start = new Date - playing.duration * status;
            }
        },

        player: function(ts) {
            var time = +new Date,
                ques = this.queue,
                size = ques.length,
                init = {},
                sets = {},
                curr = 0;

            var tick, value, name, type, prog, anim, q, t;

            for (; curr < size; curr++) {
                q = ques[curr];
                anim = q.animation;

                if (q.paused) {
                    continue;
                }

                // progress
                prog = time - q.start;
                console.log(prog, q.duration);

                if (q.initstatus) {
                    prog = (q.initstatus * q.last - q.prev) / (q.frame - q.prev) * q.duration;
                    q.status = q.initstatus;
                    delete q.initstatus;
                    q.stop && ques.splice(curr--, 1);
                } else {
                    q.status = (q.prev + (q.frame - q.prev) * (prog / q.duration)) / q.last;
                }

                if (prog < 0) {
                    continue;
                }

                if (prog < q.duration) {
                    tick = q.easing(prog / q.duration);

                    for (name in q.from) {
                        type = Animation.animable[name];
                        switch(type) {
                            case 'number':
                                value = +q.from[name] + tick * q.duration * q.delta[name];
                                break;
                        }
                        sets[name] = value;
                    }
                    q.vector.attr(sets);
                } else {
                    q.vector.attr(q.to);
                    ques.splice(curr--, 1);
                    
                    if (q.repeat > 1 && ! q.next) {
                        for (name in q.to) {
                            init[name] = q.origins[name];
                        }
                        q.vector.attr(init);
                        this.start(anim, anim.frame(0), null, q.origins, q.repeat - 1);
                    }

                    if (q.next && ! q.stop) {
                        this.start(anim, q.next, null, q.origins, q.repeat);
                    }
                }
            }
            ques.length && Animator.play(_.bind(this.player, this));
        }

    });

    Animator.play = (function(g){
        var player = g.requestAnimationFrame || 
                     g.webkitRequestAnimationFrame || 
                     g.mozRequestAnimationFrame || 
                     g.oRequestAnimationFrame || 
                     g.msRequestAnimationFrame || 
                     function (callback) { setTimeout(callback, 16); };

        return _.bind(player, g);
    }(global));

    ///////// INTERNAL ANIMATION /////////
    
    var Animation = Graph.extend({

        props: {
            guid: null,
            easing: 'linier',
            duration: 1000,
            repeat: 1,
            delay: 0
        },
        
        scenes: {},
        frames: [],
        
        constructor: function(vector, scenes, duration, easing, callback) {
            this.props.duration = duration = _.defaultTo(duration, 1000);
            this.props.guid = 'graph-anim-' + (++Animation.guid);

            if (_.isFunction(easing)) {
                if (callback) {
                    this.props.easing = 'function';
                } else {
                    callback = easing;
                    easing = this.props.easing;
                }
            }

            if ( ! easing) {
                easing = this.props.easing;
            }

            if (scenes) {
                var frame, scene, index, attr, type, key;

                this.frames = _.map(_.keys(scenes), _.toNumber);
                this.frames.sort(function(a, b){ return a - b });

                var size = this.frames.length,
                    maxs = size - 1,
                    last = this.frames[maxs],
                    ease = _.isString(easing) ? Animation.easing[easing] : easing;

                var prev;

                for (key in scenes) {
                    frame = _.toNumber(key);
                    index = _.findIndex(this.frames, function(f){
                        return f == frame;
                    });

                    scene = {
                        frame: frame,
                        valid: false,
                        attrs: {},
                        from: {},
                        to: {},
                        delta: {},
                        easing: ease,
                        callback: callback
                    };

                    for (attr in scenes[key]) {
                        type = Animation.animable[attr];
                        if (type) {

                            scene.valid = true;
                            scene.from[attr] = vector.attrs[attr];
                            scene.to[attr] = scenes[key][attr];
                            scene.delta[attr] = null;

                            switch(type) {
                                case 'number':
                                    scene.delta[attr] = (scene.to[attr] - scene.from[attr]) / duration;
                                    break;
                            }
                        }
                    }

                    scene.duration = duration / last * (frame - (this.frames[index - 1] || 0));
                    this.scenes[frame] = scene;
                }
            }

            vector = null;
        },

        guid: function() {
            return this.props.guid;
        },

        duration: function() {
            return this.props.duration;
        },

        easing: function() {
            return this.props.easing;
        },

        delay: function(delay) {
            if (delay === undefined) {
                return this.props.delay;
            }

            var anim = new Animation(this.scenes, this.props.duration);
            
            anim.props.repeat = this.props.repeat;
            anim.props.delay = delay || 0;
            
            return anim;
        },

        repeat: function(times) {

            if (times === undefined) {
                return this.props.repeat;
            }

            var anim = new Animation(this.scenes, this.props.duration);
            anim.props.delay = this.props.delay;
            anim.props.repeat = Math.floor(Math.max(times, 0)) || 1;
            return anim;
        },

        count: function() {
            return this.frames.length;
        },

        frame: function(index) {
            return this.frames[index];
        },

        scene: function(index) {
            var frame = this.frames[index];
            return frame ? this.scenes[frame] : null;
        }

    });

    ///////// STATICS /////////

    _.extend(Animation, {
        guid: 0,

        animable: {
            x:  'number',
            y:  'number',
            cx: 'number',
            cy: 'number'
        },

        easing: {
            linier: function(n) {
                return n;
            },

            easeIn: function(n) {
                return Math.pow(n, 1.7);
            },

            easeOut: function(n) {
                return Math.pow(n, .48);
            },

            easeInOut: function(n) {
                var q = .48 - n / 1.04,
                    Q = Math.sqrt(.1734 + q * q),
                    x = Q - q,
                    X = Math.pow(Math.abs(x), 1 / 3) * (x < 0 ? -1 : 1),
                    y = -Q - q,
                    Y = Math.pow(Math.abs(y), 1 / 3) * (y < 0 ? -1 : 1),
                    t = X + Y + .5;
                return (1 - t) * 3 * t * t + t * t * t;
            },

            backIn: function(n) {
                var s = 1.70158;
                return n * n * ((s + 1) * n - s);
            },

            backOut: function (n) {
                n = n - 1;
                var s = 1.70158;
                return n * n * ((s + 1) * n + s) + 1;
            },

            elastic: function (n) {
                if (n == !!n) {
                    return n;
                }
                return pow(2, -10 * n) * math.sin((n - .075) * (2 * PI) / .3) + 1;
            },

            bounce: function (n) {
                var s = 7.5625,
                    p = 2.75,
                    l;
                if (n < (1 / p)) {
                    l = s * n * n;
                } else {
                    if (n < (2 / p)) {
                        n -= (1.5 / p);
                        l = s * n * n + .75;
                    } else {
                        if (n < (2.5 / p)) {
                            n -= (2.25 / p);
                            l = s * n * n + .9375;
                        } else {
                            n -= (2.625 / p);
                            l = s * n * n + .984375;
                        }
                    }
                }
                return l;
            }
        }
    });

}());