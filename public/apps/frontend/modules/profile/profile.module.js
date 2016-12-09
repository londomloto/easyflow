
(function(){

    angular
        .module('profile', ['app'])
        .controller('ProfileController', ProfileController)
        .controller('EditProfileController', EditProfileController)
        .controller('DiagramController', DiagramController)
        .controller('EditDiagramController', EditDiagramController)
        .controller('BookmarkController', BookmarkController)
        .controller('BookmarkDetailController', BookmarkDetailController)
        .controller('ForkingController', ForkingController)
        .controller('ForkingDetailController', ForkingDetailController)
        .controller('NotificationController', NotificationController);

    /** @ngInject */
    function ProfileController($scope, router, theme, api) {
        $scope.menus = [];

        var states = router.getStates();

        angular.forEach(states, function(s){
            if (/^profile\.[^.]+$/.test(s.name)) {
                $scope.menus.push({
                    text: s.title,
                    icon: s.icon,
                    state: s.name
                });
            }
        });

        ///////// COMMON /////////
        
        $scope.forkers = [];
        $scope.comments = [];
        $scope.comment = {message: ''};
        $scope.diagram = {};

        $scope.loadForkers = function() {
            var id = router.getParam('id');
            if (id) {
                api.get('/user/forker/find/' + id).then(function(response){
                    $scope.forkers = response.data.data;
                });
            }
        };

        $scope.loadComments = function() {
            var id = router.getParam('id');
            if (id) {
                api.get('/user/comment/find/' + id).then(function(response){
                    $scope.comments = response.data.data;
                });
            }
        }; 

        $scope.addComment = function() {
            var id = router.getParam('id');

            var data = {
                message: $scope.comment.message
            };

            if (id) {
                api.post('/user/comment/create/' + id, data).then(function(response){
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
            var id = router.getParam('id');
            if (id) {
                theme.showConfirm(
                    'Konfirmasi',
                    'Anda yakin akan menghapus komentar ini?'
                ).then(function(action){
                    if (action) {
                        var data = {
                            id: comment.id
                        };
                        api.post('/user/comment/delete/' + id + '/' + comment.id, data).then(function(response){
                            if (response.data.success) {
                                $scope.loadComments();
                            }
                        });        
                    }
                });
                
            }
        };  

        $scope.updateComment = function(comment) {
            var id = router.getParam('id');
            if (id && comment.message) {
                var data = {
                    id: comment.id,
                    message: comment.message
                };
                api.post('/user/comment/update/' + id + '/' + comment.id, data).then(function(response){
                    if (response.data.success) {
                        comment.editing = 0;
                    }
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

                    $scope.$broadcast('fork', {fork: $scope.diagram.forked});
                }
            });
        };

        $scope.bookmark = function() {
            var data = angular.copy($scope.diagram);

            api.post('/diagram/bookmark/' + data.slug, data).then(function(response){
                if (response.data.data) {
                    $scope.diagram.bookmarked = response.data.data.bookmarked;
                    $scope.diagram.bookmarks = response.data.data.bookmarks;

                    $scope.$broadcast('bookmark', {bookmark: $scope.diagram.bookmarked});
                }
            });
        };

        $scope.download = function(format) {
            var slug = $scope.diagram.slug;
            if (slug) {
                api.get('/diagram/download/' + slug, {format: format}, {download: true});
            }
        };
    }

    /** @ngInject */
    function EditProfileController($rootScope, $scope, router, auth, api, theme) {
        theme.init($scope);

        $scope.account = angular.copy($scope.user);
        $scope.account.passwd1 = '';
        $scope.account.passwd2 = '';
        $scope.account.noavatar = false;

        $scope.avatar = null;
        $scope.avatar_name = "";

        $scope.updateAccount = function() {
            if ($scope.form1.$valid) {
                var opts = {}, data;

                data = angular.copy($scope.account);
                data.noavatar = data.noavatar ? '1' : '0';

                delete data['token'];

                if ($scope.avatar) {
                    opts.upload = [
                        { key: 'userfile', file: $scope.avatar }
                    ];
                }

                api.post('/user/update-account', data, opts).then(function(result){
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
                    api.post('/user/delete-account', {email: $scope.user.email}).then(function(result){
                        if (result.data.success) {
                            auth.invalidate();
                            router.go(router.getDefaultState());
                        }
                    });
                }
            });
        };
    }

    /** @ngInject */
    function DiagramController($scope, Store) {
        $scope.diagrams = [];

        $scope.diagramStore = new Store({
            url: '/user/diagram/find',
            pageSize: 10
        });

        $scope.diagramStore.on('load', function(data){
            $scope.diagrams = data;
        });

        $scope.diagramStore.load();
    }

    function EditDiagramController($scope, router, theme, api) {
        theme.init($scope);
        
        $scope.reset = {};
        $scope.cover = {file: null, name: ''};

        $scope.loadDiagram = function() {
            var id = router.getParam('id');
            if (id) {
                api.get('/user/diagram/find/' + id).then(function(response){
                    $scope.$parent.diagram = response.data.data;
                    $scope.reset = angular.copy($scope.diagram);
                });    
            }
        };

        $scope.updateDiagram = function() {
            var data = angular.copy($scope.diagram),
                opts = {};

            if ($scope.cover.file) {
                opts.upload = [
                    {key: 'userfile', file: $scope.cover.file}
                ];
            }

            api.post('/diagram/update/' + data.id, data, opts).then(function(response){
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
                    api.del('/diagram/delete/' + $scope.diagram.id).then(function(response){
                        
                    });
                }
            })
        };

        $scope.onSelectCover = function(name) {
            $scope.cover.name = name;
        };

        $scope.loadDiagram();
        $scope.loadForkers();
        $scope.loadComments();
    }

    /** @ngInject */
    function BookmarkController($scope, Store) {
        $scope.diagrams = [];

        $scope.diagramStore = new Store({
            url: '/user/bookmark/find'
        });

        $scope.diagramStore.on('load', function(data){
            $scope.diagrams = data;
        });

        $scope.diagramStore.load();
    }

    /** @ngInject */
    function BookmarkDetailController($scope, $timeout, Store, router, api) {
        
        $scope.loadDiagram = function() {
            var id = router.getParam('id');
            if (id) {
                api.get('/user/bookmark/find/' + id).then(function(response){
                    $scope.$parent.diagram = response.data.data;
                });
            }
        };
        
        $scope.$on('bookmark', function(e, data){
            if (data.bookmark === 0) {
                router.go('profile.bookmark');
            }
        });

        $scope.loadDiagram();
        $scope.loadForkers();
        $scope.loadComments();

    }

    /** @ngInject */
    function ForkingController($scope, Store) {
        $scope.diagrams = [];

        $scope.diagramStore = new Store({
            url: '/user/forking/find'
        });

        $scope.diagramStore.on('load', function(data){
            $scope.diagrams = data;
        });

        $scope.diagramStore.load();
    }

    /** @ngInject */
    function ForkingDetailController($scope, $timeout, Store, router, api) {
        
        $scope.loadDiagram = function() {
            var id = router.getParam('id');
            if (id) {
                api.get('/user/forking/find/' + id).then(function(response){
                    $scope.$parent.diagram = response.data.data;
                });
            }
        };
        
        $scope.$on('fork', function(e, data){
            if (data.fork === 0) {
                router.go('profile.forking');
            }
        });

        $scope.loadDiagram();
        $scope.loadForkers();
        $scope.loadComments();

    }

    /** @ngInject */
    function NotificationController($scope, Store, api) {
        $scope.notifications = [];

        $scope.notifyStore = new Store({
            url: '/user/notification/find'
        });

        $scope.notifyStore.on('load', function(data){
            $scope.notifications = data;
        });

        $scope.remove = function(item) {
            api.post('/user/notification/delete/' + item.id).then(function(response){
                if(response.data.success) {
                    $scope.notifyStore.load();
                }
            });
        };

        $scope.reject = function(item) {

        };

        $scope.approve = function(item) {

        };

        $scope.notifyStore.load();
    }

}());