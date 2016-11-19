
(function(){

    angular
        .module('profile', ['app'])
        .controller('ProfileController', ProfileController)
        .controller('EditProfileController', EditProfileController)
        .controller('DiagramController', DiagramController);

    /** @ngInject */
    function ProfileController($scope, theme) {
        $scope.diagrams = [];
    }

    /** @ngInject */
    function EditProfileController($rootScope, $scope, router, api, theme) {
        theme.init($scope);

        $scope.pass1 = '';
        $scope.pass2 = '';

        $scope.user.noavatar = false;

        $scope.setAvatar = function() {
            console.log('called');
        };

        $scope.saveProfile = function() {
            if ($scope.form1.$valid) {
                var data, opts;

                data = angular.copy($scope.user);
                data.noavatar = data.noavatar ? '1' : '0';

                delete data['token'];

                if ($scope.userfile) {
                    opts = {
                        upload: [
                            {key: 'userfile', file: $scope.userfile}
                        ]
                    };
                }

                api.post('/user/update-profile', data, opts).then(function(result){
                    if (result.data.success) {
                        if (result.data.user) {
                            delete result.data.noavatar;
                            $rootScope.user = result.data.user;
                        }
                        theme.toast('Perubahan data berhasil disimpan');    
                    } else {
                        theme.toast(result.data.message, 'danger');  
                    }
                });
            }
            
        };

        $scope.saveAccount = function() {
            var valid = true;
            if ($scope.pass1) {
                if ($scope.pass1 != $scope.pass2) {
                    valid = false;
                } else {
                    valid = true;
                }
            }

            $scope.form2._pass2.$setValidity('verify', valid);

            valid = valid && $scope.pass1 && $scope.pass2;

            if (valid) {
                var data = angular.copy($scope.user);
                data.passwd = $scope.pass1;

                delete data['token'];

                api.post('/user/update-account', data).then(function(result){
                    if (result.data.success) {
                        theme.toast('Perubahan data berhasil disimpan');    
                    } else {
                        theme.toast(result.data.message, 'danger');    
                    }
                });
            }

            
        };

        $scope.removeAccount = function() {
            theme.showConfirm('Konfirmasi', 'Anda yakin akan menghapus akun?').then(function(action){
                if (action) {
                    api.post('/user/delete-account', {email: $scope.user.email}).then(function(result){
                        if (result.data.success) {
                            $rootScope.user = null;
                            router.go('home');
                        }
                    });
                }
            });
        };
    }

    /** @ngInject */
    function DiagramController($scope, api, theme) {
        theme.init($scope);

        $scope.diagrams = [];
        $scope.total = 0;

        $scope.selected = null;
        $scope.lightbox = 0;
        $scope.coverfile = null;
        $scope.covername = null;
        $scope.search = '';

        $scope.$watch('search', function(q){
            $scope.loadItems();
        });

        $scope.loadItems = function() {
            var params = {
                query: $scope.search
            };

            api.get('/user/diagram/find', params).then(function(response){
                $scope.diagrams = response.data.data;
                $scope.total = response.data.total;
            });
        };

        $scope.loadItems();

        $scope.triggerLightbox = function() {
            $scope.lightbox = $scope.diagrams.length;
        };
        
        $scope.saveSetting = function() {
            if ($scope.form1.$valid) {
                var data, opts;

                data = angular.copy($scope.selected);

                if ($scope.coverfile) {
                    opts = {
                        upload: [
                            {key: 'userfile', file: $scope.coverfile}
                        ]
                    };
                }

                data.published = data.published ? '1' : '0';

                api.post('/user/diagram/update', data, opts).then(function(result){
                    if (result.data.success) {
                        var data = result.data.data;
                        
                        for (var prop in data) {
                            if (data.hasOwnProperty(prop)) {
                                if (name == 'cover') {
                                    $scope.selected[prop] = data.cover + '?t=' + (new Date()).getTime();
                                } else if (name == 'published') {
                                    $scope.selected[prop] = data[prop] == '1' ? true : false;
                                } else {
                                    $scope.selected[prop] = data[prop];
                                }
                            }
                        }

                        theme.toast('Perubahan data berhasil disimpan');    
                        $scope.hideSetting();
                    } else {
                        theme.toast(result.data.message, 'danger');  
                    }
                });  
            }
        };

        $scope.showSetting = function(diagram) {
            $scope.selected = diagram;
            $scope.selected.published = $scope.selected.published == '1' ? true : false;
            theme.showModal('diagram-setting');
        };

        $scope.hideSetting = function() {
            theme.hideModal('diagram-setting');
        };

        $scope.removeDiagram = function(diagram) {
            theme.showConfirm('Konfirmasi', 'Anda yakin akan menghapus diagram ini?').then(function(action){
                if (action) {
                    api.post('/user/diagram/remove', angular.copy(diagram)).then(function(response){
                        if (response.data.success) {
                            var index = $scope.diagrams.indexOf(diagram);
                            $scope.diagrams.splice(index, 1);
                        }
                    });
                }
            });
        };
    }

}());