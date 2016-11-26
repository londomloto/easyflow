
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
        $scope.photo = null;
        $scope.photoname = null;
        $scope.roles = [];

        if (id) {
            api.get('/user/find/' + id).then(function(response){
                $scope.edit = response.data.data;
            });
            
            api.get('/access/find-role').then(function(response){
                $scope.roles = response.data.data;
            });
        }

        $scope.onSelectPhoto = function(file) {
            $scope.photoname = file;
        };

        $scope.saveUser = function() {
            var data = angular.copy($scope.edit),
                opts = {};

            if ($scope.photo) {
                opts.upload = [
                    {key: 'userfile', file: $scope.photo}
                ];
            }

            api.post('/user/update', data, opts).then(function(response){
                if (response.data.success) {
                    theme.toast('Data berhasil disimpan');
                }
            });
        };
    }

}());