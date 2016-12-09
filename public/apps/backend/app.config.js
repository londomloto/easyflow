
(function(){

    angular
        .module('app')
        .config(config);

    /////////
    
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
                name: 'backend.styles',
                files: [
                    'assets/vendor/bootstrap/v4/css/bootstrap.css',
                    'assets/vendor/bootstrap/v3/css/snackbar.css',
                    'assets/css/backend.css'
                ],
                insertBefore: '#head-files'
            },
            {
                name: 'tutorial.styles',
                files: [
                    'assets/vendor/videojs/video-js.min.css',
                    'assets/css/backend-tutorial.css'
                ],
                insertBefore: '#head-files'
            },
            {
                name: 'user.styles',
                files: [
                    'assets/vendor/simplelightbox/simplelightbox.css'
                ],
                insertBefore: '#head-files'
            },
            {
                name: 'diagram.styles',
                files: [
                    'assets/vendor/simplelightbox/simplelightbox.css',
                    'assets/vendor/datetimepicker/css/datetimepicker.css'
                ],
                insertBefore: '#head-files'
            },
            ///////// SCRIPTS /////////
            {
                name: 'backend.scripts',
                files: [
                    'assets/vendor/tether/tether.min.js',
                    'assets/vendor/bootstrap/v4/js/bootstrap.js',
                    'assets/vendor/bootstrap/v3/js/snackbar.js'
                ],
                insertBefore: '#body-files'
            },
            {
                name: 'login.scripts',
                files: ['apps/backend/modules/login/login.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'forgot.scripts',
                files: ['apps/backend/modules/forgot/forgot.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'dashboard.scripts',
                files: ['apps/backend/modules/dashboard/dashboard.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'mail.scripts',
                files: ['apps/backend/modules/mail/mail.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'setting.scripts',
                files: ['apps/backend/modules/setting/setting.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'access.scripts',
                files: ['apps/backend/modules/access/access.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'user.scripts',
                files: [
                    'assets/vendor/simplelightbox/simple-lightbox.js',
                    'apps/backend/modules/user/user.module.js'
                ],
                insertBefore: '#body-files'
            },
            {
                name: 'diagram.scripts',
                files: [
                    'assets/vendor/simplelightbox/simple-lightbox.js',
                    'assets/vendor/moment/moment.js',
                    'assets/vendor/datetimepicker/js/datetimepicker.min.js',
                    'assets/vendor/showdown/showdown.min.js',
                    'apps/backend/modules/diagram/diagram.module.js'
                ],
                insertBefore: '#body-files'
            },
            {
                name: 'tutorial.scripts',
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
                abstract: true,
                resolve: {
                    /** @ngInject */
                    dependencies: function($rootScope, loader) {
                        return loader.load([
                            'backend.styles',
                            'backend.scripts'
                        ]);
                    }
                }
            },
            'main.dashboard': {
                url: '/dashboard',
                breadcrumb: 'Dashboard',
                authenticate: true,
                templateUrl: 'apps/backend/modules/dashboard/dashboard.html',
                controller: 'DashboardController as dashboardCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load(['dashboard.scripts']);
                    }
                }
            },
            'main.mail': {
                url: '/mail',
                breadcrumb: 'Perpesanan',
                authenticate: true,
                templateUrl: 'apps/backend/modules/mail/mail.html',
                controller: 'MailController as mailCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load(['mail.scripts']);
                    }
                }
            },
            'main.mail.inbox': {
                url: '/inbox',
                breadcrumb: 'Pesan Masuk',
                authenticate: true,
                views: {
                    '@main.mail': {
                        templateUrl: 'apps/backend/modules/mail/inbox.html',
                        controller: 'InboxController as inboxCtl'
                    }
                }
            },
            'main.mail.inbox.message': {
                url: '/:id',
                breadcrumb: 'Lihat Pesan',
                authenticate: true,
                views: {
                    '@main.mail': {
                        templateUrl: 'apps/backend/modules/mail/message.html',
                        controller: 'InboxController as inboxCtl'
                    }
                }
            },
            'main.mail.outbox': {
                url: '/outbox',
                breadcrumb: 'Pesan Keluar',
                authenticate: true,
                templateUrl: 'apps/backend/modules/mail/outbox.html',
                controller: 'OutboxController as outboxCtl'
            },
            'main.mail.trash': {
                url: '/trash',
                breadcrumb: 'Kotak Sampah',
                authenticate: true,
                views: {
                    '@main.mail': {
                        templateUrl: 'apps/backend/modules/mail/trash.html',
                        controller: 'TrashController as trashCtl'
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
                        return loader.load(['setting.scripts']);
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
                        return loader.load(['access.scripts']);
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
                            'user.scripts'
                        ]);
                    }
                }
            },
            'main.user.add': {
                url: '/add',
                breadcrumb: 'Tambah',
                authenticate: true,
                views: {
                    '@main': {
                        templateUrl: 'apps/backend/modules/user/add.html',
                        controller: 'AddUserController as addUserCtl'
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
                        controller: 'EditUserController as editUserCtl'
                    }
                }
            },
            'main.diagram': {
                url: '/diagram',
                breadcrumb: 'Diagram',
                authenticate: true,
                templateUrl: 'apps/backend/modules/diagram/diagram.html',
                controller: 'DiagramController as diagramCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load([
                            'diagram.styles',
                            'diagram.scripts'
                        ]);
                    }
                }
            },
            'main.diagram.edit': {
                url: '/edit/:id',
                breadcrumb: 'Sunting',
                authenticate: true,
                views: {
                    '@main': {
                        templateUrl: 'apps/backend/modules/diagram/edit.html',
                        controller: 'EditDiagramController as editDiagramCtl'
                    }
                }
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
                            'tutorial.scripts'
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
                        return loader.load([
                            'backend.styles',
                            'backend.scripts',
                            'login.scripts'
                        ]);
                    }
                }
            },
            'forgot': {
                url: '/forgot',
                templateUrl: 'apps/backend/modules/forgot/forgot.html',
                controller: 'ForgotController as forgotCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load([
                            'backend.styles',
                            'backend.scripts',
                            'forgot.scripts'
                        ]);
                    }
                }
            },
            'forgot.recover': {
                url: '/recover?email&token',
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