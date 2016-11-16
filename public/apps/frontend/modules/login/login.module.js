
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
                        router.go('profile.home');
                    } else {
                        $scope.message = result.message;
                    }
                });
            }
        };

        $scope.socialLogin = function(profile) {
            if (profile) {
                auth.social(profile).then(function(result){
                    if (result.success) {
                        router.go('profile.home');
                    } else {
                        $scope.message = result.message;
                    }
                });
            }
        };

    }

}());