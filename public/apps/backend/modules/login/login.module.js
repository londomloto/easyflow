(function(){

    angular
        .module('login', [])
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController($scope, router, auth) {
        $scope.email = '';
        $scope.passwd = '';

        $scope.login = function() {
            auth.login($scope.email, $scope.passwd).then(function(result){
                if (result.success) {
                    router.go(router.getDefaultState());
                }
            });
        };
    }

}());