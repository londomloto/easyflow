
(function(){

    angular
        .module('register', ['app'])
        .controller('RegisterController', RegisterController)
        .run(run);

    /** @ngInject */
    function RegisterController($scope, router, auth, theme) {
        theme.init($scope);

        $scope.fullname = '';
        $scope.email = '';
        $scope.passwd = '';

        $scope.register = function() {
            if ($scope.form.$valid) {
                
                var data = {
                    fullname: $scope.fullname,
                    email: $scope.email,
                    passwd: $scope.passwd
                };

                auth.register(data).then(function(result){
                    router.go('profile.home');
                });
            }
        }
    }

    /** @ngInject */
    function run($rootScope) {
        
    }

}());