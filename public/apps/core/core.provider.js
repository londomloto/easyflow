
(function(){

    angular
        .module('core')
        .provider('url', urlProvider)
        .provider('api', apiProvider)
        .provider('site', siteProvider)
        .provider('auth', authProvider)
        .provider('router', routerProvider)
        .provider('loader', loaderProvider)
        .provider('googleApi', googleApiProvider)
        .provider('facebookApi', facebookApiProvider)
        .provider('httpInterceptor', httpInterceptor)
        .provider('session', sessionProvider)
        .provider('theme', themeProvider)
        .provider('debounce', debounceProvider)
        .provider('Store', StoreProvider)
        .provider('sse', sseProvider)
        .provider('markdown', markdownProvider);

    function httpInterceptor() {
        var provider = this,
            options = {
                context: 'FRONTEND'
            };

        provider.$get = factory;
        provider.setup = setup;

        function setup(config) {
            angular.extend(options, config || {});
        }

        /** @ngInject */
        function factory($timeout, $injector, HTTP) {
            var session, router, theme, auth;

            // trick: circular dependency
            $timeout(function(){
                session = $injector.get('session');
                router = $injector.get('router');
                theme = $injector.get('theme');
                auth = $injector.get('auth');
            }); 

            return {
                request: function(config) {
                    if (auth) {
                        var user = auth.getCurrentUser();
                        if (user) {
                            config.headers['Authorization'] = 'Bearer ' + user.token;
                        }
                    }

                    config.headers['X-Context'] = options.context;
                    config.headers['X-Accept'] = config.headers['Accept'];

                    return config;
                },
                response: function(response) {
                    var status = +(response.data.status || response.status || HTTP.STATUS_OK);
                    if (status !== HTTP.STATUS_OK) {
                        response.data = response.data || {};
                        if (status === HTTP.STATUS_NO_CONTENT) {
                            response.data.success = true;
                        } else {
                            var message = response.data.message;
                            if (message && theme) {
                                theme.toast(message, 'danger');
                            }
                        }
                    }
                    return response;
                },
                responseError: function(rejection) {
                    var message = rejection.data.message,
                        status = rejection.status;

                    if (status == HTTP.STATUS_UNAUTHORIZED) {
                        if (message) {
                            alert(message);
                        }

                        if (auth) {
                            auth.invalidate();
                        }

                        if (router) {
                            router.go(router.getLoginState());
                        }
                    } else {
                        if (message && theme) {
                            theme.toast(message, 'danger');
                        }
                    }

                    return rejection;
                }
            };
        };
    }

    function debounceProvider() {
        var provider = this;
        provider.$get = factory;

        /** @ngInject */
        function factory($timeout) {
            return function(func, wait, immediate) {
                var timeout, args, scope, result;
                function debounce() {
                    var later, callnow;

                    scope = this;
                    args = arguments;

                    later = function() {
                        timeout = null;
                        if ( ! immediate) {
                            result = func.apply(scope, args);
                        }
                    };

                    callnow = immediate && ! timeout;

                    if (timeout) {
                        $timeout.cancel(timeout);
                    }

                    timeout = $timeout(later, wait);

                    if (callnow) {
                        result = func.apply(scope, args);
                    }

                    return result;
                }

                debounce.cancel = function() {
                    $timeout.cancel(timeout);
                    timeout = null;
                };

                return debounce;
            }
        }
    }

    function sessionProvider() {
        var provider = this;

        provider.$get = factory;
        provider.setup = setup;

        function setup(config) {
            angular.extend(options, config || {});
        }

        /** @ngInject */
        function factory($window) {
            var storage = $window.localStorage,
                service = {
                    has: has,
                    get: get,
                    set: set,
                    del: del
                };

            return service;

            function has(key) {
                return !!storage.getItem(key);
            }

            function del(key) {
                if (has(key)) {
                    storage.removeItem(key);
                }
            }

            function get(key) {
                var data = storage.getItem(key);
                if (data) {
                    data = JSON.parse(data);
                    return data.value;
                }
                return null;
            }

            function set(key, val) {
                var data = {};
                data.value = val;
                storage.setItem(key, JSON.stringify(data));
            }
        }
    }

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
            angular.merge(options, config || {});

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
        function factory($rootScope, $state, url) {
            var service = {
                getDefaultState: getDefaultState,
                getDefaultUrl: getDefaultUrl,
                getLoginState: getLoginState,
                getLoginUrl: getLoginUrl,
                getStates: getStates,
                getParam: getParam,
                getUrl: getUrl,
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

            function getStates() {
                return $state.get();
            }

            function getParam(name) {
                var params = $state.params;
                return params[name];
            }

            function getUrl(name, params) {
                var base = url.getBaseUrl(),
                    path = $state.href(name, params || {});
                return base + path;
            }

            function go(state, params) {
                params = params || {};
                return $state.go(state, params);
            }

        }
    }

    /** @ngInject */
    function urlProvider($locationProvider) {
        var provider = this,
            options = {
                base: null,
                root: null
            };

        provider.$get = factory;
        provider.setup = setup;
        provider.getBaseUrl = getBaseUrl;
        provider.getRootUrl = getRootUrl;

        init();

        function init() {
            var parser = document.createElement('a');
            var base = '';
            var root = '';

            parser.setAttribute('href', '');

            base += parser.protocol + '//';
            base += parser.host;
            base += parser.pathname;

            options.base = base;

            root += parser.protocol + '//';
            root += parser.host;
            root += '/';

            options.root = root;

            parser = null;
        }

        function setup(config) {
            angular.merge(options, config || {});
        }

        function getBaseUrl() {
            return options.base || '/';
        }

        function getRootUrl() {
            return options.root || '/';
        }

        function getSiteUrl(path) {
            var html5 = $locationProvider.html5Mode(),
                base = getBaseUrl();

            path = (path || '').replace(/^\//, '');

            if (html5.enabled) {
                return base + path;
            } else {
                return base + '#/' + path;
            }
        }

        /** @ngInject */
        function factory() {
            var service = {
                getBaseUrl: getBaseUrl,
                getRootUrl: getRootUrl,
                getSiteUrl: getSiteUrl
            };

            return service;
        }
    }

    /** @ngInject */
    function loaderProvider($ocLazyLoadProvider) {
        var provider = this,
            options = {
                base: ''
            };

        provider.$get = factory;
        provider.setup = setup;
        provider.register = register;

        function setup(config) {
            angular.extend(options, config || {});
        }

        function register(modules) {
            $ocLazyLoadProvider.config({
                modules: modules
            });
        }

        function getBase() {
            return options.base;
        }

        /** @ngInject */
        function factory($ocLazyLoad) {
            var service = {
                load: load,
                getBase: getBase
            };

            return service;

            function load(modules) {
                return $ocLazyLoad.load(modules, {serie: true});
            }
        }
    }

    /** @ngInject */
    function apiProvider(urlProvider) {
        var provider = this,
            options = {
                base: ''
            };

        provider.$get = factory;
        provider.setup = setup;

        function setup(config) {
            angular.merge(options, config || {});

            if (options.base) {
                if ( ! /^http/.test(options.base)) {
                    var base = urlProvider.getRootUrl();
                    base += options.base.replace(/(^\/|\/$)/g, '');

                    options.base = base;
                    base = null;
                }
            }
        }

        function getBaseUrl() {
            return options.base;
        }

        /** @ngInject */
        function factory($timeout, $http, $q) {
            var service = { 
                get: get,
                del: del,
                put: put,
                post: post,
                getBaseUrl: getBaseUrl
            };

            var BASE_URL = options.base;
                
            return service;

            function fixpath(path) {
                path = '/' + path.replace(/^\//, '');
                return path;
            }

            function get(path, data, options) {
                if (data) {
                    var params = [];
                    var key, val;

                    for (key in data) {
                        val = data[key];

                        if (angular.isArray(val)) {
                            val = JSON.stringify(val);
                        }

                        params.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
                    }

                    params = params.join('&');

                    if (params) {
                        path += (path.indexOf('?') > -1 ? '&' : '?') + params;
                    }
                }

                options = angular.extend({
                    url: BASE_URL + fixpath(path),
                    method: 'GET'
                }, options || {});

                return request(options);
            }

            function del(path, data, options) {
                options = angular.extend({
                    url: BASE_URL + path,
                    method: 'DELETE'
                }, options || {});

                if (data) {
                    options.json = true;
                    options.data = data;
                }

                return request(options);
            }

            function put(path, data, options) {
                options = options || {};
                options.method = 'PUT';
                return post(path, data, options);
            }

            function post(path, data, options) {
                var regularPost = false;

                options = angular.extend({
                    url: BASE_URL + path,
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

                        angular.forEach(options.upload, function(o, k){
                            fd.append(o.key, o.file);
                        });

                        angular.forEach(data, function(v, k){
                            if (data.hasOwnProperty(k)) {
                                fd.append(k, v);
                            }
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
                
                if (options.download !== undefined) {
                    delete options.download;

                    var form = document.createElement('form'),
                        def = $q.defer();

                    form.setAttribute('action', options.url);
                    form.setAttribute('method', options.method);
                    // form.setAttribute('target', '_self');

                    document.body.appendChild(form);
                    form.submit();

                    $timeout(function(){
                        document.body.removeChild(form);
                        def.resolve();
                    });

                    return def.promise;
                } else {
                    if (options.json !== undefined) {
                        if (options.json === true) {
                            options.headers = options.headers || {};
                            options.headers['Content-Type'] = 'application/json;charset=utf-8';
                        }
                        delete options.json;
                    }

                    return $http(options);
                }
            }

        }
    }

    function authProvider() {
        var provider = this,
            options = {
                context: 'FRONTEND',
                sesskey: 'CURRENT_FRONTEND_USER'
            };

        provider.$get = factory;
        provider.setup = setup;

        function setup(config) {
            angular.extend(options, config || {});
            options.sesskey = 'CURRENT_' + options.context + '_USER';
        }

        function getContext() {
            return options.context;
        }

        /** @ngInject */
        function factory($rootScope, $timeout, $q, session, router, api) {
            var loading = null,
                SESSKEY = options.sesskey;

            var service = {
                save: save,
                login: login,
                logout: logout,
                social: social,
                verify: verify,
                register: register,
                invalidate: invalidate,
                isAuthenticated: isAuthenticated,
                getCurrentUser: getCurrentUser
            };

            return service;

            function isAuthenticated() {
                var user = session.get(SESSKEY);
                return !!user;
            }

            function getCurrentUser() {
                return session.get(SESSKEY);
            }

            function isExpire(user) {
                var expdate = new Date(user.expired_date),
                    current = new Date(),
                    expired = false;

                if (expdate.getTime() < current.getTime()) {
                    expired = true;
                }
                expdate = current = null;
                return expired;
            }

            function verify(sync) {
                var user = session.get(SESSKEY),
                    def = $q.defer();

                if (user && isExpire(user)) {
                    user = null;
                }

                if (user) {
                    save(user);
                    def.resolve(user);
                } else {
                    sync = sync === undefined ? true : sync;
                    if (sync) {
                        if (loading) {
                            loading.then(function(user){
                                loading = null;
                                def.resolve(user);
                            });
                        } else {
                            loading = api.get('/auth/verify').then(function(response){
                                var user = response.data.data;
                                save(user);
                                return user;
                            });

                            loading.then(function(user){
                                loading = null;
                                def.resolve(user);
                            });
                        }
                    } else {
                        if (loading) {
                            loading.then(function(user){
                                loading = null;
                                def.resolve(user);
                            });
                        } else {
                            save(null);
                            def.resolve(user);    
                        }
                    }
                }

                return def.promise;
            }

            function save(user) {
                if (user) {
                    $rootScope.user = user;
                    session.set(SESSKEY, user);
                } else {
                    $rootScope.user = null;
                    session.set(SESSKEY, null);
                }
            }

            function invalidate() {
                $rootScope.user = null;
                session.del(SESSKEY);
            }

            function login(email, passwd) {
                var data = {
                    email: email,
                    passwd: passwd
                };
                return api.post('/auth/login', data).then(function(response){
                    save(response.data.data);
                    return response.data;
                });
            }

            function logout() {
                return api.post('/auth/logout').then(function(response){
                    invalidate();
                    return response.data;
                });
            }

            function register(data) {
                return api.post('/auth/register', data).then(function(response){
                    if (response.data.success) {
                        save(response.data.data);
                    }
                    return response.data;
                });   
            }

            function social(user) {
                return api.post('/auth/social', user).then(function(response){
                    if (response.data.success) {
                        save(response.data.data);
                    }
                    return response.data;
                });
            }
        }
    }

    /** @ngInject */
    function siteProvider() {
        var provider = this,
            options = {
                context: 'FRONTEND',
                sesskey: 'CURRENT_FRONTEND_SITE'
            };

        provider.$get = factory;
        provider.setup = setup;
        provider.getContext = getContext;

        function setup(config) {
            angular.extend(options, config || {});
            options.sesskey = 'CURRENT_' + options.context + '_SITE';
        }

        function getContext() {
            return options.context;
        }
        
        /////////
        
        /** @ngInject */
        function factory($rootScope, session, api) {
            var service = {
                verify: verify,
                getContext: getContext,
                invalidate: invalidate,
                getTitle: getTitle
            };

            return service;

            function verify() {
                return api.get('/site/verify').then(function(response){
                    save(response.data.data);
                    return response.data;
                });
            }

            function save(site) {
                if (site) {
                    $rootScope.site = site;
                    session.set(options.sesskey, site);
                } else {
                    $rootScope.site = null;
                    session.set(options.sesskey, null);
                }
            }

            function invalidate() {
                save(null);
            }

            function getTitle() {
                var site = session.get(options.sesskey);
                return site ? site.title : 'Application';
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
        var provider = this,
            templates = [];
        provider.$get = factory;

        /////////
        
        /** @ngInject */
        function factory($q, $templateCache, debounce) {
            var modals = {};

            var service = {
                init: init,
                toast: toast,
                registerModal: registerModal,
                showModal: showModal,
                hideModal: hideModal,
                showConfirm: showConfirm,
                showAlert: showAlert,
                registerTemplate: registerTemplate,
                invalidateTemplates: invalidateTemplates
            };

            return service;

            function init(scope) {
                scope.$on('$viewContentLoaded', debounce(function(){
                    $.material.init();
                }, 0));
            }

            function registerTemplate(name) {
                if (templates.indexOf(name) === -1) {
                    templates.push(name);
                }
            }

            function invalidateTemplates() {
                for(var i = templates.length - 1; i >= 0; i--) {
                    $templateCache.remove(templates[i]);
                    templates.splice(i, 1);
                }
            }

            function toast(message, type) {
                $.snackbar({
                    content: message,
                    style: type || ''
                });
            }

            function registerModal(name, modal) {
                modals[name] = {
                    modal: modal,
                    listeners: {
                        show: null,
                        hide: null
                    }
                };
            }

            function fireModal(name, eventType) {
                var found = modals[name];
                if (found) {
                    var handler = found.listeners[eventType];
                    if (handler && handler.then) {
                        handler.resolve();
                    }
                }
            }

            function showAlert(title, message) {
                var found = modals['alert'];
                if (found) {
                    found.modal.show(title, message);
                }
            }

            function showConfirm(title, message) {
                var def = $q.defer();
                var found = modals['confirm'];

                if (found) {
                    found.modal.show(title, message, function(action){
                        def.resolve(action == 'yes' ? true : false);
                    });
                } else {
                    def.resolve(false);
                }

                return def.promise;
            }

            function showModal(name) {
                var def = $q.defer();
                var found = modals[name];

                if (found) {
                    found.listeners.show = def;
                    found.modal.show();
                }

                return def.promise;
            }

            function hideModal(name) {
                var def = $q.defer();
                var found = modals[name];
                
                if (found) {
                    found.listeners.hide = def;
                    found.modal.hide();
                }

                return def.promise;
            }
        }
    }

    function StoreProvider() {
        var provider = this;
        provider.$get = factory;

        function factory($q, api) {
            var Store = function(config) {
                this.start = 0;
                this.total = 0;
                this.count = 0;
                this.page  = 1;

                this.listeners = [];

                this.config = angular.extend({
                    url: '',
                    type: 'GET',
                    params: {},
                    pageSize: 10,
                    autoLoad: false
                }, config || {});

                if (this.config.autoLoad) {
                    this.load();
                }
            };

            Store.prototype.constructor = Store;

            Store.prototype.on = function(event, handler, context) {
                context = context || this;

                var options = {
                    event: event,
                    handler: handler,
                    context: context
                };

                this.listeners.push(options);
            };

            Store.prototype.off = function(event, handler) {
                var lsnr = this.listeners;

                for (var i = lsnr.length - 1; i >= 0; i--) {
                    if (lsnr[i].event == event) {
                        if (handler) {
                            if (lsnr[i].handler === handler) {
                                lsnr.splice(i, 1);
                            }
                        } else {
                            lsnr.splice(i, 1);    
                        }
                    }
                }
            };

            Store.prototype.fire = function(/* event, args */) {
                var lsnr = this.listeners,
                    args = Array.prototype.slice.call(arguments),
                    fire = args.shift();

                for (var i = 0, ii = lsnr.length; i < ii; i++) {
                    if (lsnr[i].event == fire) {
                        lsnr[i].handler.apply(lsnr[i].context, args);
                    }
                }
            };

            Store.prototype.load = function(options) {
                var def = $q.defer(),
                    me = this;

                if (this.config.url) {
                    var method = this.config.type.toLowerCase();

                    this.fire('beforeload', options);

                    options = angular.extend({}, this.config.params, options || {});

                    options.page  = options.page || this.page;
                    options.start = options.start !== undefined ? options.start : (options.page - 1) * this.config.pageSize;
                    options.limit = options.limit || this.config.pageSize;

                    // save
                    this.page  = options.page;
                    this.start = options.start;

                    api[method](this.config.url, options).then(function(response){
                        var result = response.data;
                        var data = result.data || [];
                        var total = result.total || 0;
                        
                        me.total = total;
                        me.count = data.length;

                        me.fire('load', data);
                        def.resolve(data);
                    });
                } else {
                    me.fire('load');
                    def.resolve([]);
                }

                return def.promise;
            };

            Store.prototype.setParam = function(name, value) {
                if (angular.isObject(name)) {
                    for (var prop in name) {
                        if (name.hasOwnProperty(prop)) {
                            this.config.params[prop] = name[prop];
                        }
                    }
                } else {
                    this.config.params[name] = value;
                }
            };

            Store.prototype.loadPage = function(page, options) {
                options = options || {};
                
                if (page < 1) {
                    page = 1;
                }
                
                this.page = page;

                angular.extend(options, {
                    page: page,
                    start: (page - 1) * this.config.pageSize,
                    limit: this.config.pageSize
                });

                return this.load(options);
            };

            Store.prototype.getPage = function() {
                return this.page;
            };

            Store.prototype.getPages = function() {
                var total = this.getTotal();
                return Math.ceil(total / this.getPageSize())
            };

            Store.prototype.getStart = function() {
                return (this.page - 1) * this.config.pageSize;
            };

            Store.prototype.getPageSize = function() {
                return this.config.pageSize;
            };

            Store.prototype.getCount = function() {
                return this.count;
            };

            Store.prototype.getTotal = function() {
                return this.total;
            };

            return Store;
        }
    }

    function sseProvider() {
        var provider = this;
        provider.$get = factory;

        /** @ngInject */
        function factory($window) {
            var source = null;
            var service = {
                connect: connect
            };

            return service;

            function connect() {
                if ($window.EventSource) {
                    source = new EventSource('/server/pool/stream');
                }
            }
        }
    }

    function markdownProvider() {
        var provider = this;
        var markdown;

        provider.$get = function() {
            if ( ! markdown) {
                if (showdown) {
                    showdown.setFlavor('github');
                    var converter = new showdown.Converter();
                    markdown = angular.bind(converter, converter.makeHtml);
                } else {
                    markdown = angular.indentity;
                }
            }

            return function(text) {
                return markdown(text);
            }
        };
    }

}());