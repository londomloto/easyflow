
(function(){

    angular
        .module('app')
        .config(config);

    /////////
    
    /** @ngInject */
    function config(routerProvider, loaderProvider) {

        ///////////////////////////////////////
        /// MODULES
        ///////////////////////////////////////

        loaderProvider.register([
            {
                name: 'login.module',
                files: ['/public/apps/backend/modules/login/login.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'home.module',
                files: ['/public/apps/backend/modules/home/home.module.js'],
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
            }
        ]);


        ///////////////////////////////////////
        /// ROUTES
        ///////////////////////////////////////
        
        routerProvider.fallback('main');
        
        routerProvider.register({
            'main': {
                url: '',
                templateUrl: '/public/apps/backend/modules/main/main.html'
            },
            'main.home': {
                url: '/home',
                title: 'Home',
                templateUrl: '/public/apps/backend/modules/home/home.html',
                controller: 'HomeController as homeCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load(['home.module']);
                    }
                }
            },
            'main.dashboard': {
                url: '/dashboard',
                title: 'Dashboard',
                templateUrl: '/public/apps/backend/modules/dashboard/dashboard.html',
                controller: 'DashboardController as dashboardCtl',
                resolve: {
                    dependencies: function(loader) {
                        return loader.load(['dashboard.module']);
                    }
                }
            },
            'main.user': {
                url: '/user',
                title: 'Data Pengguna',
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
                title: 'Edit Pengguna',
                views: {
                    '@main': {
                        templateUrl: '/public/apps/backend/modules/user/edit.html',
                        controller: 'UserEditController as userEditCtl'
                    }
                }
            },
            'login': {
                url: '/login',
                title: 'Login',
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