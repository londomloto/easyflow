(function(){

    angular
        .module('account')
        .controller('BookmarkController', BookmarkController)
        .controller('BookmarkDetailController', BookmarkDetailController);

    /** @ngInject */
    function BookmarkController($scope, router, Store, api, theme) {
        var email = router.getParam('email');

        $scope.diagrams = [];

        $scope.diagramStore = new Store({
            url: '/accounts/' + email + '/bookmarks',
            pageSize: 2
        });

        $scope.diagramStore.on('load', function(data){
            $scope.diagrams = data;
        });

        $scope.diagramStore.load();

        $scope.bookmark = function(diagram) {
            if (diagram.bookmarked) {
                api.del('/accounts/' + email + '/bookmarks/' + diagram.id).then(function(response){
                    if (response.data.data) {
                        $scope.diagramStore.load();
                    }
                });
            } else {
                api.post('/accounts/' + email + '/bookmarks', angular.copy(diagram)).then(function(response){
                    if (response.data.data) {
                        $scope.diagramStore.load();
                    }
                });
            }
        };

    }

    /** @ngInject */
    function BookmarkDetailController($scope, $timeout, Store, router, api) {
        $scope.loadDiagram = function() {
            var email = router.getParam('email'),
                id = router.getParam('id');

            if (id) {
                api.get('/accounts/' + email + '/bookmarks/' + id).then(function(response){
                    $scope.$parent.diagram = response.data.data;
                });
            }
        };
        
        $scope.$on('bookmark', function(e, data){
            if (data.bookmark === 0) {
                router.go('account.bookmark');
            }
        });

        $scope.loadDiagram();

    }

}());