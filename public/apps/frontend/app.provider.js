
(function(){

    angular
        .module('app')
        .provider('auth', authProvider);

    function authProvider() {
        var provider = this;
        provider.$get = factory;

        /////////
        
        /** @ngInject */
        function factory($rootScope, api) {
            var service = {
                login: login,
                logout: logout,
                register: register,
                social: social
            };

            return service;

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
    
}());