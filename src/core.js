
/**
 * Javascript polyfill
 */
(function(_){
    if ( ! String.format) {
        String.format = function(format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match;
            });
        };
    }
}(_));

(function(_, $){
    var global = this;

    global.EF = global.EF || function(selector, context) {
        var vectors = [];

        $(selector, context).each(function(i, node){
            vectors.push(new EF.Vector(node));
        });

        return new EF.Collection(vectors);
    };

    EF.global = global;

    _.extend(EF, {
        ns: function(namespace) {
            var parts = _.split(namespace, '.');
            var parent = EF.global;
            var len = parts.length;
            var current;
            var i;

            for (i = 0; i < len; i++) {
                current = parts[i];
                parent[current] = parent[current] || {};
                parent = parent[current];
            }

            return parent;
        }
    });

    EF.ns('EF.lang');
    EF.ns('EF.shape');
    EF.ns('EF.vector');

}(_, jQuery));

/**
 * Abstract base class
 */
EF.Class = (function(_){
    var initializing = false;
    var tokenizer = /xyz/.test(function(){ xyz; }) ? /\$super/ : /.*/;
    var Class = function(){};
    
    Class.extend = function extend( config ) {
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

        if (prototype.constructor !== undefined) {
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

    return Class;
}(_));