
(function(){

    angular
        .module('user', ['app'])
        .controller('UserController', UserController)
        .controller('EditUserController', EditUserController)
        .controller('AddUserController', AddUserController);

    /** @ngInject */
    function UserController($scope, Store, api) {
        
        $scope.users = [];
        $scope.query = {
            email: '',
            fullname: ''
        };

        $scope.userStore = new Store({
            url: '/user/find',
            params: {

            },
            pageSize: 12
        });

        $scope.userStore.on('beforeload', function(){
            var filters = [];
            for(var name in $scope.query) {
                filters.push({
                    field: name,
                    value: $scope.query[name],
                    comparison: 'contains'
                });
            }
            $scope.userStore.setParam('filters', filters);
        });

        $scope.userStore.on('load', function(data){
            $scope.users = data;
        });

        $scope.userStore.load();

        /*$scope.loadUsers = function() {
            api.get('/user/find').then(function(response){
                $scope.users = response.data.data;
            });
        };

        $scope.loadUsers();*/

    }   

    /** @ngInject */
    function EditUserController($scope, $filter, router, theme, api) {
        var id = router.getParam('id');

        $scope.edit = {
            passwd1: '',
            passwd2: ''
        };

        $scope.photo = {
            file: null,
            name: null,
            data: null
        };

        $scope.roles = [];

        if (id) {
            api.get('/user/find/' + id).then(function(response){
                $scope.edit = response.data.data;
                $scope.edit.passwd1 = '';
                $scope.edit.passwd2 = '';

                $scope.photo.data = $scope.edit.avatar_url;
            });
            
            api.get('/access/find-role').then(function(response){
                $scope.roles = response.data.data;
            });
        }

        $scope.onSelectPhoto = function(name, data) {
            $scope.photo.name = name;
            $scope.photo.data = data;
        };

        $scope.saveUser = function(form) {

            if ( ! form.$valid) {
                return;
            }

            var data = angular.copy($scope.edit),
                opts = {};

            if ($scope.photo.file) {
                opts.upload = [
                    {key: 'userfile', file: $scope.photo.file}
                ];
            }

            api.post('/user/update', data, opts).then(function(response){
                if (response.data.success) {
                    theme.toast('Data berhasil disimpan');
                }
            });
        };

        $scope.deleteUser = function() {
            theme.showConfirm('Konfirmasi', 'Hapus pengguna yang bersangkutan?').then(function(action){
                if (action) {
                    api.del('/user/delete/' + $scope.edit.id).then(function(response){
                        if (response.data.success) {
                            theme.toast("Data berhasil dihapus");
                            router.go('main.user');    
                        }
                    });
                }
            });
        }
    }

    /** @ngInject */
    function AddUserController($scope, theme, router, api) {
        $scope.add = {
            sex: 'pria'
        };

        $scope.photo = {
            file: null,
            name: null
        };

        $scope.roles = [];

        api.get('/access/find-role').then(function(response){
            var roles = response.data.data,
                defaultRole = roles.filter(function(role){
                    return role.is_default == '1';
                });
            $scope.roles = roles;

            if (defaultRole.length) {
                $scope.add.role = defaultRole[0].name;
            }
        });

        $scope.saveUser = function(form) {
            if ( ! form.$valid) {
                return
            }

            var data = angular.copy($scope.add),
                opts = {};

            if ($scope.photo.file) {
                opts.upload = [
                    {key: 'userfile', file: $scope.photo.file}
                ];
            }

            api.post('/user/create', data, opts).then(function(response){
                if (response.data.success) {
                    theme.toast("Data berhasil ditambahkan");
                    router.go('main.user');
                }
            });
        };

        $scope.onSelectPhoto = function(name) {
            $scope.photo.name = name;
        };
    }

}());