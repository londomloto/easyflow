
(function(){

    angular
        .module('app', [
            'core'
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
    function run($rootScope, site) {
        $rootScope.site = {};
        $rootScope.user = {};
        
        site.getInfo().then(function(info){
            $rootScope.site = info.site;
            $rootScope.user = info.user;
        });
    }

}());