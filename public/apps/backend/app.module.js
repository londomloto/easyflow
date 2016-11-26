
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
                router.go('login');
            });
        };

    }
    
    /** ngInject */
    function run($rootScope, router, auth) {
        // maybe late...
        auth.verify();

        // debug
        // $rootScope.$on("$stateChangeError", console.log.bind(console));

        $rootScope.$on('$stateChangeStart', function(evt, state){
            if (state.authenticate) {
                if ( ! auth.isAuthenticated()) {
                    auth.verify().then(function(user){
                        if ( ! user) {
                            evt.preventDefault();
                            router.go(router.getLoginState());
                        }
                    });
                }
            }
        });
    }

}());