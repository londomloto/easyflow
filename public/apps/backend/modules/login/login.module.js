(function(){

    angular
        .module('login', [])
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController($scope, router, theme, auth) {
        $scope.email = '';
        $scope.passwd = '';
        $scope.message = '';

        theme.invalidateTemplates();

        $scope.login = function(valid) {
            if (valid) {
                auth.login($scope.email, $scope.passwd).then(function(result){
                    if (result.success) {
                        router.go(router.getDefaultState());
                    } else {
                        $scope.message = result.message;
                    }
                });
            }
        };
    }

}());