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

                    }
                });
        };

        ///////// CAPABILITY /////////
        
        $scope.capQuery = '';
        $scope.capData = [];
        $scope.capSelection = null;

        $scope.capStore = new Store({
            url: '/access/find-cap',
            params: {
                query: '',
                fields: ['name', 'title']
            },
            pageSize: 10
        });

        $scope.capStore.on('beforeload', function(){
            $scope.capStore.setParam('query', $scope.capQuery);
        });

        $scope.capStore.on('load', function(data){
            $scope.capData = data;
        });

        $scope.$watch('capQuery', function(){
            $scope.capStore.load({page: 1});
        });

        $scope.showCapInfo = function(cap) {
            $scope.capSelection = cap;
            theme.showModal('capability-info');
        };

        $scope.hideCapInfo = function() {
            theme.hideModal('capability-info');
        };

        $scope.hideCapEditor = function() {
            theme.hideModal('capability-editor');
        };

        $scope.addCap = function() {
            $scope.capSelection = {
                id: '',
                name: '',
                description: ''
            };

            theme.showModal('capability-editor');
        };

        $scope.editCap = function(cap) {
            $scope.capSelection = cap;
            theme.showModal('capability-editor');
        };

        $scope.saveCap = function() {
            var selection = angular.copy($scope.capSelection);
            if (selection.name) {

                api.post('/access/save-cap', selection).then(function(response){
                    if (response.data.success) {
                        theme.toast('Data berhasil disimpan');
                        $scope.capStore.load();
                    }
                });

                theme.hideModal('capability-editor');
            }
        };

        $scope.deleteCap = function(cap) {
            theme
                .showConfirm('Konfirmasi', 'Anda yakin akan menghapus kapabilitas ini?')
                .then(function(action){
                    if (action) {
                        api.del('/access/delete-cap/' + cap.id).then(function(){
                            $scope.capStore.load();
                        });
                    }
                });
        };

    }

    /** @ngInject */
    function AddAccessController($scope, Store) {
        $scope.capData = [];

        $scope.capStore = new Store({
            url: '/access/find-cap',
            pageSize: 5
        });

        $scope.capStore.on('load', function(data){
            $scope.capData = data;
        });

        $scope.capStore.load();
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

                var perms = angular.copy($scope.permData);
                data.perms = perms;

                api.post('/access/save-role', data).then(function(response){
                    if (response.data.success) {
                        theme.toast('Data berhasil disimpan');
                    }
                });
            }
        };

        ///////// PERMISSION /////////
        
        $scope.permData = [];

        $scope.permStore = new Store({
            url: '/access/find-perm',
            params: {
                role_id: router.getParam('id')
            },
            pageSize: 10
        });

        $scope.permStore.on('load', function(data){
            $scope.permData = data;
        });

        $scope.permStore.load();
        $scope.loadRole();
    }
    

}());