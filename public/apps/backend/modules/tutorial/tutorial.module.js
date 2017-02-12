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
            api.get('/tutorials').then(function(response){
                $scope.tutorials = response.data.data;
            });
        };

        $scope.removeTutorial = function(tutorial) {
            theme.showConfirm('Konfirmasi', 'Anda yakin akan menghapus tutorial ini? ?').then(function(action){
                if (action) {
                    var data = angular.copy(tutorial);
                    api.del('/tutorials/' + tutorial.id, data).then(function(response){
                        if (response.data.success) {
                            var index = $scope.tutorials.indexOf(tutorial);
                            if (index > -1) {
                                $scope.tutorials.splice(index, 1);
                            }
                        }
                    });
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

            api.post('/tutorials', data).then(function(response){
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
        $scope.video = null;
        $scope.videoName = null;

        if (id) {
            api.get('/tutorials/' + id).then(function(response){
                $scope.edit = response.data.data;
            });
        }

        $scope.onSelectVideo = function(video) {
            $scope.videoName = video;
        };
        
        $scope.saveTutorial = function() {
            var data = angular.copy($scope.edit),
                opts = {};

            if ($scope.video) {
                opts.upload = [
                    {key: 'userfile', file: $scope.video}
                ];
            }

            api.put('/tutorials/' + data.id, data, opts).then(function(response){
                if (response.data.success) {
                    theme.toast('Data berhasil disimpan');    
                }
            });
        };
    }

}());