(function(){

    angular
        .module('access', ['app'])
        .controller('AccessController', AccessController)
        .controller('AddAccessController', AddAccessController)
        .controller('EditAccessController', EditAccessController);

    /** @ngInject */
    function AccessController($scope, theme, api, Store) {

        ///////// ROLE /////////
        
        $scope.roleData = [];

        $scope.roleStore = new Store({
            url: '/access/find-role',
            pageSize: 10
        });

        $scope.roleStore.on('load', function(data){
            $scope.roleData = data;
        });

        $scope.roleStore.load();

        $scope.deleteRole = function(role) {
            theme
                .showConfirm('Konfirmasi', 'Anda yakin akan menghapus role ini?')
                .then(function(action){
                    if (action) {
                        api.del('/access/delete-role/' + role.id).then(function(response){
                            if (response.data.success) {
                                $scope.roleStore.load();    
                            }
                        });
                    }
                });
        };

        ///////// PERMISSION /////////
        
        $scope.permissions = [];

        $scope.loadPermissions = function() {
            api.get('/access/find-perm').then(function(response){
                $scope.permissions = response.data.data;
            });
        }

        $scope.loadPermissions();
    }

    /** @ngInject */
    function AddAccessController($scope, router, theme, api) {
        $scope.add = {};

        $scope.saveRole = function() {
            if ($scope.form.$valid) {
                var data = angular.copy($scope.add);
                api.post('/access/save-role', data).then(function(response){
                    if (response.data.success) {
                        theme.toast("Data berhasil ditambahkan");
                        router.go('main.access');
                    } else {
                        theme.toast(response.data.message, 'danger');
                    }
                });
            }
        };
    }

    /** @ngInject */
    function EditAccessController($scope, router, theme, api, Store) {
        $scope.edit = {};

        $scope.loadRole = function() {
            var id = router.getParam('id');
            if (id) {
                api.get('/access/find-role/' + id).then(function(response){
                    $scope.edit = response.data.data;
                });    
            }
        };

        $scope.saveRole = function() {
            var data = angular.copy($scope.edit);
            if (data.name) {

                var caps = angular.copy($scope.capabilities);
                data.caps = caps;

                api.post('/access/save-role', data).then(function(response){
                    if (response.data.success) {
                        theme.toast('Data berhasil disimpan');
                    }
                });
            }
        };

        ///////// CAPABILITIES /////////
        
        $scope.capabilities = [];

        $scope.loadCapabilities = function() {
            api.get('/access/find-cap', {role_id: router.getParam('id')}).then(function(response){
                $scope.capabilities = response.data.data;
            });
        };

        $scope.loadCapabilities();
        $scope.loadRole();
    }
    

}());