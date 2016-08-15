
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

/**
 * Inheritance
 */
(function(_){
    
    this.EF = this.EF || {};

    EF.Class = function(){};
    EF.Class.initalizing = false;
    EF.Class.decomposible = /xyz/.test(function(){ xyz; }) ? /\binherited\b/ : /.*/;

    EF.Class.extend = function(config){
        var inherited, prototype, name;
        
        inherited = this.prototype;
        EF.Class.initalizing = true;
        prototype = new this();
        EF.Class.initalizing = false;

        for (name in config) {
            prototype[name] = _.isFunction(config[name]) && _.isFunction(inherited[name]) && tester.test(config[name])
                ? (function(name, fn){
                    return function() {
                        var tmp, ret;
                        tmp = this.inherited;
                        this.inherited = inherited[name];
                        ret = fn.apply(this, _.toArray(arguments));
                        this.inherited = tmp;
                        return ret;
                    };
                }(name, config[name])) : config[name];
        }

        function Class() {
            if ( ! EF.Class.initializing && this.init) {
                this.init.apply(this, _.toArray(arguments));
            }
        }

        Class.prototype = prototype;
        Class.prototype.constructor = Class;
        Class.extend = arguments.callee;

        return Class;
    };

}(_));