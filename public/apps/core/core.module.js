
(function(){

    angular
        .module('core', [
            'ui.router',
            'oc.lazyLoad'
        ])
        .run(run);

    /** @ngInject */
    function run($rootScope, site) {
        $rootScope.state = {};

        $rootScope.site = {};
        $rootScope.user = {};
        
        site.verify();

        $rootScope.$on('$stateChangeStart', function(evt, state, params){
            $rootScope.state = state;
        });
    }
    
}());