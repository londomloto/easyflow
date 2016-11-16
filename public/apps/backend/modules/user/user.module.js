
(function(){

    angular
        .module('user', ['app'])
        .controller('UserController', UserController)
        .controller('UserEditController', UserEditController);

    /** @ngInject */
    function UserController($scope, api) {
        
        $scope.users = [];

        $scope.loadUsers = function() {
            api.get('/user/find').then(function(response){
                $scope.users = response.data.data;
            });
        };

        $scope.loadUsers();

    }   

    /** @ngInject */
    function UserEditController($scope, router, theme, api) {
        var id = router.getParam('id');

        $scope.edit = {};

        if (id) {
            api.get('/user/find/' + id).then(function(response){
                $scope.edit = response.data.data;
            });
        }

        $scope.saveUser = function() {
            var data = angular.copy($scope.edit);

            api.post('/user/update', data).then(function(response){
                if (response.data.success) {
                    theme.toast('Data berhasil disimpan');
                }
            });
        };
    }

}());