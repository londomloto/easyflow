
(function(){

    angular
        .module('diagram', ['app'])
        .controller('DiagramController', DiagramController)
        .controller('EditDiagramController', EditDiagramController)
        .config(config);

    /** @ngInject */
    function config() {
        
    }

    /** @ngInject */
    function DiagramController($scope, Store, api) {

        $scope.diagrams = [];
        $scope.query = {
            name: '',
            description: '',
            user_fullname: ''
        };

        $scope.diagramStore = new Store({
            url: '/diagrams',
            pageSize: 10
        });

        $scope.diagramStore.on('beforeload', function(){
            var filters = [],
                query = angular.copy($scope.query);

            for (var name in query) {
                if (query.hasOwnProperty(name)) {
                    filters.push({
                        field: name,
                        value: query[name],
                        comparison: 'contains'
                    });
                }
            }
            $scope.diagramStore.setParam({
                filters: filters
            })
        });

        $scope.diagramStore.on('load', function(data){
            $scope.diagrams = data;
        });

        $scope.diagramStore.load();

    }

    /** @ngInject */
    function EditDiagramController($scope, router, theme, api) {
        var id = +(router.getParam('id'));

        $scope.diagram = null;
        $scope.reset = null;
        $scope.cover = {
            name: '',
            file: null
        };

        $scope.comments = [];
        $scope.forkers = [];

        if (id) {

            api.get('/diagrams/' + id).then(function(response){
                $scope.diagram = response.data.data;
                $scope.reset = angular.copy($scope.diagram);
            });

        }

        $scope.updateDiagram = function() {
            var data = angular.copy($scope.diagram),
                opts = {};
            if (data) {

                if ($scope.cover.file) {
                    opts.upload = [
                        {key: 'userfile', file: $scope.cover.file}
                    ];
                }

                api.put('/diagrams/' + data.id, data, opts).then(function(response){
                    if (response.data.success) {
                        theme.toast('Data berhasil disimpan');

                        var data = response.data.data;

                        angular.extend($scope.diagram, {
                            slug: data.slug,
                            cover: data.cover,
                            cover_url: data.cover_url
                        });
                        
                        $scope.reset = angular.copy($scope.diagram);
                    }
                });
            }
        };

        $scope.resetDiagram = function() {
            $scope.diagram = angular.copy($scope.reset);
        };

        $scope.onSelectCover = function(name) {
            $scope.cover.name = name;
        };

        $scope.loadComments = function() {
            var id = router.getParam('id');
            if (id) {
                api.get('/diagrams/' + id + '/comments').then(function(response){
                    $scope.comments = response.data.data;
                });
            }
        };

        $scope.deleteComment = function(comment) {
            var id = router.getParam('id');
            if (id) {
                theme.showConfirm(
                    'Konfirmasi',
                    'Anda yakin akan menghapus komentar ini?'
                ).then(function(action){
                    if (action) {
                        api.del('/diagrams/' + id + '/comments/' + comment.id).then(function(response){
                            if (response.data.success) {
                                $scope.loadComments();
                            }
                        });
                    }
                });
                
            }
        };  

        $scope.loadForkers = function() {
            var id = router.getParam('id');
            if (id) {
                api.get('/diagrams/' + id + '/forkers').then(function(response){
                    $scope.forkers = response.data.data;
                });
            }
        };

        $scope.loadComments();
        $scope.loadForkers();
    }

}());