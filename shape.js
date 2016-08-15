
/**
 * Polyfill
 *
 * @author  londomloto <roso@kct.co.id>
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
 * Easyflow core
 *
 * @author londomloto <roso@kct.co.id>
 */
(function(_, $){

    var Class = function() {};

    /**
     * Inheritance
     */
    (function(){
        var initializing = false;
        var tester = /xyz/.test(function() { xyz; }) ? /\binherited\b/ : /.*/;

        Class.extend = function(prop) {
            var inherited, proto, name;
            
            inherited = this.prototype;
            initializing = true;
            proto = new this();
            initializing = false;

            for (name in prop) {
                proto[name] = _.isFunction(prop[name]) && _.isFunction(inherited[name]) && tester.test(prop[name])
                    ? (function(name, fn){
                        return function() {
                            var tmp, ret;
                            tmp = this.inherited;
                            this.inherited = inherited[name];
                            ret = fn.apply(this, _.toArray(arguments));
                            this.inherited = tmp;
                            return ret;
                        };
                    }(name, prop[name])) : prop[name];
            }

            function F() {
                if ( ! initializing && this.init) {
                    this.init.apply(this, _.toArray(arguments));
                }
            }

            F.prototype = proto;
            F.prototype.constructor = F;
            F.extend = arguments.callee;

            return F;
        };
    }());

    var Vector = function(){};
    
    /**
     * Base shape
     */
    var Shape = Class.extend({
        template: '<g class="e-shape"></g>',
        render: function() {
            
        }
    });

    /**
     * Swimlane shape
     */
    var Swimlane = Shape.extend({
        
    });

    /**
     * Control flow shape
     */
    var Flow = Shape.extend({
        
    });

    /**
     * Action shape
     */
    var Action = Shape.extend({
        init: function() {
            this.vector = $('<g>');
        }
    });

    /**
     * Base terminal shape
     */
    var Terminal = Shape.extend({

    });

    /**
     * Initial state shape
     */
    var Initial = Terminal.extend({

    });

    /**
     * Final state shape
     */
    var Final = Terminal.extend({

    });
    
    var a = new Action();
    a.render('svg');
    console.log(a);

}(_, jQuery));