
(function(){

    angular
        .module('app')
        .config(config);

    /////////
    
    /** @ngInject */
    function config(routerProvider, loaderProvider, authProvider, apiProvider) {

        loaderProvider.register([
            {
                name: 'tutorial.styles',
                files: [
                    '/public/assets/vendor/videojs/video-js.min.css',
                    '/public/assets/css/backend-tutorial.css'
                ],
                insertBefore: '#header-files'
            },
            {
                name: 'login.module',
                files: ['/public/apps/backend/modules/login/login.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'dashboard.module',
                files: ['/public/apps/backend/modules/dashboard/dashboard.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'user.module',
                files: ['/public/apps/backend/modules/user/user.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'tutorial.module',
                files: [
                    '/public/assets/vendor/videojs/video.min.js',
                    '/public/apps/backend/modules/tutorial/tutorial.module.js'
                ],
                insertBefore: '#body-files'
            }
        ]);


        ///////////////////////////////////////
        /// ROUTES
        ///////////////////////////////////////
        
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
                templateUrl: '/public/apps/backend/modules/main/main.html',
                abstract: true
                // authenticate: true
            },
            'main.dashboard': {
                url: '/dashboard',
                breadcrumb: 'Dashboard',
                authenticate: true,
                templateUrl: '/public/apps/backend/modules/dashboard/dashboard.html',
                controller: 'DashboardController as dashboardCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load(['dashboard.module']);
                    }
                }
            },
            'main.role': {
                url: '/access',
                authenticate: true,
                breadcrumb: 'Hak Akses'
            },
            'main.user': {
                url: '/user',
                breadcrumb: 'Pengguna',
                authenticate: true,
                templateUrl: '/public/apps/backend/modules/user/user.html',
                controller: 'UserController as userCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load(['user.module']);
                    }
                }
            },
            'main.user.edit': {
                url: '/edit/:id',
                breadcrumb: 'Sunting',
                authenticate: true,
                views: {
                    '@main': {
                        templateUrl: '/public/apps/backend/modules/user/edit.html',
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
                templateUrl: '/public/apps/backend/modules/tutorial/tutorial.html',
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
                        templateUrl: '/public/apps/backend/modules/tutorial/add.html',
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
                        templateUrl: '/public/apps/backend/modules/tutorial/edit.html',
                        controller: 'EditTutorialController as editTutorialCtl'
                    }
                }
            },
            'login': {
                url: '/login',
                style: 'login',
                templateUrl: '/public/apps/backend/modules/login/login.html',
                controller: 'LoginController as loginCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load(['login.module']);
                    }
                }
            }
        });

    }

}());