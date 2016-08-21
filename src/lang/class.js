
(function(){
    
    var initializing = false;
    var tokenizer = /xyz/.test(function(){ xyz; }) ? /\$super/ : /.*/;
    var Class = Graph.lang.Class = function() {};

    Class.extend = function extend(config) {
        var $super, prototype, name;
        
        $super = this.prototype;
        
        initializing = true;
        prototype = new this();
        initializing = false;

        for (name in config) {
            prototype[name] = _.isFunction(config[name]) && _.isFunction($super[name]) && tokenizer.test(config[name])
                ? (function(name, fn){
                    return function() {
                        var tmp, ret;

                        tmp = this.$super;
                        this.$super = $super[name];
                        ret = fn.apply(this, _.toArray(arguments));
                        this.$super = tmp;
                        
                        return ret;
                    };
                }(name, config[name])) : config[name];
        }

        var clazz, ctor;

        if ( ! _.isUndefined(prototype.constructor)) {
            ctor = prototype.constructor;
            delete prototype.constructor;
        }

        clazz = function() {
            if ( ! initializing && ctor) {
                ctor.apply(this, _.toArray(arguments));
            }
        }

        clazz.prototype = prototype;
        clazz.prototype.constructor = clazz;
        clazz.prototype.superclass = $super.constructor;

        clazz.extend = extend;

        return clazz;
    };

}());