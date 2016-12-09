
(function(){

    angular
        .module('core', [
            'ngSanitize',
            'ui.router',
            'oc.lazyLoad'
        ])
        .config(config)
        .run(run);

    /** @ngInject */
    function config($compileProvider, $httpProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/\s*(https?|ftp|mailto|data|blob):/);
        $httpProvider.interceptors.push('httpInterceptor');
    }

    /** @ngInject */
    function run($rootScope, site) {
        $rootScope.state = {};
        $rootScope.site = {};
        $rootScope.user = {};
        
        site.verify();
        
        $rootScope.$on('$stateChangeStart', function(evt, state, params){
            var currentState = angular.copy(state);
            currentState.params = angular.copy(params);
            $rootScope.state = currentState;
        });
    }
    
}());