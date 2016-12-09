
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
                    'assets/vendor/bootstrap/v3/css/ripples.css',
                    'assets/vendor/bootstrap/v3/css/material.css',
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

                    'assets/vendor/bpmn/bpmn.css',
                    'assets/vendor/graph/css/graph.css',
                    'assets/css/editor.css'
                ],
                insertBefore: '#head-files'
            },
            {
                name: 'profile.styles',
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
                    'assets/vendor/bootstrap/v3/js/bootstrap.js',
                    'assets/vendor/bootstrap/v3/js/ripples.js',
                    'assets/vendor/bootstrap/v3/js/material.js',
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
                name: 'profile.scripts',
                files: [
                    'assets/vendor/simplelightbox/simple-lightbox.js',
                    'assets/vendor/showdown/showdown.min.js',
                    'apps/frontend/modules/profile/profile.module.js'
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
                    // 'assets/vendor/graph/dist/graph.min.js',
                    
                    'assets/vendor/graph/src/poly.js',
                    'assets/vendor/graph/src/core.js',
                    'assets/vendor/graph/src/util.js',

                    'assets/vendor/graph/src/lang/class.js',
                    'assets/vendor/graph/src/lang/error.js',
                    'assets/vendor/graph/src/lang/event.js',
                    'assets/vendor/graph/src/lang/point.js',
                    'assets/vendor/graph/src/lang/line.js',
                    'assets/vendor/graph/src/lang/curve.js',
                    'assets/vendor/graph/src/lang/bbox.js',
                    'assets/vendor/graph/src/lang/path.js',
                    'assets/vendor/graph/src/lang/matrix.js',

                    'assets/vendor/graph/src/collection/point.js',
                    'assets/vendor/graph/src/collection/vector.js',
                    'assets/vendor/graph/src/collection/shape.js',
                    'assets/vendor/graph/src/collection/tree.js',

                    'assets/vendor/graph/src/dom/element.js',

                    'assets/vendor/graph/src/svg/vector.js',
                    'assets/vendor/graph/src/svg/ellipse.js',
                    'assets/vendor/graph/src/svg/circle.js',
                    'assets/vendor/graph/src/svg/rect.js',
                    'assets/vendor/graph/src/svg/path.js',
                    'assets/vendor/graph/src/svg/polyline.js',
                    'assets/vendor/graph/src/svg/polygon.js',
                    'assets/vendor/graph/src/svg/group.js',
                    'assets/vendor/graph/src/svg/text.js',
                    'assets/vendor/graph/src/svg/image.js',
                    'assets/vendor/graph/src/svg/line.js',
                    'assets/vendor/graph/src/svg/paper.js',

                    'assets/vendor/graph/src/registry/vector.js',
                    'assets/vendor/graph/src/registry/link.js',
                    'assets/vendor/graph/src/registry/shape.js',
                    'assets/vendor/graph/src/registry/pallet.js',

                    'assets/vendor/graph/src/layout/layout.js',
                    
                    'assets/vendor/graph/src/router/router.js',
                    'assets/vendor/graph/src/router/directed.js',
                    'assets/vendor/graph/src/router/orthogonal.js',

                    'assets/vendor/graph/src/link/link.js',
                    'assets/vendor/graph/src/link/directed.js',
                    'assets/vendor/graph/src/link/orthogonal.js',
                    
                    'assets/vendor/graph/src/util/sweeplink.js',

                    'assets/vendor/graph/src/plugin/plugin.js',
                    'assets/vendor/graph/src/plugin/definer.js',
                    'assets/vendor/graph/src/plugin/reactor.js',
                    'assets/vendor/graph/src/plugin/transformer.js',
                    'assets/vendor/graph/src/plugin/animator.js',
                    'assets/vendor/graph/src/plugin/resizer.js',
                    'assets/vendor/graph/src/plugin/collector.js',
                    'assets/vendor/graph/src/plugin/dragger.js',
                    'assets/vendor/graph/src/plugin/dropper.js',
                    'assets/vendor/graph/src/plugin/sorter.js',
                    'assets/vendor/graph/src/plugin/network.js',
                    'assets/vendor/graph/src/plugin/history.js',
                    'assets/vendor/graph/src/plugin/panzoom.js',
                    'assets/vendor/graph/src/plugin/linker.js',
                    'assets/vendor/graph/src/plugin/toolmanager.js',
                    'assets/vendor/graph/src/plugin/pencil.js',
                    'assets/vendor/graph/src/plugin/editor.js',
                    'assets/vendor/graph/src/plugin/snapper.js',
                    'assets/vendor/graph/src/plugin/toolpad.js',
                    
                    'assets/vendor/graph/src/shape/shape.js',
                    'assets/vendor/graph/src/shape/activity/start.js',
                    'assets/vendor/graph/src/shape/activity/final.js',
                    'assets/vendor/graph/src/shape/activity/action.js',
                    'assets/vendor/graph/src/shape/activity/router.js',
                    'assets/vendor/graph/src/shape/activity/fork.js',
                    'assets/vendor/graph/src/shape/activity/join.js',
                    'assets/vendor/graph/src/shape/activity/lane.js',
                    'assets/vendor/graph/src/shape/activity/pool.js',

                    'assets/vendor/graph/src/data/exporter.js',
                    'assets/vendor/graph/src/data/importer.js',

                    'assets/vendor/graph/src/pallet/activity.js',

                    'assets/vendor/graph/src/diagram/diagram.js',
                    'assets/vendor/graph/src/diagram/activity.js',
                    
                    'assets/vendor/graph/src/popup/dialog.js',

                    'apps/frontend/modules/editor/editor.module.js',
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
            'user': {
                url: '/u',
                abstract: true,
                templateUrl: 'apps/frontend/modules/user/user.html',
                controller: 'UserController as userCtl',
                resolve: {
                    /** @ngInject */
                    dependencies: function(loader) {
                        return loader.load([
                            'frontend.styles',
                            'frontend.scripts',
                            'user.scripts'
                        ]);
                    }
                }
            },
            'user.view': {
                url: '/:email',
                templateUrl: 'apps/frontend/modules/user/user.view.html'
            },
            'profile': {
                url: '/p/:email',
                abstract: true,
                authenticate: true,
                templateUrl: 'apps/frontend/modules/profile/profile.html',
                controller: 'ProfileController as profileCtl',
                resolve: {
                    /** @ngInject */
                    dependencies: function(loader) {
                        return loader.load([
                            'frontend.styles',
                            'frontend.scripts',
                            'profile.styles',
                            'profile.scripts'
                        ]);
                    }
                }
            },
            'profile.home': {
                url: '',
                icon: 'ion-home',
                title: 'Beranda Saya',
                style: 'profile',
                breadcrumb: 'Beranda Saya',
                authenticate: true,
                templateUrl: 'apps/frontend/modules/profile/profile.home.html'
            },
            'profile.edit': {
                url: '/edit',
                icon: 'ion-person',
                title: 'Sunting Profil',
                style: 'profile',
                authenticate: true,
                breadcrumb: 'Sunting Profil',
                templateUrl: 'apps/frontend/modules/profile/profile.edit.html',
                controller: 'EditProfileController as editProfileCtl'
            },
            'profile.notification': {
                url: '/notifications',
                icon: 'ion-android-notifications',
                title: 'Pesan Notifikasi',
                breadcrumb: 'Pesan Notifikasi',
                authenticate: true,
                templateUrl: 'apps/frontend/modules/profile/notification.html',
                controller: 'NotificationController as notificationCtl'
            },
            'profile.diagram': {
                url: '/diagrams',
                icon: 'ion-erlenmeyer-flask',
                title: 'Diagram Saya',
                style: 'profile',
                authenticate: true,
                breadcrumb: 'Diagram Saya',
                templateUrl: 'apps/frontend/modules/profile/diagram.html',
                controller: 'DiagramController as diagramCtl'
            },
            'profile.diagram.edit': {
                url: '/edit/:id',
                title: 'Sunting Diagram',
                style: 'profile',
                breadcrumb: 'Sunting Diagram',
                authenticate: true,
                views: {
                    '@profile': {
                        templateUrl: 'apps/frontend/modules/profile/diagram.edit.html',
                        controller: 'EditDiagramController as editDiagramCtl'        
                    }
                }
            },
            
            'profile.bookmark': {
                url: '/bookmarks',
                icon: 'ion-heart',
                title: 'Data Boorkmark',
                breadcrumb: 'Data Boorkmark',
                authenticate: true,
                views: {
                    '@profile': {
                        templateUrl: 'apps/frontend/modules/profile/bookmark.html',
                        controller: 'BookmarkController as bookmarkCtl'        
                    }
                }
            },
            'profile.bookmark.detail': {
                url: '/:id',
                title: 'Detail Bookmark',
                breadcrumb: 'Detail',
                authenticate: true,
                views: {
                    '@profile': {
                        templateUrl: 'apps/frontend/modules/profile/bookmark.detail.html',
                        controller: 'BookmarkDetailController as bookmarkDetailCtl'   
                    }
                }
            },
            'profile.forking': {
                url: '/forking',
                icon: 'ion-network',
                title: 'Data Kontribusi',
                breadcrumb: 'Data Kontribusi',
                authenticate: true,
                views: {
                    '@profile': {
                        templateUrl: 'apps/frontend/modules/profile/forking.html',
                        controller: 'ForkingController as forkingCtl'        
                    }
                }
            },
            'profile.forking.detail': {
                url: '/:id',
                title: 'Detail Kontribusi',
                breadcrumb: 'Detail',
                authenticate: true,
                views: {
                    '@profile': {
                        templateUrl: 'apps/frontend/modules/profile/forking.detail.html',
                        controller: 'ForkingDetailController as forkingDetailCtl'   
                    }
                }
            },
            'profile.friend': {
                url: '/friends',
                icon: 'ion-android-contacts',
                title: 'Data Teman',
                breadcrumb: 'Data Teman',
                authenticate: true
            },
            'profile.insight': {
                url: '/insight',
                icon: 'ion-stats-bars',
                title: 'Data Statistik',
                breadcrumb: 'Data Statistik',
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
                abstract: true,
                breadcrumb: {
                    stateName: 'catalog.index',
                    text: 'Katalog',
                    url: '/catalog'
                },
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
            'catalog.index': {
                url: '',
                title: 'Katalog',
                style: 'catalog',
                templateUrl: 'apps/frontend/modules/catalog/catalog.index.html',
                controller: 'CatalogIndexController as catalogIndexCtl'
            },
            'catalog.detail': {
                url: '/:slug',
                title: 'Detail Katalog',
                style: 'catalog',
                breadcrumb: 'Detail Katalog',
                templateUrl: 'apps/frontend/modules/catalog/catalog.detail.html',
                controller: 'CatalogDetailController as catalogDetailCtl'
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