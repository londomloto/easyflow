
(function(){

    angular
        .module('account')
        .controller('AccountController', AccountController)
        .controller('HomeAccountController', HomeAccountController)
        .controller('EditAccountController', EditAccountController);


    /** @ngInject */
    function AccountController($scope, router, theme, api) {
        $scope.account = {};
        $scope.menus = [];

        var states = router.getStates(),
            email = router.getParam('email');

        if (email) {
            api.get('/accounts/' + email).then(function(response){
                
                $scope.menus = [];

                if (response.data.data) {
                    $scope.account = response.data.data;

                    var excludes = $scope.account.editable ? [] : ['edit', 'notification'];
                    var found;

                    angular.forEach(states, function(s){
                        found = s.name.match(/^account\.([^.]+)$/);
                        if (found && excludes.indexOf(found[1]) === -1) {
                            $scope.menus.push({
                                text: s.title,
                                icon: s.icon,
                                state: s.name
                            });
                        }
                    });
                }
            });
        }

        ///////// COMMON /////////
        
        $scope.comments = [];
        $scope.comment = {message: ''};
        $scope.diagram = {};

        $scope.loadComments = function() {
            var diagramId = router.getParam('id');

            if (diagramId) {
                api.get('/diagrams/' + diagramId + '/comments').then(function(response){
                    $scope.comments = response.data.data;
                });
            }
        }; 

        $scope.addComment = function() {
            var diagramId = router.getParam('id');

            var data = {
                message: $scope.comment.message
            };

            if (diagramId) {
                api.post('/diagrams/' + diagramId + '/comments', data).then(function(response){
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
            var diagramId = router.getParam('id');
            if (diagramId) {
                theme.showConfirm(
                    'Konfirmasi',
                    'Anda yakin akan menghapus komentar ini?'
                ).then(function(action){
                    if (action) {
                        api.del('/diagrams/' + diagramId + '/comments/' + comment.id).then(function(response){
                            if (response.data.success) {
                                $scope.loadComments();
                            }
                        });        
                    }
                });
                
            }
        };  

        $scope.updateComment = function(comment) {
            var diagramId = router.getParam('id');
            if (diagramId && comment.message) {
                var data = {
                    message: comment.message
                };

                api.put('/diagrams/' + diagramId + '/comments/' + comment.id, data).then(function(response){
                    if (response.data.success) {
                        comment.editing = 0;
                    }
                });
            }
        };

        $scope.bookmark = function() {
            var email = router.getParam('email'),
                data = angular.copy($scope.diagram);

            if (data.bookmarked == 1) {
                api.del('/accounts/' + email + '/bookmarks/' + data.id).then(afterBookmark);
            } else {
                api.post('/accounts/' + email + '/bookmarks', data).then(afterBookmark);
            }
        };

        function afterBookmark(response) {
            if (response.data.data) {
                $scope.diagram.bookmarked = response.data.data.bookmarked;
                $scope.diagram.bookmarks = response.data.data.bookmarks;
                $scope.$broadcast('bookmark', {bookmark: $scope.diagram.bookmarked});
            }
        }

        $scope.download = function(format) {
            api.get('/diagrams/download/' + $scope.diagram.id + '/' + format, {}, {download: true});
        };

        $scope.follow = function() {
            var email = router.getParam('email');
            if (email) {
                api.post('/accounts/' + email + '/followers').then(function(response){
                    if (response.data.success) {
                        $scope.account.following = 'Y';
                    }
                });
            }
        };

        $scope.unfollow = function() {
            var email = router.getParam('email'),
                follower = $scope.user ? $scope.user.id : false;

            if (email && follower) {
                api.del('/accounts/' + email + '/followers/' + follower).then(function(response){
                    if (response.data.success) {
                        $scope.account.following = 'N';
                    }
                });
            }
        };
    }

    function HomeAccountController($scope, router, Store, moment) {
        var email = router.getParam('email');

        $scope.feeds = [];

        $scope.feedStore = new Store({
            url: '/accounts/' + email + '/feeds',
            pageSize: 10
        });

        $scope.feedStore.on('load', function(data){
            $scope.feeds = data;
        });

        if (email) {
            $scope.feedStore.load();    
        }
    }

    /** @ngInject */
    function EditAccountController($scope, router, auth, api, theme) {
        theme.init($scope);

        $scope.account = angular.copy($scope.user);
        $scope.account.passwd1 = '';
        $scope.account.passwd2 = '';

        $scope.avatar = null;
        $scope.avatar_name = "";

        $scope.onSelectAvatar = function(e) {
            $scope.avatar_name = e.name;
        };

        $scope.updateAccount = function() {
            if ($scope.form1.$valid) {
                var opts = {}, data;

                data = angular.copy($scope.account);
                delete data['token'];

                if ($scope.avatar) {
                    opts.upload = [
                        { key: 'userfile', file: $scope.avatar }
                    ];
                }

                api.put('/accounts/' + data.email, data, opts).then(function(result){
                    if (result.data.success) {
                        if (result.data.user) {
                            auth.save(result.data.user);
                        }
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
                    api.del('/accounts/' + $scope.user.email).then(function(result){
                        if (result.data.success) {
                            auth.invalidate();
                            router.go(router.getDefaultState());
                        }
                    });
                }
            });
        };
    }

}());