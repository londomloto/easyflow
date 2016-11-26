
(function(){

    angular
        .module('app')
        .config(config);

    /////////
    
    /** @ngInject */
    function config(
        routerProvider, 
        loaderProvider, 
        siteProvider, 
        authProvider,
        apiProvider,
        CLIENT,
        SERVER
    ) {

        siteProvider.setup({
            context: CLIENT.CONTEXT
        });

        authProvider.setup({
            context: CLIENT.CONTEXT
        });

        apiProvider.setup({
            base: SERVER.BASE,
            context: CLIENT.CONTEXT
        });

        loaderProvider.setup({
            base: CLIENT.BASE
        });

        loaderProvider.register([
            {
                name: 'tutorial.styles',
                files: [
                    'assets/vendor/videojs/video-js.min.css',
                    'assets/css/backend-tutorial.css'
                ],
                insertBefore: '#header-files'
            },
            {
                name: 'user.styles',
                files: [
                    'assets/vendor/simplelightbox/simplelightbox.css'
                ],
                insertBefore: '#header-files'
            },

            {
                name: 'login.module',
                files: ['apps/backend/modules/login/login.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'forgot.module',
                files: ['apps/backend/modules/forgot/forgot.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'dashboard.module',
                files: ['apps/backend/modules/dashboard/dashboard.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'setting.module',
                files: ['apps/backend/modules/setting/setting.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'access.module',
                files: ['apps/backend/modules/access/access.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'user.module',
                files: [
                    'assets/vendor/simplelightbox/simple-lightbox.js',
                    'apps/backend/modules/user/user.module.js'
                ],
                insertBefore: '#body-files'
            },
            {
                name: 'tutorial.module',
                files: [
                    'assets/vendor/videojs/video.min.js',
                    'apps/backend/modules/tutorial/tutorial.module.js'
                ],
                insertBefore: '#body-files'
            }
        ]);

        // ROUTER
        routerProvider.setup({
            defaultState: {
                name: 'main.dashboard',
                url: '/main/dashboard'
            },
            loginState: {
                name: 'login',
                url: '/login'
            }
        });

        routerProvider.register({
            'main': {
                url: '/main',
                templateUrl: 'apps/backend/modules/main/main.html',
                abstract: true
                // authenticate: true
            },
            'main.dashboard': {
                url: '/dashboard',
                breadcrumb: 'Dashboard',
                authenticate: true,
                templateUrl: 'apps/backend/modules/dashboard/dashboard.html',
                controller: 'DashboardController as dashboardCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load(['dashboard.module']);
                    }
                }
            },
            'main.setting': {
                url: '/client',
                breadcrumb: 'Aplikasi',
                authenticate: true,
                templateUrl: 'apps/backend/modules/setting/setting.html',
                controller: 'SettingController as settingCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load(['setting.module']);
                    }
                }
            },
            'main.access': {
                url: '/access',
                authenticate: true,
                breadcrumb: 'Hak Akses',
                templateUrl: 'apps/backend/modules/access/access.html',
                controller: 'AccessController as accessCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load(['access.module']);
                    }
                }
            },
            'main.access.add': {
                url: '/add',
                authenticate: true,
                breadcrumb: 'Tambah',
                views: {
                    '@main': {
                        templateUrl: 'apps/backend/modules/access/add.html',
                        controller: 'AddAccessController as addAccessCtl'
                    }
                }
            },
            'main.access.edit': {
                url: '/edit/:id',
                authenticate: true,
                breadcrumb: 'Sunting',
                views: {
                    '@main': {
                        templateUrl: 'apps/backend/modules/access/edit.html',
                        controller: 'EditAccessController as editAccessCtl'
                    }
                }
            },
            'main.user': {
                url: '/user',
                breadcrumb: 'Pengguna',
                authenticate: true,
                templateUrl: 'apps/backend/modules/user/user.html',
                controller: 'UserController as userCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load([
                            'user.styles',
                            'user.module'
                        ]);
                    }
                }
            },
            'main.user.edit': {
                url: '/edit/:id',
                breadcrumb: 'Sunting',
                authenticate: true,
                views: {
                    '@main': {
                        templateUrl: 'apps/backend/modules/user/edit.html',
                        controller: 'UserEditController as userEditCtl'
                    }
                }
            },
            'main.admin': {
                url: '/admin',
                breadcrumb: 'Administrator',
                authenticate: true
            },
            'main.tutorial': {
                url: '/tutorial',
                breadcrumb: 'Tutorial',
                authenticate: true,
                templateUrl: 'apps/backend/modules/tutorial/tutorial.html',
                controller: 'TutorialController as tutorialCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load([
                            'tutorial.styles',
                            'tutorial.module'
                        ]);
                    }
                }
            },
            'main.tutorial.add': {
                url: '/add',
                breadcrumb: 'Tambah',
                authenticate: true,
                views: {
                    '@main': {
                        templateUrl: 'apps/backend/modules/tutorial/add.html',
                        controller: 'AddTutorialController as addTutorialCtl'
                    }
                }
            },
            'main.tutorial.edit': {
                url: '/edit/:id',
                breadcrumb: 'Sunting',
                authenticate: true,
                views: {
                    '@main': {
                        templateUrl: 'apps/backend/modules/tutorial/edit.html',
                        controller: 'EditTutorialController as editTutorialCtl'
                    }
                }
            },
            'login': {
                url: '/login',
                style: 'login',
                templateUrl: 'apps/backend/modules/login/login.html',
                controller: 'LoginController as loginCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load(['login.module']);
                    }
                }
            },
            'forgot': {
                url: '/forgot',
                templateUrl: 'apps/backend/modules/forgot/forgot.html',
                controller: 'ForgotController as forgotCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load(['forgot.module']);
                    }
                }
            },
            'forgot.recover': {
                url: '/recover?token',
                views: {
                    '@': {
                        templateUrl: 'apps/backend/modules/forgot/recover.html',
                        controller: 'RecoverController as recoverCtl'
                    }
                }
            },
            'forgot.notify': {
                url: '/notify/:type',
                views: {
                    '@': {
                        templateUrl: 'apps/backend/modules/forgot/notify.html',
                        controller: 'NotifyController as notifyCtl'
                    }
                }
            }
        });
    }

}());