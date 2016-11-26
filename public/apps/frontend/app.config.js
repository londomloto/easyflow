
(function(){

    angular
        .module('app')
        .config(config);

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
                name: 'editor.styles',
                files: [
                    'assets/vendor/bpmn/bpmn.css',
                    'assets/vendor/graph/css/graph.css',
                    'assets/css/frontend-editor.css'
                ],
                insertBefore: '#header-files'
            },
            {
                name: 'profile.styles',
                files: [
                    'assets/vendor/simplelightbox/simplelightbox.css'
                ],
                insertBefore: '#header-files'
            },
            {
                name: 'tutorial.styles',
                files: [
                    'assets/vendor/videojs/video-js.min.css',
                    'assets/css/frontend-tutorial.css'
                ],
                insertBefore: '#header-files'
            },
            ///////// MODULES /////////
            {
                name: 'home.module',
                files: ['apps/frontend/modules/home/home.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'register.module',
                files: ['apps/frontend/modules/register/register.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'login.module',
                files: ['apps/frontend/modules/login/login.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'forgot.module',
                files: ['apps/frontend/modules/forgot/forgot.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'profile.module',
                files: [
                    'assets/vendor/simplelightbox/simple-lightbox.js',
                    'apps/frontend/modules/profile/profile.module.js'
                ],
                insertBefore: '#body-files'
            },
            {
                name: 'editor.module',
                files: [
                    'assets/vendor/graph/vendor/lodash/lodash.js',
                    'assets/vendor/graph/vendor/interact/interact.js',
                    'assets/vendor/graph/vendor/jed/jed.js',
                    
                    'apps/frontend/modules/editor/editor.config.js',
                    'assets/vendor/graph/dist/graph.min.js',
                    'apps/frontend/modules/editor/editor.module.js'
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
                        return loader.load(['home.module']);
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
                        return loader.load(['register.module']);
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
                        return loader.load(['login.module']);
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
                        return loader.load(['forgot.module']);
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
            'profile': {
                url: '/profile',
                title: 'Profile',
                style: 'profile',
                templateUrl: 'apps/frontend/modules/profile/profile.html',
                controller: 'ProfileController as profileCtl',
                resolve: {
                    /** @ngInject */
                    dependencies: function(loader) {
                        return loader.load([
                            'profile.styles',
                            'profile.module'
                        ]);
                    }
                }
            },
            'profile.home': {
                url: '/home',
                title: 'Halaman Profile',
                style: 'profile',
                templateUrl: 'apps/frontend/modules/profile/profile.home.html',
            },
            'profile.edit': {
                url: '/edit',
                title: 'Edit Profile',
                style: 'profile',
                authenticate: true,
                templateUrl: 'apps/frontend/modules/profile/profile.edit.html',
                controller: 'EditProfileController as editProfileCtl'
            },
            'profile.diagram': {
                url: '/diagram',
                title: 'Katalog Diagram',
                style: 'profile',
                templateUrl: 'apps/frontend/modules/profile/profile.diagram.html',
                controller: 'DiagramController as diagramCtl'
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
                            'editor.module'
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
                            'tutorial.styles',
                            'tutorial.module'
                        ]);
                    }
                }
            }
        });
    }

}());