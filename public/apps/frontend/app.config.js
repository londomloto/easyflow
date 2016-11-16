
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
            ///////// STYLES /////////
            {
                name: 'editor.styles',
                files: [
                    '/public/assets/vendor/bpmn/bpmn.css',
                    '/public/assets/vendor/graph/css/graph.css',
                    '/public/assets/css/frontend-editor.css'
                ],
                insertBefore: '#header-files'
            },
            {
                name: 'profile.styles',
                files: [
                    '/public/assets/vendor/simplelightbox/simplelightbox.css'
                ],
                insertBefore: '#header-files'
            },
            {
                name: 'tutorial.styles',
                files: [
                    '/public/assets/vendor/videojs/video-js.min.css',
                    '/public/assets/css/frontend-tutorial.css'
                ],
                insertBefore: '#header-files'
            },
            ///////// MODULES /////////
            {
                name: 'home.module',
                files: ['/public/apps/frontend/modules/home/home.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'register.module',
                files: ['/public/apps/frontend/modules/register/register.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'login.module',
                files: ['/public/apps/frontend/modules/login/login.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'forgot.module',
                files: ['/public/apps/frontend/modules/forgot/forgot.module.js'],
                insertBefore: '#body-files'
            },
            {
                name: 'profile.module',
                files: [
                    '/public/assets/vendor/simplelightbox/simple-lightbox.js',
                    '/public/apps/frontend/modules/profile/profile.module.js'
                ],
                insertBefore: '#body-files'
            },
            {
                name: 'editor.module',
                files: [
                    '/public/assets/vendor/graph/vendor/interact/interact.js',
                    '/public/assets/vendor/graph/vendor/jed/jed.js',
                    '/public/apps/frontend/modules/editor/editor.config.js',
                    '/public/assets/vendor/graph/dist/graph.min.js',
                    '/public/apps/frontend/modules/editor/editor.module.js'
                ],
                insertBefore: '#body-files'
            },
            {
                name: 'tutorial.module',
                files: [
                    '/public/assets/vendor/videojs/video.min.js',
                    '/public/apps/frontend/modules/tutorial/tutorial.module.js'
                ],
                insertBefore: '#body-files'
            }
        ]);


        ///////////////////////////////////////
        /// ROUTES
        ///////////////////////////////////////
        
        routerProvider.fallback('/home');
        
        routerProvider.register({
            'home': {
                url: '/home',
                title: 'Home',
                style: 'home',
                templateUrl: '/public/apps/frontend/modules/home/home.html',
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
                templateUrl: '/public/apps/frontend/modules/register/register.html',
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
                templateUrl: '/public/apps/frontend/modules/login/login.html',
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
                templateUrl: '/public/apps/frontend/modules/forgot/forgot.html',
                controller: 'ForgotController as forgotCtl',
                resolve: {
                    /** @ngInject */
                    dependencies: function(loader) {
                        return loader.load(['forgot.module']);
                    }
                }
            },
            'profile': {
                url: '/profile',
                title: 'Profile',
                style: 'profile',
                templateUrl: '/public/apps/frontend/modules/profile/profile.html',
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
                templateUrl: '/public/apps/frontend/modules/profile/profile.home.html',
            },
            'profile.edit': {
                url: '/edit',
                title: 'Edit Profile',
                style: 'profile',
                templateUrl: '/public/apps/frontend/modules/profile/profile.edit.html',
                controller: 'EditProfileController as editProfileCtl'
            },
            'profile.diagram': {
                url: '/diagram',
                title: 'Katalog Diagram',
                style: 'profile',
                templateUrl: '/public/apps/frontend/modules/profile/profile.diagram.html',
                controller: 'DiagramController as diagramCtl'
            },
            'editor': {
                url: '/editor',
                title: 'Editor',
                style: 'editor',
                templateUrl: '/public/apps/frontend/modules/editor/editor.html',
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
                templateUrl: '/public/apps/frontend/modules/tutorial/tutorial.html',
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