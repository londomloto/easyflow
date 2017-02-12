
(function(){

    angular
        .module('app')
        .config(config);

    /** @ngInject */
    function config(
        httpInterceptorProvider,
        routerProvider, 
        loaderProvider,
        siteProvider, 
        authProvider,
        apiProvider,
        CLIENT,
        SERVER
    ) {

        httpInterceptorProvider.setup({
            context: CLIENT.CONTEXT
        });

        siteProvider.setup({
            context: CLIENT.CONTEXT
        });

        authProvider.setup({
            context: CLIENT.CONTEXT
        });

        apiProvider.setup({
            base: SERVER.BASE
        });

        loaderProvider.setup({
            base: CLIENT.BASE
        });

        loaderProvider.register([
            ///////// STYLES /////////
            {
                name: 'frontend.styles',
                files: [
                    'assets/vendor/montserrat/fonts.css',
                    'assets/vendor/bootstrap/v3/css/bootstrap.css',
                    'assets/vendor/bootstrap/v3/css/snackbar.css',
                    'assets/vendor/bootstrap/v3/css/bootstrap-social.css',
                    'assets/css/frontend.css'
                ],
                insertBefore: '#head-files'
            },
            {
                name: 'editor.styles',
                files: [
                    'assets/vendor/animate/animate.min.css',
                    'assets/vendor/bootstrap/v4/css/bootstrap.css',
                    'assets/vendor/bootstrap/v3/css/snackbar.css',
                    'assets/vendor/graph/css/graph.css',
                    'assets/css/editor.css'
                ],
                insertBefore: '#head-files'
            },
            {
                name: 'account.styles',
                files: [
                    'assets/vendor/simplelightbox/simplelightbox.css'
                ],
                insertBefore: '#head-files'
            },
            {
                name: 'catalog.styles',
                files: [
                    'assets/vendor/simplelightbox/simplelightbox.css'
                ],
                insertBefore: '#head-files'
            },
            {
                name: 'tutorial.styles',
                files: [
                    'assets/vendor/videojs/video-js.min.css',
                    'assets/css/frontend-tutorial.css'
                ],
                insertBefore: '#head-files'
            },
            ///////// SCRIPTS /////////
            {
                name: 'frontend.scripts',
                files: [
                    'assets/vendor/bootstrap/v3/js/bootstrap.min.js',
                    'assets/vendor/bootstrap/v3/js/snackbar.js'
                ],
                insertBefore: '#body-files'
            },
            {
                name: 'home.scripts',
                files: ['apps/frontend/modules/home/home.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'register.scripts',
                files: ['apps/frontend/modules/register/register.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'login.scripts',
                files: ['apps/frontend/modules/login/login.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'forgot.scripts',
                files: ['apps/frontend/modules/forgot/forgot.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'user.scripts',
                files: ['apps/frontend/modules/user/user.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'account.scripts',
                files: [
                    'assets/vendor/simplelightbox/simple-lightbox.js',
                    'assets/vendor/showdown/showdown.min.js',
                    'apps/frontend/modules/account/account.module.js',
                    'apps/frontend/modules/account/account.controller.js',
                    'apps/frontend/modules/account/diagram.controller.js',
                    'apps/frontend/modules/account/bookmark.controller.js'
                ],
                insertBefore: '#body-files'
            },
            {
                name: 'catalog.scripts',
                files: [
                    'assets/vendor/simplelightbox/simple-lightbox.js',
                    'assets/vendor/showdown/showdown.min.js',
                    'apps/frontend/modules/catalog/catalog.module.js'
                ],
                insertBefore: '#body-files'
            },
            {
                name: 'editor.scripts',
                files: [
                    'assets/vendor/tether/tether.min.js',
                    'assets/vendor/bootstrap/v4/js/bootstrap.js',
                    'assets/vendor/bootstrap/v3/js/snackbar.js',

                    'assets/vendor/graph/vendor/lodash/lodash.js',
                    'assets/vendor/graph/vendor/interact/interact.js',
                    
                    'apps/frontend/modules/editor/editor.config.js',
                    'assets/vendor/graph/dist/graph.min.js',
                    'apps/frontend/modules/editor/editor.module.js',
                    'apps/frontend/modules/editor/editor.service.js',
                    'apps/frontend/modules/editor/editor.directive.js'
                ],
                insertBefore: '#body-files'
            },
            {
                name: 'tutorial.module',
                files: [
                    'assets/vendor/videojs/video.min.js',
                    'apps/frontend/modules/tutorial/tutorial.module.js'
                ],
                insertBefore: '#body-files'
            }
        ]);

        // ROUTER
        routerProvider.setup({
            defaultState: {
                name: 'home',
                url: '/home'
            },
            loginState: {
                name: 'login',
                url: '/login'
            }
        });
        
        routerProvider.register({
            'home': {
                url: '/home',
                title: 'Home',
                style: 'home',
                templateUrl: 'apps/frontend/modules/home/home.html',
                controller: 'HomeController as homeCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load([
                            'frontend.styles',
                            'frontend.scripts',
                            'home.scripts'
                        ]);
                    }
                }
            },
            'register': {
                url: '/register',
                title: 'Daftar',
                style: 'register',
                templateUrl: 'apps/frontend/modules/register/register.html',
                controller: 'RegisterController as registerCtl',
                resolve: {
                    /** @ngInject */
                    dependencies: function(loader) {
                        return loader.load([
                            'frontend.styles',
                            'frontend.scripts',
                            'register.scripts'
                        ]);
                    }
                }
            },
            'login': {
                url: '/login',
                title: 'Login',
                style: 'login',
                templateUrl: 'apps/frontend/modules/login/login.html',
                controller: 'LoginController as loginCtl',
                resolve: {
                    /** @ngInject */
                    dependencies: function(loader) {
                        return loader.load([
                            'frontend.styles',
                            'frontend.scripts',
                            'login.scripts'
                        ]);
                    }
                }
            },
            'forgot': {
                url: '/forgot',
                title: 'Lupa Password',
                style: 'forgot',
                templateUrl: 'apps/frontend/modules/forgot/forgot.html',
                controller: 'ForgotController as forgotCtl',
                resolve: {
                    /** @ngInject */
                    dependencies: function(loader) {
                        return loader.load([
                            'frontend.styles',
                            'frontend.scripts',
                            'forgot.scripts'
                        ]);
                    }
                }
            },
            'forgot.notify': {
                url: '/notify/:type',
                title: 'Terima Kasih',
                style: 'forgot',
                views: {
                    '@': {
                        templateUrl: function(params) {
                            return 'apps/frontend/modules/forgot/notify-' + params.type + '.html';
                        }
                    }
                }
            },
            'forgot.recover': {
                url: '/recover?email&token',
                title: 'Pembaharuan',
                style: 'forgot',
                views: {
                    '@': {
                        templateUrl: 'apps/frontend/modules/forgot/recover.html',
                        controller: 'RecoverController as recoverCtl'
                    }
                }
            },
            'account': {
                url: '/account/:email',
                abstract: true,
                authenticate: true,
                templateUrl: 'apps/frontend/modules/account/account.html',
                controller: 'AccountController as accountCtl',
                resolve: {
                    /** @ngInject */
                    dependencies: function(loader) {
                        return loader.load([
                            'frontend.styles',
                            'frontend.scripts',
                            'account.styles',
                            'account.scripts'
                        ]);
                    }
                }
            },
            'account.home': {
                url: '',
                icon: 'ion-home',
                title: 'Beranda',
                style: 'account',
                breadcrumb: 'Beranda',
                authenticate: true,
                templateUrl: 'apps/frontend/modules/account/account.home.html',
                controller: 'HomeAccountController as homeAccountCtl'
            },
            'account.edit': {
                url: '/edit',
                icon: 'ion-person',
                title: 'Sunting',
                style: 'account',
                authenticate: true,
                breadcrumb: 'Sunting',
                templateUrl: 'apps/frontend/modules/account/account.edit.html',
                controller: 'EditAccountController as editAccountCtl'
            },
            'account.notification': {
                url: '/notifications',
                icon: 'ion-android-notifications',
                title: 'Notifikasi',
                breadcrumb: 'Notifikasi',
                authenticate: true,
                templateUrl: 'apps/frontend/modules/account/notification.html',
                controller: 'NotificationController as notificationCtl'
            },
            'account.diagram': {
                url: '/diagrams',
                icon: 'ion-erlenmeyer-flask',
                title: 'Diagram',
                style: 'account',
                authenticate: true,
                breadcrumb: 'Diagram',
                templateUrl: 'apps/frontend/modules/account/diagram.html',
                controller: 'DiagramController as diagramCtl'
            },
            'account.diagram.view': {
                url: '/:slug',
                title: 'Detail Diagram',
                style: 'account',
                breadcrumb: 'Detail',
                authenticate: true,
                views: {
                    '@account': {
                        templateUrl: 'apps/frontend/modules/account/diagram.view.html',
                        controller: 'ViewDiagramController as viewDiagramCtl'        
                    }
                }
            },
            'account.diagram.edit': {
                url: '/:id/edit',
                title: 'Sunting Diagram',
                style: 'account',
                breadcrumb: 'Sunting Diagram',
                authenticate: true,
                views: {
                    '@account': {
                        templateUrl: 'apps/frontend/modules/account/diagram.edit.html',
                        controller: 'EditDiagramController as editDiagramCtl'        
                    }
                }
            },

            'account.message': {
                url: '/message',
                icon: 'ion-chatboxes',
                title: 'Perpesanan',
                breadcrumb: 'Perpesanan',
                authenticate: true,
                views: {
                    '@account': {
                        templateUrl: 'apps/frontend/modules/account/account.message.html',
                        controller: 'MessageController as messageCtl'        
                    }
                }
            },
            
            'account.bookmark': {
                url: '/bookmarks',
                icon: 'ion-heart',
                title: 'Boorkmark',
                breadcrumb: 'Boorkmark',
                authenticate: true,
                templateUrl: 'apps/frontend/modules/account/bookmark.html',
                controller: 'BookmarkController as bookmarkCtl'
                // views: {
                //     '@account': {
                //         templateUrl: 'apps/frontend/modules/account/bookmark.html',
                //         controller: 'BookmarkController as bookmarkCtl'
                //     }
                // }
            },
            'account.bookmark.detail': {
                url: '/:id',
                title: 'Detail Bookmark',
                breadcrumb: 'Detail',
                authenticate: true,
                views: {
                    '@account': {
                        templateUrl: 'apps/frontend/modules/account/bookmark.detail.html',
                        controller: 'BookmarkDetailController as bookmarkDetailCtl'   
                    }
                }
            },
            'account.fork': {
                url: '/forks',
                icon: 'ion-network',
                title: 'Kontribusi',
                breadcrumb: 'Kontribusi',
                authenticate: true,
                views: {
                    '@account': {
                        templateUrl: 'apps/frontend/modules/account/fork.html',
                        controller: 'ForkController as forkCtl'        
                    }
                }
            },
            'account.fork.detail': {
                url: '/:id',
                title: 'Detail Kontribusi',
                breadcrumb: 'Detail',
                authenticate: true,
                views: {
                    '@account': {
                        templateUrl: 'apps/frontend/modules/account/fork.detail.html',
                        controller: 'ForkDetailController as forkDetailCtl'   
                    }
                }
            },
            'account.friend': {
                url: '/friends',
                icon: 'ion-android-contacts',
                title: 'Teman',
                breadcrumb: 'Teman',
                authenticate: true
            },
            'account.insight': {
                url: '/insight',
                icon: 'ion-stats-bars',
                title: 'Statistik',
                breadcrumb: 'Statistik',
                authenticate: true
            },
            'editor': {
                url: '/editor',
                title: 'Editor',
                style: 'editor',
                templateUrl: 'apps/frontend/modules/editor/editor.html',
                controller: 'EditorController as editorCtl',
                resolve: {
                    /** @ngInject */
                    dependencies: function(loader) {
                        return loader.load([
                            'editor.styles',
                            'editor.scripts'
                        ]);
                    }
                }
            },
            'catalog': {
                url: '/catalog',
                templateUrl: 'apps/frontend/modules/catalog/catalog.html',
                controller: 'CatalogController as catalogCtl',
                resolve: {
                    /** @ngInject */
                    dependencies: function(loader) {
                        return loader.load([
                            'frontend.styles',
                            'frontend.scripts',
                            'catalog.styles',
                            'catalog.scripts'
                        ]);
                    }
                }  
            },
            'tutorial': {
                url: '/tutorial',
                title: 'Tutorial',
                style: 'tutorial',
                templateUrl: 'apps/frontend/modules/tutorial/tutorial.html',
                controller: 'TutorialController as tutorialCtl',
                resolve: {
                    /** @ngInject */
                    dependencies: function(loader) {
                        return loader.load([
                            'frontend.styles',
                            'frontend.scripts',
                            'tutorial.styles',
                            'tutorial.module'
                        ]);
                    }
                }
            }
        });

    }

}());