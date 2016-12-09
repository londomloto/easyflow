
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
    function AppController($scope, router, auth) {
        
        $scope.logout = function() {
            auth.logout().then(function(result){
                router.go('home');
            });
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