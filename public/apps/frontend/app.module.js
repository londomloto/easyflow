
(function(){

    angular
        .module('app', [
            'core',
            'ui.router.breadcrumbs'
        ])
        .controller('AppController', AppController)
        .run(run);
        
    /////////
    
    /** @ngInject */
    function AppController($scope, $anchorScroll, $location, router, auth) {
        
        $scope.logout = function() {
            auth.logout().then(function(result){
                router.go('home');
            });
        };

        $scope.gotoAnchor = function(anchor) {
            $location.hash(anchor);
            $anchorScroll();
        };

    }
    
    /** @ngInject */
    function run($rootScope, router, auth) {
        auth.verify();
        
        $rootScope.$on('$stateChangeStart', function(evt, state){
            if (state.authenticate) {
                auth.verify().then(function(user){
                    if ( ! user) {
                        evt.preventDefault();
                        router.go(router.getLoginState());
                    }
                });
            } else {
                auth.verify(false);
            }
        });

    }

}());