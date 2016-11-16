
(function(){

    angular
        .module('core', [
            'ui.router',
            'oc.lazyLoad'
        ])
        .provider('router', routerProvider)
        .provider('loader', loaderProvider)
        .run(run);

    /** @ngInject */
    function routerProvider($stateProvider, $urlRouterProvider) {
        var provider = this;

        provider.register = register;
        provider.fallback = fallback;

        provider.$get = factory;

        /////////
        
        function register(routes) {
            for (var state in routes) {
                if (routes.hasOwnProperty(state)) {
                    $stateProvider.state(state, routes[state]);
                }
            }
        }

        function fallback(uri) {
            $urlRouterProvider.otherwise(uri);
        }

        /** @ngInject */
        function factory($rootScope, $templateFactory, $state) {
            var service = {
                getParam: getParam,
                go: go
            };

            return service;

            function getParam(name) {
                var params = $state.params;
                return params[name];
            }

            function getTemplate(url) {
                return $templateFactory.fromUrl(url);
            }

            function go(state) {
                $state.go(state);
            }

        }
    }

    /** @ngInject */
    function loaderProvider($ocLazyLoadProvider) {
        var provider = this;

        provider.register = register;
        provider.$get = factory;

        function register(modules) {
            $ocLazyLoadProvider.config({
                modules: modules
            });
        }

        /** @ngInject */
        function factory($ocLazyLoad) {
            var service = {
                load: load
            };

            return service;

            function load(modules) {
                return $ocLazyLoad.load(modules, {serie: true});
            }
        }
    }


    /** @ngInject */
    function run($rootScope) {
        $rootScope.state = {};

        $rootScope.$on('$stateChangeStart', onStateChangeStart);
        
        function onStateChangeStart(evt, state, params) {
            $rootScope.state = state;
        }
    }
    
}());