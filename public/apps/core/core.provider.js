
(function(){

    angular
        .module('core')
        .provider('api', apiProvider)
        .provider('site', siteProvider)
        .provider('googleApi', googleApiProvider)
        .provider('facebookApi', facebookApiProvider)
        .provider('theme', themeProvider);

    /** @ngInject */
    function apiProvider() {
        var provider = this;

        provider.$get = factory;

        /** @ngInject */
        function factory($rootScope, $http, API_URL) {
            var service = { 
                get: get,
                post: post
            };

            return service;

            function get(path, data) {
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
                return $http.get(API_URL + path);
            }

            function post(path, data, options) {
                var regularPost = false;

                options = options || {};

                _.assign(options, {
                    url: API_URL + path,
                    data: data,
                    method: 'POST'
                });

                if (options.regularPost) {
                    regularPost = options.regularPost;
                    delete options.regularPost;
                }

                if (options.upload) {
                    regularPost = true;
                }

                if ($rootScope.user && $rootScope.user.access_token) {
                    options.headers = options.headers || {};
                    options.headers['Authorization'] = 'Bearer ' + $rootScope.user.access_token;
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
                
                return $http(options);
            }

        }
    }

    /** @ngInject */
    function siteProvider() {
        var provider = this;

        provider.$get = factory;
        
        /////////
        
        /** @ngInject */
        function factory(api) {
            var service = {
                getInfo: getInfo
            };

            return service;

            function getInfo() {
                return api.get('/site/info/').then(function(res){
                    return res.data;
                });
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
                        client_id: GOOGLE.API_KEY,
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
                            appId: FACEBOOK.API_KEY,
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
                // confirm: showConfirm,
                registerModal: registerModal,
                showModal: showModal,
                hideModal: hideModal,
                showConfirm: showConfirm
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

            function showConfirm(name) {
                var def = $q.defer();

                var modal = modals[name];

                if (modal) {
                    modal.show({
                        callback: function(action) {
                            def.resolve(action);
                        }
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