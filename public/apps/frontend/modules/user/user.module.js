(function(){

    angular
        .module('user', ['app'])
        .controller('UserController', UserController);

    /** @ngInject */
    function UserController($scope, router, api) {
        
        $scope.user = {};

        $scope.loadUser = function() {
            var email = router.getParam('email');
            if (email) {
                api.get('/user/view', {email: email}).then(function(response){
                    $scope.user = response.data.data;
                });
            }
        };

        $scope.loadUser();

    }

}());