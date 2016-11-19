
(function(){

    angular
        .module('core')
        .directive('googleLogin', googleLoginDirective)
        .directive('facebookLogin', facebookLoginDirective)
        .directive('repeatDone', repeatDoneDirective)
        .directive('uiTitle', uiTitleDirective)
        .directive('uiVideo', uiVideoDirective)
        .directive('uiFile', uiFileDirective)
        .directive('uiModal', uiModalDirective)
        .directive('uiDialog', uiDialogDirective);

    /** @ngInject */
    function uiTitleDirective($rootScope, site) {
        var directive = {
            restrict: 'A',
            link: link
        };
        
        return directive;

        function link(scope, element) {
            $rootScope.$on('$stateChangeSuccess', _.debounce(function(evt, state){
                var title =  site.getTitle();
                
                if (state.title) {
                    title = title + ' - ' + state.title;
                }

                element.text(title);
            }, 0));
        }
    }

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
    function uiModalDirective(theme) {
        var directive = {
            link: link,
            restrict: 'A',
            controller: Controller,
            controllerAs: 'vm'
        };

        return directive;

        function Controller() {
            var vm = this;

            vm.name = null;
            vm.modal = null;

            vm.register = function() {
                theme.registerModal(vm);
            };

            vm.show = function() {
                if (vm.modal) {
                    vm.modal.show();
                }
            };

            vm.hide = function() {
                if (vm.modal) {
                    vm.modal.hide();
                }
            };
        }

        function link(scope, element, attrs, ctrl) {
            ctrl.name  = attrs.uiModal;
            ctrl.modal = $(element).modal('hide').data('bs.modal');
            ctrl.register();
        }
    }

    /** @ngInject */
    function uiDialogDirective(theme) {
        var directive = {
            link: link,
            restrict: 'A',
            controller: Controller,
            controllerAs: 'vm'
        };

        return directive;

        /** @ngInject */
        function Controller($scope) {
            var vm = this;

            vm.name = null;
            vm.modal = null;
            vm.action = null;
            vm.callback = null;

            vm.register = function() {
                theme.registerModal(vm);
            };

            vm.show = function(title, message, callback) {
                $scope.title = title;
                $scope.message = message;

                vm.callback = callback;

                if (vm.modal) {
                    vm.modal.show();
                }
            };

            vm.hide = function(action) {
                vm.action = action;
            };

            vm.onHide = function() {
                if (vm.callback) {
                    vm.callback(vm.action);
                }
            };

            $scope.hide = function() {
                if (vm.modal) {
                    vm.modal.hide();
                }
            };
        }

        function link(scope, element, attrs, ctrl) {
            ctrl.name = attrs.uiDialog;
            ctrl.modal = element.modal('hide').data('bs.modal');
            ctrl.register();

            element.on('hidden.bs.modal', function(){
                ctrl.onHide();
            });
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