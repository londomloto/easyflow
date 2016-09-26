
(function($){
    var Easyflow, EF;

    EF = Easyflow = function(element, options) {
        this.element = $(element);
        this.init(options);
    };

    EF.defaults = {
        onScroll: $.noop
    };

    $.extend(EF.prototype, {
        init: function(options) {
            this.options = $.extend(true, {}, EF.defaults, options || {});
            this.element.addClass('easyflow');
            this.initEvents();
        },
        initEvents: function() {
            var me = this;

            // scroll event
            var x0 = me.element.scrollLeft(),
                y0 = me.element.scrollTop(),
                x1 = x0,
                y1 = y0;

            me.element.on('scroll', function(e){
                var x2 = me.element.scrollLeft(),
                    y2 = me.element.scrollTop(),
                    dx = x2 - x1,
                    dy = y2 - y1,
                    args = {
                        origX: x0,
                        origY: y0,
                        lastX: x1,
                        lastY: y1,
                        currX: x2,
                        currY: y2
                    };

                if (y2 === y1) {
                    if (x2 > x1) {
                        args.dir = 'right';
                    } else {
                        args.dir = 'left';
                    }
                } else {
                    if (y2 > y1) {
                        args.dir = 'bottom';
                    } else {
                        args.dir = 'top';
                    }
                }

                x1 = x2;
                y1 = y2;

                me.options.onScroll(args);
                
            });
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