
(function(){

    angular
        .module('register', ['app'])
        .controller('RegisterController', RegisterController)
        .run(run);

    /** @ngInject */
    function RegisterController($scope, router, auth, theme) {
        theme.init($scope);

        $scope.account = {
            fullname: '',
            email: '',
            passwd1: '',
            passwd2: ''
        };

        $scope.createAccount = function() {
            if ($scope.form.$valid) {
                var account = angular.copy($scope.account);
                account.passwd = account.passwd1;
                
                delete account.passwd1;
                delete account.passwd2;

                auth.register(account).then(function(result){
                    router.go('profile.home');
                });
            }
        }
    }

    /** @ngInject */
    function run($rootScope) {
        
    }

}());