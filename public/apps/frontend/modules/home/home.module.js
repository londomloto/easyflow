
(function(){
    
    angular
        .module('home', ['app'])
        .controller('HomeController', HomeController)
        .run(run);

    /////////
        
    /** @ngInject */
    function HomeController($scope, theme) {
        theme.init($scope);
    }
    
    /** @ngInject */
    function run($rootScope) {

    }

}());