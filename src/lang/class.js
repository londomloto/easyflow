
(function(){
    
    var initializing = false;
    var tokenizer = /xyz/.test(function(){ xyz; }) ? /\$super/ : /.*/;
    var Class = Graph.lang.Class = function() {};

    Class.extend = function extend(config) {
        var $super, proto, name, value, defs;
        
        $super = this.prototype;
        
        initializing = true;
        proto = new this();
        initializing = false;

        defs = {};

        for (var name in config) {
            value = config[name];
            proto[name] = 
                _.isFunction(value) && 
                _.isFunction($super[name]) && 
                tokenizer.test(value)
                    ? (function(name, fn){
                        return function() {
                            var tmp, ret;
                            tmp = this.$super;
                            this.$super = $super[name];
                            ret = fn.apply(this, _.toArray(arguments));
                            this.$super = tmp;
                        
                            return ret;
                        };
                    }(name, value)) : value;

            if ( ! _.isFunction(value)) {
                defs[name] = _.cloneDeep(value);
            }
        }

        var clazz, ctor;

        if ( ! _.isUndefined(proto.constructor)) {
            ctor = proto.constructor;
            delete proto.constructor;
        }

        clazz = function() {
            if ( ! initializing) {
                var defs = this.constructor.defs, name;
                
                this.listeners = {};

                // reset defaults
                for (name in defs) {
                    this[name] = _.cloneDeep(defs[name]);
                }

                ctor && ctor.apply(this, _.toArray(arguments));
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
                return this;
            }
            
            this.listeners[name] = this.listeners[name] || [];

            data = {
                orig: handler,
                func: _.bind(handler, this)
            };

            this.listeners[name].push(data);
            return this;
        };

        /**
         * Unregister event handler
         */
        clazz.prototype.off = function(name, handler) {
            var lsnr = this.listeners[name] || [];

            if (lsnr.length) {
                if (handler) {
                    var data = _.find(lsnr, function(d){ return d.orig === handler; });
                    data && _.pull(this.listeners[name], data);
                } else {
                    this.listeners[name] = [];
                }
            }

            return this;
        };

        /**
         * Execute event handler
         */
        clazz.prototype.fire = function(/* name, param1, param2, ...paramN */) {
            var args = _.toArray(arguments),
                name = args.shift(),
                lsnr = this.listeners[name] || [];

            if (lsnr.length) {
                _.forEach(lsnr, function(data){
                    (function(data){
                        data.func();
                    }(data));
                });
            }
        };

        return clazz;
    };

}());