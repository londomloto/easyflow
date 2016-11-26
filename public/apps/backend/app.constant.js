
(function(){
    angular
        .module('app')
        .constant('CLIENT', {
            BASE: 'apps/backend',
            CONTEXT: 'BACKEND'
        })
        .constant('SERVER', {
            BASE: '/server'
        });
}());