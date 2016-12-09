
(function(){
    
    angular
        .module('home', ['app'])
        .controller('HomeController', HomeController)
        .run(run);

    /////////
        
    /** @ngInject */
    function HomeController($scope, theme, api) {
        theme.init($scope);

        $scope.contact = {
            fullname: '',
            email: '',
            message: ''
        };
        
        $scope.sendMessage = function() {
            if ($scope.form.$valid) {
                var data = angular.copy($scope.contact);
                api.post('/mail/message', data).then(function(response){
                    if (response.data.success) {
                        theme.showAlert('Terima kasih', 'Terima kasih atas saran dan kritik yang Anda berikan');
                    }
                });
            }
        };
    }

    
    /** @ngInject */
    function run($rootScope) {

    }

}());