
(function(){

    angular
        .module('app')
        .directive('uiTitle', uiTitleDirective)
        .directive('uiFile', uiFileDirective)
        .directive('dialog', dialogDirective)
        .directive('uiLightbox', uiLightboxDirective)
        .directive('uiModal', uiModalDirective)
        .directive('uiConfirm', uiConfirmDirective);

    /** @ngInject */
    function uiTitleDirective($rootScope) {
        var directive = {
            restrict: 'A',
            link: link
        };
        
        return directive;

        function link(scope, element) {
            $rootScope.$on('$stateChangeSuccess', _.debounce(function(evt, state){
                var title = 'Easyflow';

                if ($rootScope.site && $rootScope.site.title) {
                    title = $rootScope.site.title;
                }

                if (state.title) {
                    title = title + ' - ' + state.title;
                }

                element.text(title);
            }, 0));
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
    function uiConfirmDirective(theme) {
        var directive = {
            link: link,
            restrict: 'A',
            templateUrl: '/public/apps/frontend/templates/confirm.html',
            scope: {
                name: '@uiConfirm',
                title: '@',
                message: '@'
            },
            controller: Controller,
            controllerAs: 'vm'
        };

        return directive;

        /** @ngInject */
        function Controller($scope) {
            var vm = this;

            vm.name = null;
            vm.modal = null;
            vm.action = false;
            vm.callback = null;

            vm.register = function() {
                theme.registerModal(vm);
            };

            vm.show = function(options) {
                options = options || {};
                vm.callback = options.callback;

                if (vm.modal) {
                    vm.modal.show();
                }
            };

            vm.onHide = function() {
                if (vm.callback) {
                    vm.callback(vm.action);
                }
            };

            $scope.hide = function(action) {
                vm.action = action == 'yes' ? true : false;
                if (vm.modal) {
                    vm.modal.hide();
                }
            };
        }

        function link(scope, element, attrs, ctrl) {
            var target = $(element).children();

            ctrl.name = scope.name;
            ctrl.modal = target.modal('hide').data('bs.modal');
            ctrl.register();

            target.on('hidden.bs.modal', function(e){
                ctrl.onHide();
            });
        }
    }

    function dialogDirective() {
        var directive = {
            restrict: 'A',
            link: link,
            controller: DialogController
        };

        return directive;

        function link(scope, element, attrs, ctrl) {
            scope.$watch('dialog.state', function(state){
                if (state == 'opened') {
                    element.modal('show');
                } else {
                    element.modal('hide');
                }
            });
        }

        /** @ngInject */
        function DialogController($scope, theme) {
            $scope.dialog = {
                state: 'closed',
                title: 'Dialog',
                message: '',
                onclose: null,
                onopen: null
            };

            $scope.dialog.open = function(title, message, onclose) {
                _.assign($scope.dialog, {
                    state: 'opened',
                    title: title,
                    message: message,
                    onclose: onclose
                });
            };

            $scope.dialog.close = function(button) {
                $scope.dialog.state = 'closed';
                if ($scope.dialog.onclose) {
                    $scope.dialog.onclose(button);
                }
            };  

            // hook dialog to theme
            theme.dialog = $scope.dialog;
        }
        
    }

    /** @ngInject */
    function uiFileDirective($parse) {
        var directive = {
            link: link
        };

        return directive;

        function link(scope, element, attrs) {
            var model = $parse(attrs.uiFile);

            element.on('change', function(){
                scope.$apply(function(){
                    model.assign(scope, element[0].files[0]);
                });
            });
        }
    }

    /** @ngInject */
    function uiLightboxDirective() {
        var directive = {
            restrict: 'A',
            link: link,
            scope: {
                selector: '@uiLightbox',
                trigger: '<'
            }
        };

        return directive;

        function link(scope, element, attrs) {
            var gallery;

            if (scope.trigger !== undefined) {
                scope.$watch('trigger', function() {
                    gallery = element.find(scope.selector);
                    if (gallery.length) {
                        gallery.simpleLightbox({
                            fileExt: false,
                            history: false
                        });
                    }
                });
            } else {
                gallery = element.find(scope.selector);
                if(gallery.length) {
                    gallery.simpleLightbox({
                        fileExt: false,
                        history: false
                    });
                }
            }

        }
    }

}());