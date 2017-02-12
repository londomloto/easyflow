
(function(){

    angular
        .module('login', ['app'])
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController($scope, router, auth, theme) {
        theme.init($scope);

        $scope.email   = '';
        $scope.passwd  = '';
        $scope.message = '';

        $scope.login = function() {
            if ($scope.form.$valid) {
                auth.login($scope.email, $scope.passwd).then(function(result){
                    if (result.success) {
                        router.go('account.home', {email: $scope.email});
                    } else {
                        $scope.message = result.message;
                    }
                });
            }
        };

        $scope.socialLogin = function(account) {
            if (account) {
                auth.social(account).then(function(result){
                    if (result.success) {
                        router.go('account.home', {email: account.email});
                    } else {
                        $scope.message = result.message;
                    }
                });
            }
        };

    }

}());