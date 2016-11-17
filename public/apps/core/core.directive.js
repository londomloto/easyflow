
(function(){

    angular
        .module('core')
        .directive('googleLogin', googleLoginDirective)
        .directive('facebookLogin', facebookLoginDirective)
        .directive('repeatDone', repeatDoneDirective)
        .directive('uiVideo', uiVideoDirective)
        .directive('uiFile', uiFileDirective);

    /** @ngInject */
    function uiFileDirective($parse) {
        var directive = {
            link: link
        };

        return directive;

        function link(scope, element, attrs) {
            var model = $parse(attrs.uiFile),
                callback = attrs.onSelect ? $parse(attrs.onSelect)(scope) : null;

            element.on('change', function(){
                scope.$apply(function(){
                    if (callback) {
                        // parse filename
                        var path = element[0].value,
                            name = path.split(/(\\|\/)/g).pop();

                        callback(name);
                    }

                    model.assign(scope, element[0].files[0]);
                });
            });
        }
    }

    /** @ngInject */
    function uiVideoDirective($timeout) {
        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                source: '@',
                poster: '@',
                type: '@'
            }
        };

        return directive;

        function link(scope, element, attrs) {
            if (scope.source) {
                element.append(
                    '<source src="' + scope.source + '" type="' + scope.type + '"></source>'
                );
                videojs(element[0], {controls: true, preload: 'none'});    
            }
        }
    }

    /** @ngInject */
    function repeatDoneDirective($timeout, $parse) {
        var directive = {
            link: link,
            restrict: 'A'
        };

        return directive;

        function link(scope, element, attrs) {
            if (scope.$last === true) {
                $timeout(function(){
                    $parse(attrs.repeatDone)(scope);
                });
            }
        }
    }

    /** @ngInject */
    function googleLoginDirective(googleApi) {
        var directive = {
            restrict: 'A',
            link: link,
            scope: {
                callback: '&'
            }
        };

        return directive;

        function link(scope, element, attrs) {
            googleApi.load().then(function(){
                googleApi.auth(element[0]).then(function(profile){
                    scope.callback()(profile);
                });
            });
        }
    }

    function facebookLoginDirective(facebookApi) {
        var directive = {
            restrict: 'A',
            link: link,
            scope: {
                callback: '&'
            }
        };

        return directive;

        function link(scope, element, attrs) {
            facebookApi.load().then(function(){
                facebookApi.auth(element[0]).then(function(profile){
                    scope.callback()(profile);
                });
            });
        }
    }

}());