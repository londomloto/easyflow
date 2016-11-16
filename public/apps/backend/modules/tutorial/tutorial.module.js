(function(){

    angular
        .module('tutorial', ['app'])
        .controller('TutorialController', TutorialController)
        .controller('AddTutorialController', AddTutorialController)
        .controller('EditTutorialController', EditTutorialController);

    /** @ngInject */
    function TutorialController($scope, theme, api) {
        $scope.tutorials = [];

        $scope.loadTutorials = function() {
            api.get('/tutorial/find').then(function(response){
                $scope.tutorials = response.data.data;
            });
        };

        $scope.removeTutorial = function(tutorial) {
            theme.showConfirm('remove-tutorial').then(function(action){
                if (action) {

                }
            });
        };

        $scope.loadTutorials();
    }

    /** @ngInject */
    function AddTutorialController($scope, theme, api) {
        $scope.add = {};

        $scope.saveTutorial = function() {
            var data = angular.copy($scope.add);

            api.post('/tutorial/create', data).then(function(response){
                if (response.data.success) {
                    theme.toast('Data berhasil ditambahkan');
                }
            });
        };
    }

    /** @ngInject */
    function EditTutorialController($scope, router, theme, api) {
        var id = router.getParam('id');
        $scope.edit = {};

        if (id) {
            api.get('/tutorial/find/' + id).then(function(response){
                $scope.edit = response.data.data;
            });
        }
        
        $scope.saveTutorial = function() {
            var data = angular.copy($scope.edit);
            api.post('/tutorial/update', data).then(function(response){
                if (response.data.success) {
                    theme.toast('Data berhasil disimpan');    
                }
            });
        };
    }

}());