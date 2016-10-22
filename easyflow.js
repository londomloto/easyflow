
(function($){
    var Easyflow, EF;

    EF = Easyflow = function(element, options) {
        this.element = $(element);
        this.init(options);
    };

    EF.defaults = {
        
    };

    $.extend(EF.prototype, {
        init: function(options) {
            this.options = $.extend(true, {}, EF.defaults, options || {});
            this.initComponent();
        },
        initComponent: function() {
            // render zoom tool
        },
        initEvents: function() {
            
        }
    });

    $.fn.easyflow = function(options) {
        var args = $.makeArray(arguments),
            init = $.type(args[0]) != 'string';

        var func, list;

        list = this.each(function(){
            var obj = $.data(this, 'easyflow');

            if ( ! obj) {
                options = options || {};
                $.data(this, 'easyflow', (obj = new EF(this, options)));
            }

            if ( ! init) {
                var met = args.shift();
                if (obj[met]) {
                    func = obj[met].apply(obj, args);
                }
            }
        });

        return init ? list : func;
    };

}(jQuery));