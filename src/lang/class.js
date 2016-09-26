
(function(){
    
    var initializing = false;
    var tokenizer = /xyz/.test(function(){ xyz; }) ? /\$super/ : /.*/;
    var Class = Graph.lang.Class = function() {};
    
    Class.extend = function extend(config) {
        var $super, proto, name, value, defs;
        
        $super = this.prototype;
        defs = {};
        
        initializing = true;
        proto = new this();
        initializing = false;
        

        for (var name in config) {
            value = config[name];
            if ( ! _.isFunction(value)) {
                proto[name] = defs[name] = value;
            } else {
                proto[name] = _.isFunction($super[name]) && tokenizer.test(value)
                    ? (function(name, value){
                        return function() {
                            var tmp, ret;
                            tmp = this.$super;
                            this.$super = $super[name];
                            ret = value.apply(this, _.toArray(arguments));
                            this.$super = tmp;
                        
                            return ret;
                        };
                    }(name, value)) : value;
            }
        }

        var clazz, init;

        if ( ! _.isUndefined(proto.constructor)) {
            init = proto.constructor;
            delete proto.constructor;
        }

        clazz = function () {
            var me = this,
                ct = me.constructor;
            
            me.listeners = {};

            if (me.superclass.defs) {
                _.forOwn(me.superclass.defs, function(v, k){
                    me[k] = _.cloneDeep(v);
                });
            }

            _.forOwn(ct.defs, function(v, k){
                me[k] = _.cloneDeep(v);
            });
            
            if ( ! initializing) {
                init && init.apply(me, _.toArray(arguments));
            }
        }

        // statics
        clazz.extend = extend;
        clazz.defs = defs;
        clazz.version = '1.0.0';
        clazz.author = 'londomloto';

        // instance
        clazz.prototype = proto;
        clazz.prototype.constructor = clazz;
        clazz.prototype.superclass = $super.constructor;

        /**
         * Register event handler
         */
        clazz.prototype.on = function(name, handler) {
            var me = this, data;

            if (_.isPlainObject(name)) {
                _.forOwn(name, function(v, k){
                    me.on(k, v);
                });
                return me;
            }

            var part = _.split(name, '.'),
                fire = part.shift();

            me.listeners[fire] = me.listeners[fire] || [];
            
            data = {
                name: name,
                orig: handler,
                func: _.bind(handler, this)
            };

            me.listeners[fire].push(data);
            return this;
        };

        /**
         * Unregister event handler
         */
        clazz.prototype.off = function(name, handler) {
            var part, fire, lsnr, rgex;

            part = _.split(name, '.');
            rgex = new RegExp(_.escapeRegExp(name), 'gi');
            fire = part.shift();
            lsnr = fire ? (this.listeners[fire] || []) : [];

            if (lsnr.length) {
                for (var i = lsnr.length - 1; i >= 0; i--) {
                    if (handler) {
                        if (rgex.test(lsnr[i].name) && lsnr[i].orig === handler) {
                            this.listeners[fire].splice(i, 1);
                        }
                    } else {
                        if (rgex.test(lsnr[i].name)) {
                            this.listeners[fire].splice(i, 1);
                        }
                    }
                }
            } else {
                var me = this;
                for (fire in me.listeners) {
                    (function(lsnr){
                        for (var i = lsnr.length - 1; i >= 0; i--) {
                            if (handler) {
                                if (rgex.test(lsnr[i].name) && lsnr[i].orig === handler) {
                                    lsnr.splice(i, 1);
                                }
                            } else {
                                if (rgex.test(lsnr[i].name)) {
                                    lsnr.splice(i, 1);
                                }
                            }
                        }
                    }(me.listeners[fire]))
                }
            }

            rgex = null;
            return this;
        };

        /**
         * Execute event handler
         */
        clazz.prototype.fire = function(/* name, param1, param2, ...paramN */) {
            var args = _.toArray(arguments),
                name = args.shift(),
                part = _.split(name, '.'),
                fire = part.shift(),
                lsnr = this.listeners[fire] || [],
                rgex = new RegExp(_.escapeRegExp(name), 'gi');
            
            if (lsnr.length) {
                _.forEach(lsnr, function(data){
                    if (fire != name) {
                        if (rgex.test(data.name)){
                            data.func.apply(data.func, args);    
                        }
                    } else {
                        data.func.apply(data.func, args);
                    }
                });
            }

            rgex = null;
        };

        /**
         * Get default properties (attached on class)
         */
        clazz.prototype.defprop = function(prop) {
            var defs = this.constructor.defs || {};
            return defs[prop];
        };

        return clazz;
    };

}());