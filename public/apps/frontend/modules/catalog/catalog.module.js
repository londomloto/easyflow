(function(){

    angular
        .module('catalog', ['app'])
        .controller('CatalogController', CatalogController);

    /** @ngInject */
    function CatalogController($scope, Store, router, theme, api) {

        theme.init($scope);

        $scope.diagrams = [];

        $scope.query = {
            name: '',
            description: '',
            user_fullname: '',
            sort: ''
        };

        $scope.queryReset = angular.copy($scope.query);

        $scope.diagramStore = new Store({
            url: '/catalog'
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

        $scope.search = function() {
            router.go('catalog.index').then(function(){
                $scope.diagramStore.load();
            })
        };

        $scope.clearSearch = function() {
            $scope.query = angular.copy($scope.queryReset);
            router.go('catalog.index').then(function(){
                $scope.diagramStore.load();
            });
        };

        $scope.bookmark = function(diagram) {
            if (diagram.bookmarked) {
                api.del('/catalog/bookmarks/' + diagram.id).then(function(response){
                    diagram.bookmarked = response.data.data.bookmarked;
                    diagram.bookmarks = response.data.data.bookmarks;
                });
            } else {
                api.post('/catalog/bookmarks', angular.copy(diagram)).then(function(response){
                    if (response.data.data) {
                        diagram.bookmarked = response.data.data.bookmarked;
                        diagram.bookmarks = response.data.data.bookmarks;
                    }
                });
            }
        };


        $scope.diagramStore.load();
    }

}());