(function(){

    angular
        .module('setting', ['app'])
        .controller('SettingController', SettingController);

    /** @ngInject */
    function SettingController($scope, theme, api) {
        $scope.setting  = {};
        $scope.setting_ = {};

        $scope.loadSetting = function() {
            api.get('/setting/load').then(function(response){
                $scope.setting  = response.data.data;
                $scope.setting_ = angular.copy($scope.setting);
            });
        };

        $scope.updateSetting = function() {
            var data = angular.copy($scope.setting);
            api.post('/setting/save', data).then(function(response){
                if (response.data.success) {
                    theme.toast('Data berhasil disimpan');
                    $scope.setting_ = angular.copy($scope.setting);
                }
            });
        };

        $scope.resetSetting = function() {
            $scope.setting = angular.copy($scope.setting_);
        };

        $scope.requestKey = function() {
            theme.showModal('request-key');
        };

        $scope.hideModal = function(name) {
            theme.hideModal(name);
        };

        $scope.generateKey = function() {
            api.get('/setting/generate-key').then(function(response){
                if (response.data.success) {
                    $scope.setting.secret_key = response.data.data;
                }
            });
        };

        $scope.loadSetting();
    }

}());