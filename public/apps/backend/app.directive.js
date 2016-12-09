
(function(){

    angular
        .module('app')
        .directive('uiDate', uiDate);

    /** @ngInject */
    function uiDate($window, $parse) {
        var directive = {
            link: link,
            require:'^ngModel',
            restrict: 'A'
        };

        return directive;

        function link(scope, element, attrs, ctrl) {
            var mom = $window.moment,
                format = attrs.format || 'DD MMMM YYYY HH:mm:ss',
                hasTime = true,
                keepTime = null;

            if ( ! /hh?:mm?/i.test(format)) {
                hasTime = false;
            }

            ctrl.$formatters.unshift(function(value){
                if (value && ! hasTime && ! keepTime) {
                    var time = mom(value).format('HH:mm:ss');
                    keepTime = time || '00:00:00';
                }

                return mom(value).format(format);
            });

            ctrl.$parsers.unshift(function(value){
                var date = mom(value, format),
                    valid = date && date.isValid();
                
                ctrl.$setValidity('datetime', valid);

                if (valid) {
                    if (keepTime) {
                        return date.format('YYYY-MM-DD') + ' ' + keepTime;
                    } else {
                        return date.format('YYYY-MM-DD HH:mm:ss');
                    }
                } else {
                    return '';
                }
            });

            element.datetimepicker({
                format: format,
                showTodayButton: true,
                icons: {
                    next: 'ion-chevron-right',
                    previous: 'ion-chevron-left',
                    up: 'ion-chevron-up',
                    down: 'ion-chevron-down',
                    today: 'ion-android-calendar icon-sm',
                    time: 'ion-android-time',
                    date: 'ion-calendar'
                }
            });

            element.on('dp.change', function(e){
                ctrl.$setViewValue(e.date);
            });
        }
    }

}());