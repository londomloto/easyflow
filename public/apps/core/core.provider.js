
(function(){

    angular
        .module('core')
        .provider('api', apiProvider)
        .provider('site', siteProvider)
        .provider('auth', authProvider)
        .provider('router', routerProvider)
        .provider('loader', loaderProvider)
        .provider('googleApi', googleApiProvider)
        .provider('facebookApi', facebookApiProvider)
        .provider('theme', themeProvider);

    /** @ngInject */
    function routerProvider($stateProvider, $urlRouterProvider) {
        var provider = this,
            options = { 
                defaultState: { name: null, url: null },
                loginState: { name: null, url: null }
            };

        provider.$get = factory;
        provider.setup = setup;
        provider.register = register;

        function setup(config) {
            _.assign(options, config || {});

            if (options.defaultState) {
                $urlRouterProvider.otherwise(options.defaultState.url);
            }
        }

        function register(routes) {
            for (var state in routes) {
                if (routes.hasOwnProperty(state)) {
                    $stateProvider.state(state, routes[state]);
                }
            }
        }

        /** @ngInject */
        function factory($rootScope, $templateFactory, $state) {
            var service = {
                getDefaultState: getDefaultState,
                getDefaultUrl: getDefaultUrl,
                getLoginState: getLoginState,
                getLoginUrl: getLoginUrl,
                getParam: getParam,
                go: go
            };

            return service;

            function getDefaultState() {
                return options.defaultState.name;
            }

            function getDefaultUrl() {
                return options.defaultState.url;
            }

            function getLoginState() {
                return options.loginState.name;
            }

            function getLoginUrl() {
                return options.loginState.url;
            }

            function getParam(name) {
                var params = $state.params;
                return params[name];
            }

            function go(state) {
                $state.go(state);
            }

        }
    }

    /** @ngInject */
    function loaderProvider($ocLazyLoadProvider) {
        var provider = this;

        provider.$get = factory;
        provider.register = register;

        function register(modules) {
            $ocLazyLoadProvider.config({
                modules: modules
            });
        }

        /** @ngInject */
        function factory($ocLazyLoad) {
            var service = {
                load: load
            };

            return service;

            function load(modules) {
                return $ocLazyLoad.load(modules, {serie: true});
            }
        }
    }

    /** @ngInject */
    function apiProvider() {
        var provider = this,
            options = {};

        provider.$get = factory;
        provider.setup = setup;

        function setup(config) {
            _.assign(options, config || {});
        }

        /** @ngInject */
        function factory($rootScope, $http, $q, router, theme, SERVICE, HTTP_STATUS) {
            var service = { 
                get: get,
                del: del,
                put: put,
                post: post
            };

            var url = SERVICE.URL.replace(/\/$/, '');

            return service;

            function get(path, data, options) {
                if (data) {
                    var params = [];
                    
                    for (var key in data) {
                        params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
                    }

                    params = params.join('&');

                    if (params) {
                        path += (path.indexOf('?') > -1 ? '&' : '?') + params;
                    }
                }

                options = _.extend({
                    url: url + path,
                    method: 'GET'
                }, options || {});

                return request(options);
            }

            function del(path, data, options) {
                options = _.extend({
                    url: url + path,
                    method: 'DELETE'
                }, options || {});

                if (data) {
                    options.headers = options.headers || {};
                    options.headers['Content-Type'] = 'application/json;charset=utf-8';
                    options.data = data;
                }

                return request(options);
            }

            function put(path, data, options) {
                options = _.extend({
                    url: url + path,
                    data: data,
                    method: 'PUT'
                });

                return request(options);
            }

            function post(path, data, options) {
                var regularPost = false;

                options = _.extend({
                    url: url + path,
                    data: data,
                    method: 'POST'
                }, options || {});

                if (options.regularPost) {
                    regularPost = options.regularPost;
                    delete options.regularPost;
                }

                if (options.upload) {
                    regularPost = true;
                }

                if (regularPost) {
                    if (options.upload && options.upload.length) {
                        var fd = new FormData();

                        _.forEach(options.upload, function(o){
                            fd.append(o.key, o.file);
                        });

                        _.forOwn(data, function(v, k){
                            fd.append(k, v);
                        });

                        options.data = fd;
                        options.transformRequest = angular.identity;
                        options.headers = options.headers || {};
                        options.headers['Content-Type'] = undefined;  
                    } else {
                        options.transformRequest = function(data) {
                            var params = [];
                            for (var key in data) {
                                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
                            }
                            return params.join('&');
                        };
                        options.headers = options.headers || {};
                        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    }
                }

                return request(options);
            }

            function request(options) {
                var def = $q.defer();

                options.headers = options.headers || {};
                options.headers['X-Application'] = SERVICE.KEY;

                if ($rootScope.user && $rootScope.user.token) {
                    options.headers['Authorization'] = 'Bearer ' + $rootScope.user.token;
                }

                $http(options).then(
                    function(response) {
                        def.resolve(response);
                    },
                    function(response) {
                        var message = response.data.message,
                            code = +response.status;
                            
                        if (code == HTTP_STATUS.UNAUTHORIZED) {
                            if (message) alert(message);
                            router.go(router.getLoginState());
                        } else {
                            if (message) theme.showAlert('Peringatan', message);
                            def.reject(response);
                        }
                    }
                );

                return def.promise;
            }

        }
    }

    function authProvider() {
        var provider = this,
            options = {};

        provider.$get = factory;
        provider.setup = setup;

        function setup(config) {
            _.assign(options, config || {});
        }

        /////////
        
        /** @ngInject */
        function factory($rootScope, $timeout, $q, router, api) {
            var loading = null;
            var service = {
                login: login,
                logout: logout,
                social: social,
                verify: verify,
                register: register,
                invalidate: invalidate,
                isAuthenticated: isAuthenticated
            };

            return service;

            function isAuthenticated() {
                return $rootScope.user.id !== undefined;
            }

            function verify() {
                var def = $q.defer();

                if (isAuthenticated()) {
                    def.resolve($rootScope.user);
                } else {
                    if (loading) {
                        loading.then(function(user){
                            loading = null;
                            def.resolve(user);
                        });
                    } else {
                        loading = api.get('/auth/verify').then(function(response){
                            var user = response.data.user;
                            $rootScope.user = user;
                            return user;
                        });

                        loading.then(function(user){
                            loading = null;
                            def.resolve(user);
                        });
                    }
                }

                return def.promise;
            }

            function invalidate() {
                $rootScope.user = null;
            }

            function login(email, passwd) {
                return api.post('/auth/login', {email: email, passwd: passwd})
                   .then(function(response){
                        if (response.data.success) {
                            $rootScope.user = response.data.user;
                        } else {
                            $rootScope.user = null;
                        }
                        return response.data;
                   });
            }

            function logout() {
                return api.post('/auth/logout').then(function(response){
                    if (response.data.success) {
                        $rootScope.user = null;
                    }
                    return response.data;
                });
            }

            function register(data) {
                return api.post('/auth/register', data).then(function(response){
                    if (response.data.success) {
                        $rootScope.user = response.data.user;
                    }
                    return response.data;
                });   
            }

            function social(user) {
                return api.post('/auth/social', user).then(function(response){
                    if (response.data.success) {
                        $rootScope.user = response.data.user;
                    }
                    return response.data;
                });
            }
        }
    }

    /** @ngInject */
    function siteProvider() {
        var provider = this;
        provider.$get = factory;
        
        /////////
        
        /** @ngInject */
        function factory($rootScope, api) {
            var service = {
                verify: verify,
                getTitle: getTitle
            };

            return service;

            function verify() {
                return api.get('/site/verify').then(function(response){
                    $rootScope.site = response.data.site;
                    return response.data;
                });
            }

            function getTitle() {
                return $rootScope.site ? $rootScope.site.title : 'App';
            }

        }
    }

    /** @ngInject */
    function googleApiProvider(GOOGLE) {
        var provider = this;
        provider.$get = factory;

        /** @ngInject */
        function factory($window, $q) {
            var loaded = false,
                service = {
                    load: load,
                    auth: auth
                };

            return service;

            function load() {
                var def = $q.defer();

                if ( ! loaded) {
                    var script = document.createElement('script');
                    script.src   = GOOGLE.SDK_URL;
                    script.async = true;
                    script.defer = true;

                    $window.gapiOnLoad = function() {
                        loaded = true;
                        def.resolve(loaded);
                    };

                    document.body.appendChild(script);
                } else {
                    def.resolve(loaded);
                }

                return def.promise;
            }

            function auth(button) {
                var def = $q.defer();

                gapi.load('auth2', function(){
                    var auth = gapi.auth2.init({
                        client_id: GOOGLE.APP_ID,
                        fetch_basic_profile: true
                    });

                    auth.attachClickHandler(
                        button, 
                        {},
                        function(user) {
                            var profile = user.getBasicProfile();

                            def.resolve({
                                fullname: profile.getName(),
                                email: profile.getEmail(),
                                avatar: profile.getImageUrl() + '?sz=400'
                            });
                        },
                        function(error) {
                            def.resolve(false);
                        }
                    );
                });

                return def.promise;
            }

        }
    }

    /** @ngInject */
    function facebookApiProvider(FACEBOOK) {
        var provider = this;
        provider.$get = factory;

        /** @ngInject */
        function factory($q, $window, $filter) {
            var loaded = false;
            
            var service = {
                load: load,
                auth: auth
            };

            return service;

            function load() {
                var def = $q.defer();

                if ( ! loaded) {

                    $window.fbAsyncInit = function() {
                        loaded = true;
                        FB.init({
                            appId: FACEBOOK.APP_ID,
                            version: 'v2.8'
                        })
                        def.resolve();
                    };

                    var s = document.createElement('script');
                    s.src = FACEBOOK.SDK_URL;
                    s.async = true;
                    s.defer = true;
                    document.body.appendChild(s);
                } else {
                    def.resolve();
                }
                return def.promise;
            }

            function auth(button) {
                var def = $q.defer();

                $(button).on('click', function(e){
                    FB.login(function(response){
                        if (response.status == 'connected') {
                            FB.api(
                                '/me', 
                                {fields: 'name,email,picture.width(400).height(400)'},
                                function(response){

                                    var profile = {
                                        fullname: response.name,
                                        email: response.email,
                                        avatar: $filter('decodehtml')(response.picture.data.url)
                                    };

                                    def.resolve(profile);
                                }
                            );
                        } else {
                            def.resolve(false);
                        }
                    }, {scope: 'public_profile,email'});
                });

                // $(button).attr('onclick', 'fbLogin()');
                return def.promise;
            }
        }
    }

    function themeProvider() {
        var provider = this;
        provider.$get = factory;

        /////////
        
        /** @ngInject */
        function factory($q) {

            var modals = {};

            var service = {
                init: init,
                toast: toast,
                registerModal: registerModal,
                showModal: showModal,
                hideModal: hideModal,
                showConfirm: showConfirm,
                showAlert: showAlert
            };

            return service;

            function init(scope) {
                scope.$on('$viewContentLoaded', _.debounce(function(){
                    $.material.init();
                }, 0));
            }

            function toast(message, type) {
                $.snackbar({
                    content: message,
                    style: type || ''
                });
            }

            function registerModal(modal) {
                modals[modal.name] = modal;
            }

            function showAlert(title, message) {
                var modal = modals['alert'];
                if (modal) {
                    modal.show(title, message);
                }
            }

            function showConfirm(title, message) {
                var def = $q.defer();

                var modal = modals['confirm'];

                if (modal) {
                    modal.show(title, message, function(action){
                        def.resolve(action == 'yes' ? true : false);
                    });
                } else {
                    def.resolve(false);
                }

                return def.promise;
            }

            function showModal(name) {
                var modal = modals[name];
                if (modal) {
                    modal.show();
                }
            }

            function hideModal(name) {
                var modal = modals[name];
                if (modal) {
                    modal.hide();
                }
            }
        }
    }

}());