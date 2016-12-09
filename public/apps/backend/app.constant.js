
(function(){

    var MODULES = [];
    var ROUTES = [];

    angular
        .module('app')
        .constant('CLIENT', {
            BASE: 'apps/backend',
            CONTEXT: 'BACKEND',
            MODULES: MODULES,
            ROUTES: ROUTES
        })
        .constant('SERVER', {
            BASE: '/server'
        });



}());