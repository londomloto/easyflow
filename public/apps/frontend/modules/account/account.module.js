
(function(){

    angular
        .module('account', ['app'])
        .controller('ForkController', ForkController)
        .controller('ForkDetailController', ForkDetailController)
        .controller('NotificationController', NotificationController)
        .controller('MessageController', MessageController);

    /** @ngInject */
    function ForkController($scope, router, Store, theme, api) {
        var email = router.getParam('email');
        $scope.diagrams = [];

        $scope.diagramStore = new Store({
            url: '/accounts/' + email + '/forks'
        });

        $scope.diagramStore.on('load', function(data){
            $scope.diagrams = data;
        });

        $scope.bookmark = function(diagram) {
            if (diagram.bookmarked) {
                api.del('/accounts/' + email + '/bookmarks/' + diagram.id).then(function(response){
                    if (response.data.data) {
                        diagram.bookmarked = response.data.data.bookmarked;
                        diagram.bookmarks  = response.data.data.bookmarks;
                    }
                });
            } else {
                api.post('/accounts/' + email + '/bookmarks', angular.copy(diagram)).then(function(response){
                    if (response.data.data) {
                        diagram.bookmarked = response.data.data.bookmarked;
                        diagram.bookmarks  = response.data.data.bookmarks;
                    }
                });
            }
        };

        $scope.fork = function(diagram) {
            if (diagram.forked) {
                theme.showConfirm('Konfirmasi', 'Anda yakin akan menhapus akses kontribusi diagram ini?').then(function(action){
                    if (action) {
                        api.del('/accounts/' + email + '/forks/' + diagram.id).then(function(response){
                            if (response.data.data) {
                                $scope.diagramStore.load();
                            }
                        });        
                    }
                });
            } else {
                api.post('/accounts/' + email + '/forks', angular.copy(diagram)).then(function(response){
                    if (response.data.data) {
                        $scope.diagramStore.load();
                    }
                });
            }
        };

        $scope.diagramStore.load();
    }

    /** @ngInject */
    function ForkDetailController($scope, $timeout, Store, router, api) {
        
        $scope.loadDiagram = function() {
            var id = router.getParam('id'),
                email = router.getParam('email');

            if (id) {
                api.get('/accounts/' + email + '/forks/' + id).then(function(response){
                    $scope.$parent.diagram = response.data.data;
                });
            }
        };
        
        $scope.$on('fork', function(e, data){
            if (data.fork === 0) {
                router.go('account.fork');
            }
        });

        $scope.loadDiagram();
        $scope.loadForkers();
        $scope.loadComments();

    }

    /** @ngInject */
    function NotificationController($scope, Store, router, api) {
        var email = router.getParam('email');

        $scope.notifications = [];

        $scope.notifyStore = new Store({
            url: '/accounts/' + email + '/notifications'
        });

        $scope.notifyStore.on('load', function(data){
            $scope.notifications = data;
        });

        $scope.remove = function(item) {
            api.del('/accounts/' + email + '/notifications/' + item.id).then(function(response){
                if(response.data.success) {
                    $scope.notifyStore.load();
                }
            });
        };

        $scope.reject = function(item) {
            var data = angular.copy(item),
                email = router.getParam('email');

            var url;

            switch(data.type) {
                case 'follow-request':
                    url = '/accounts/followers/reject';
                    break;
                case 'fork-request':
                    url = '/accounts/forks/reject';
                    break;
            }

            if (email && url) {
                api.post(url, data).then(function(response){
                    if (response.data.success) {
                        $scope.remove(item);
                    }
                });
            }
            
        };

        $scope.approve = function(item) {
            var data = angular.copy(item),
                email = router.getParam('email');

            var url;

            switch(data.type) {
                case 'follow-request':
                    url = '/accounts/followers/approve';
                    break;
                case 'fork-request':
                    url = '/accounts/forks/approve';
                    break;
            }

            if (email && url) {
                api.post(url, data).then(function(response){
                    if (response.data.success) {
                        $scope.remove(item);
                    }
                });
            }
        };

        $scope.notifyStore.load();
    }

    /** @ngInject */
    function MessageController($scope) {

    }

}());