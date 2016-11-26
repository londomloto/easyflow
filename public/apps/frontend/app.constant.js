
(function(){
    angular
        .module('app')
        .constant('CLIENT', {
            BASE: 'apps/frontend',
            CONTEXT: 'FRONTEND'
        })
        .constant('SERVER', {
            BASE: '/server'
        });
        
}());