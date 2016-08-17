
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

    this.EF = this.EF || function(selector, context) {
        var vectors = [];

        $(selector, context).each(function(i, node){
            vectors.push(new EF.Vector(node));
        });

        return new EF.Collection(vectors);
    };

}(_, $));

// var EF = EF || {};
// var EF = EF || function(){};

EF.Class = (function(_){
    var initializing = false;
    var decomp = /xyz/.test(function(){ xyz; }) ? /\$super/ : /.*/;
    var Class = function(){};
    
    Class.extend = function extend(config) {
        var $super, prototype, name;
        
        $super = this.prototype;
        
        initializing = true;
        prototype = new this();
        initializing = false;

        for (name in config) {
            prototype[name] = _.isFunction(config[name]) && _.isFunction($super[name]) && decomp.test(config[name])
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

        var clazz, autorun;

        if (prototype.constructor !== undefined) {
            autorun = prototype.constructor;
            delete prototype.constructor;
        }

        clazz = function() {
            if ( ! initializing && autorun) {
                console.log(arguments);
                autorun.apply(this, _.toArray(arguments));
            }
        }

        clazz.prototype = prototype;
        clazz.prototype.constructor = clazz;
        clazz.extend = extend;

        return clazz;
    };

    return Class;
}(_));
