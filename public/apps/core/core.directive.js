
(function(){

    angular
        .module('core')
        .directive('googleLogin', googleLogin)
        .directive('facebookLogin', facebookLogin)
        .directive('repeatDone', repeatDone)
        .directive('uiMatch', uiMatch)
        .directive('uiTemplate', uiTemplate)
        .directive('uiTitle', uiTitle)
        .directive('uiVideo', uiVideo)
        .directive('uiFile', uiFile)
        .directive('uiImage', uiImage)
        .directive('uiModal', uiModal)
        .directive('uiDialog', uiDialog)
        .directive('uiLightbox', uiLightbox)
        .directive('uiPagination', uiPagination)
        .directive('uiNocontext', uiNocontext)
        .directive('uiMarkdown', uiMarkdown);

    /** @ngInject */
    function uiTemplate($templateRequest, $compile, $timeout, loader, router, api, HTTP) {
        var directive = {
            link: link,
            scope: true
        };

        return directive;

        function link(scope, element, attrs) {
            var remote = attrs.remote ? attrs.remote : 'false';
            var path, name;

            // set element to hide
            var displayMode = element.css('display');
            
            if (remote == 'true') {
                name = attrs.uiTemplate;
                path = api.getBaseUrl() + '/theme/template/' + name;

                api.get('/theme/template/' + name).then(function(response){
                    if (response.data.success) {
                        var template = angular.element(response.data.data);

                        element.append(template);
                        $compile(template)(scope);

                        show();
                    } else {
                        if (response.data.status == HTTP.STATUS_UNAUTHORIZED) {
                            router.go(router.getLoginState());
                        }
                    }
                });
            } else {
                path = loader.getBase() + '/templates/' + attrs.uiTemplate;

                $templateRequest(path).then(function(html){
                    var template = angular.element(html);
                    element.append(template);
                    $compile(template)(scope);

                    show();
                });
            }

            hide();

            function hide() {
                element.css('display', 'none');
            }

            function show() {
                $timeout(function(){
                    element.css('display', displayMode);
                }, 1);
            }
        }
    }

    /** @ngInject */
    function uiTitle($rootScope, debounce, site) {
        var directive = {
            restrict: 'A',
            link: link
        };
        
        return directive;

        function link(scope, element) {
            $rootScope.$on('$stateChangeSuccess', debounce(function(evt, state){
                var title =  site.getTitle();
                
                if (state.title) {
                    title = title + ' - ' + state.title;
                }

                element.text(title);
            }, 0));
        }
    }

    /** @ngInject */
    function uiMatch($parse) {
        var directive = {
            link: link,
            require: '?ngModel',
            restrict: 'A'
        };

        return directive;

        function link(scope, element, attrs, ctrl) {
            if ( ! ctrl || ! attrs.uiMatch) {
                return;
            }

            var matchGetter = $parse(attrs.uiMatch);
            
            scope.$watch(getTargetValue, function(){
                ctrl.$$parseAndValidate();
            });

            ctrl.$validators.match = function(modelValue, viewValue) {
                var source = modelValue || viewValue;
                var target = getTargetValue();
                var result;
                
                if ( ! source) {
                    if (target) {
                        return false;
                    }
                    return true;
                }

                result = source === target;
                return result;
            };

            function getTargetValue() {
                var value = matchGetter(scope);
                if (angular.isObject(value) && value.hasOwnProperty('$viewValue')) {
                    value = value.$viewValue;
                }
                return value;
            }
        }
    }

    /** @ngInject */
    function uiFile($parse) {
        var directive = {
            link: link
        };

        return directive;

        function link(scope, element, attrs) {
            var model = $parse(attrs.uiFile),
                callback = attrs.onSelect ? $parse(attrs.onSelect)(scope) : null;

            element.on('change', function(){
                var file = element[0].files[0],
                    name = element[0].value;

                if (callback) {
                    name = name.split(/(\\|\/)/g).pop();

                    var reader = new FileReader();

                    reader.onload = function() {
                        var data = reader.result
                        reader = null;
                        callback(name, data);
                        scope.$apply();
                    };

                    reader.readAsDataURL(file);
                }
                
                model.assign(scope, file);
                scope.$apply();
            });
        }
    }

    /** @ngInject */
    function uiImage($window, $parse) {
        var directive = {
            link: link,
            restrict: 'A'
        };

        var supportReader = $window.FileReader;

        return directive;

        function link(scope, element, attrs) {
            var key = attrs.uiImage;

            scope.$watch(key, function(file){
                if (file && supportReader) {
                    var reader = new $window.FileReader();
                    reader.onload = function(e) {
                        var data = e.target.result;
                        element.attr('src', data);
                        reader = null;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    /** @ngInject */
    function uiVideo($timeout) {
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
    function repeatDone($timeout, $parse) {
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
    function uiModal(theme) {
        var directive = {
            link: link,
            restrict: 'A',
            scope: true
        };

        return directive;

        function link(scope, element, attrs) {
            var instance = element.modal('hide').data('bs.modal'),
                name = attrs.uiModal;

            scope.show = function() {
                instance.show();
            };

            scope.hide = function() {
                instance.hide();
            };

            theme.registerModal(name, scope);

            element.on('show.bs.modal', function(e){
                theme.fireModal(name, 'show');
            });

            element.on('hide.bs.modal', function(e){
                theme.fireModal(name, 'hide');
            });
        }
    }

    /** @ngInject */
    function uiDialog(theme) {
        var directive = {
            link: link,
            restrict: 'A',
            scope: true
        };

        return directive;

        function link(scope, element, attrs, ctrl) {
            var instance = element.modal('hide').data('bs.modal'),
                name = attrs.uiDialog;

            var callback, action;

            scope.show = function(title, message, callback) {
                scope.title = title;
                scope.message = message;
                callback = callback;

                instance.show();
            };

            scope.hide = function(action) {
                action = action;
                instance.hide();
            };

            element.on('hide.bs.modal', function(){
                if (callback) {
                    callback(action);
                }
            });

            theme.registerModal(name, scope);
        }
    }

    /** @ngInject */
    function googleLogin(googleApi) {
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

    function facebookLogin(facebookApi) {
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

    /** @ngInject */
    function uiLightbox() {
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

    /** @ngInject */
    function uiPagination($parse, $templateRequest, $compile, $timeout, loader) {
        var directive = {
            link: link,
            scope: true,
            restrict: 'A'
        };

        return directive;

        function link(scope, element, attrs) {
            var store = $parse(attrs.store)(scope);
            store.on('load', onStoreLoad);

            scope.pages = [];
            scope.page = store.getPage();
            scope.loadPage = loadPage;

            loadTemplate();

            function onStoreLoad() {
                $timeout(function(){
                    render();    
                });
            }

            function getPagingInfo() {
                var total = store.getTotal();

                return {
                    total: total,
                    page: store.getPage(),
                    pages: Math.ceil(total / store.getPageSize())
                };
            }

            function loadTemplate() {
                if (attrs.template) {
                    var path = loader.getBase() + '/templates/' + attrs.template;
                    
                    $templateRequest(path).then(function(html){
                        var template = angular.element(html);
                        element.append(template);
                        $compile(template)(scope);
                    });
                }
            }

            function loadPage(page) {
                store.loadPage(page);
            }

            function render() {
                var display = attrs.display !== undefined ? +attrs.display : 5,
                    paging = getPagingInfo(),
                    pages = [];

                var pageStart;

                //if (paging.pages > 1) {
                    pageStart = paging.page;

                    if (paging.page < display) {
                        pageStart = 1;
                    } else if (paging.page >= (paging.pages - Math.floor(display / 2))) {
                        pageStart = paging.pages - display + 1;
                    } else if (paging.page >= display) {
                        pageStart = paging.page - Math.floor(display / 2);
                    }

                    pages.push({
                        type: 'first',
                        icon: 'ion-chevron-left',
                        text: '',
                        page: 1
                    });

                    for (var i = pageStart, ii = (pageStart + display - 1); i <= ii; i++ ) {
                        if (i > paging.pages) continue;

                        pages.push({
                            type: 'page',
                            icon: '',
                            text: i,
                            page: i
                        });
                    }

                    pages.push({
                        type: 'last',
                        icon: 'ion-chevron-right',
                        text: '',
                        page: paging.pages
                    });

                //}   

                scope.pages = pages;
                scope.page = paging.page;
            }
        }
    }

    /** @ngInject */
    function uiNocontext($parse) {
        var directive = {
            link: link,
            restrict: 'A'
        };

        return directive;

        function link(scope, element, attrs) {
            var expr = attrs.uiNocontext;

            element.on('contextmenu', function(e){
                if (expr) {
                    var disabled = $parse(expr)(scope);
                    if (disabled) {
                        e.preventDefault();
                    }
                } else {
                    e.preventDefault();    
                }
            });
        }
    }

    /** @ngInject */
    function uiMarkdown($sanitize, markdown) {
        var directive = {
            link: link,
            restrict: 'A'
        };

        return directive;

        function link(scope, element, attrs) {
            var model = attrs.uiMarkdown, text;
            if (model) {
                scope.$watch(model, function(text){
                    var html = $sanitize(markdown(text));
                    element.html(html);
                });  
            } else {
                text = $sanitize(markdown(element.html()));
                element.html(text);
            }
        }
    }

}());