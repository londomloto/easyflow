
(function(){

    angular
        .module('account')
        .controller('DiagramController', DiagramController)
        .controller('ViewDiagramController', ViewDiagramController)
        .controller('EditDiagramController', EditDiagramController);

    /** @ngInject */
    function DiagramController($scope, router, Store) {
        var email = router.getParam('email');

        $scope.diagrams = [];

        $scope.diagramStore = new Store({
            url: '/accounts/' + email + '/diagrams',
            pageSize: 10
        });

        $scope.diagramStore.on('load', function(data){
            $scope.diagrams = data;
        });

        if (email) {
            $scope.diagramStore.load();    
        }
    }

    function ViewDiagramController($scope, router, api) {

        var slug = router.getParam('slug'),
            email = router.getParam('email');

        if (slug && email) {
            api.get('/accounts/' + email + '/diagrams/' + slug).then(function(response){
                $scope.$parent.diagram = response.data.data;
            });

            $scope.loadComments();
        }
    }

    function EditDiagramController($scope, router, theme, api) {
        
        $scope.reset = {};
        $scope.cover = {file: null, name: ''};

        $scope.loadDiagram = function() {
            var email = router.getParam('email'),
                id = router.getParam('id');

            if (email && id) {
                api.get('/accounts/' + email + '/diagrams/' + id).then(function(response){
                    $scope.$parent.diagram = response.data.data;
                    $scope.reset = angular.copy($scope.diagram);
                });    
            }
        };

        $scope.updateDiagram = function() {
            var email = router.getParam('email'),
                data = angular.copy($scope.diagram),
                opts = {};

            if ($scope.cover.file) {
                opts.upload = [
                    {key: 'userfile', file: $scope.cover.file}
                ];
            }

            api.put('/diagrams/' + data.id, data, opts).then(function(response){
                if (response.data.success) {
                    $scope.diagram = response.data.data;
                    $scope.reset = angular.copy($scope.diagram);
                    theme.toast('Data berhasil disimpan');
                }
            });

        };

        $scope.resetDiagram = function() {
            $scope.diagram = angular.copy($scope.reset);
        };

        $scope.deleteDiagram = function() {
            theme.showConfirm(
                'Konfirmasi',
                'Anda yakin akan menghapus diagram ini?'
            ).then(function(action){
                if (action) {
                    api.del('/diagrams/' + $scope.diagram.id).then(function(response){
                        
                    });
                }
            })
        };

        $scope.onSelectCover = function(e) {
            $scope.cover.name = e.name;
        };

        $scope.loadDiagram();
        $scope.loadForkers();
        $scope.loadComments();
    }

}());