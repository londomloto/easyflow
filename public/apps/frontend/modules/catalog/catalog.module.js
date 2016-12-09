(function(){

    angular
        .module('catalog', ['app'])
        .controller('CatalogController', CatalogController)
        .controller('CatalogIndexController', CatalogIndexController)
        .controller('CatalogDetailController', CatalogDetailController);

    /** @ngInject */
    function CatalogController($scope, Store, router, theme, api) {

        theme.init($scope);

        $scope.creators = [];
        $scope.diagrams = [];

        $scope.query = {
            name: '',
            description: '',
            user_fullname: ''
        };

        $scope.diagramStore = new Store({
            url: '/diagram/catalog/find'
        });

        $scope.diagramStore.on('beforeload', function(){
            var filters = [],
                sorters = [],
                query = $scope.query;

            filters.push({ field: 'a.name', value: query.name, comparison: 'contains' });
            filters.push({ field: 'a.description', value: query.description, comparison: 'contains' });
            filters.push({ field: 'b.fullname', value: query.user_fullname, comparison: 'contains' });

            var sorts = (query.sort || '').split(/\s/);

            if (sorts.length > 1) {
                sorters.push({property: sorts[0], direction: sorts[1]});
            }

            $scope.diagramStore.setParam('filters', filters);
            $scope.diagramStore.setParam('sorters', sorters);
        });

        $scope.diagramStore.on('load', function(data){
            $scope.diagrams = data;
        });

        $scope.loadTopCreators = function() {
            api.get('/diagram/creator/find').then(function(response){
                $scope.creators = response.data.data;
            });
        };

        $scope.loadTopCreators();

        $scope.find = function() {
            router.go('catalog.index');
        };  

    }

    /** @ngInject */
    function CatalogIndexController($scope, Store, api) {

        $scope.diagramStore.load();

        $scope.bookmark = function(diagram) {
            var data = angular.copy(diagram);

            api.post('/diagram/bookmark/' + data.slug, data).then(function(response){
                if (response.data.data) {
                    diagram.bookmarked = response.data.data.bookmarked;
                    diagram.bookmarks = response.data.data.bookmarks;
                }
            });
        };

        $scope.fork = function(diagram) {
            var data = angular.copy(diagram);

            api.post('/diagram/fork/' + data.slug, data).then(function(response){
                if (response.data.data) {
                    diagram.forked = response.data.data.forked;
                    diagram.forks = response.data.data.forks;
                }
            });
        };
    }

    /** @ngInject */
    function CatalogDetailController($scope, router, theme, api) {
        $scope.diagram = {};
        $scope.forkers = [];
        $scope.comments = [];
        $scope.comment = {message: ''};

        $scope.loadDiagram = function() {
            var slug = router.getParam('slug');
            if (slug) {
                api.get('/diagram/catalog/find/' + slug).then(function(response){
                    $scope.diagram = response.data.data;
                });
            }
        };

        $scope.fork = function() {
            var data = angular.copy($scope.diagram);

            api.post('/diagram/fork/' + data.slug, data).then(function(response){
                if (response.data.data) {
                    $scope.diagram.forked = response.data.data.forked;
                    $scope.diagram.forks = response.data.data.forks;
                    $scope.loadForkers();
                }
            });
        };

        $scope.bookmark = function() {
            var data = angular.copy($scope.diagram);

            api.post('/diagram/bookmark/' + data.slug, data).then(function(response){
                if (response.data.data) {
                    $scope.diagram.bookmarked = response.data.data.bookmarked;
                    $scope.diagram.bookmarks = response.data.data.bookmarks;
                }
            });
        };

        $scope.loadForkers = function() {
            var slug = router.getParam('slug');
            if (slug) {
                api.get('/diagram/forker/find/' + slug).then(function(response){
                    $scope.forkers = response.data.data;
                });
            }
        };

        $scope.download = function(format) {
            var slug = router.getParam('slug');
            if (slug) {
                api.get('/diagram/download/' + slug, {format: format}, {download: true});
            }
        };

        $scope.loadComments = function() {
            var slug = router.getParam('slug');
            if (slug) {
                api.get('/diagram/comment/find/' + slug).then(function(response){
                    $scope.comments = response.data.data;
                });
            }
        };  

        $scope.addComment = function() {
            var slug = router.getParam('slug');
            var data = {
                message: $scope.comment.message
            };

            if (slug) {
                api.post('/diagram/comment/create/' + slug, data).then(function(response){
                    if (response.data.success) {
                        $scope.loadComments();
                        $scope.comment.message = '';
                    }
                });
            }
            
        };

        $scope.toggleCommentEditor = function(comment) {
            comment.editing = comment.editing === 0 ? 1 : 0;
        };

        $scope.deleteComment = function(comment) {
            var slug = router.getParam('slug');
            if (slug) {
                theme.showConfirm(
                    'Konfirmasi',
                    'Anda yakin akan menghapus komentar ini?'
                ).then(function(action){
                    if (action) {
                        var data = {
                            id: comment.id
                        };
                        api.post('/diagram/comment/delete/' + slug + '/' + comment.id, data).then(function(response){
                            if (response.data.success) {
                                $scope.loadComments();
                            }
                        });        
                    }
                });
                
            }
        };  

        $scope.updateComment = function(comment) {
            var slug = router.getParam('slug');
            if (slug && comment.message) {
                var data = {
                    id: comment.id,
                    message: comment.message
                };
                api.post('/diagram/comment/update/' + slug + '/' + comment.id, data).then(function(response){
                    if (response.data.success) {
                        comment.editing = 0;
                    }
                });
            }
        };

        $scope.loadDiagram();
        $scope.loadForkers();
        $scope.loadComments();


        
    }

}());