(function(){

    angular
        .module('forgot', ['app'])
        .controller('ForgotController', ForgotController)
        .controller('RecoverController', RecoverController)
        .controller('NotifyController', NotifyController);

    /** @ngInject */
    function ForgotController($scope, router, theme, api) {
        $scope.email = '';
        $scope.sendRequest = function() {
            if ($scope.email) {
                var params = {
                    email: $scope.email,
                    redir: router.getUrl('forgot.recover')
                };

                api.get('/user/request-pass', params).then(function(response){
                    if (response.data.success) {
                        router.go('forgot.notify', {type: 'request'});
                    } else {
                        theme.toast(response.data.message, 'danger');
                    }
                });
            }
        };
    }

    /** @ngInject */
    function RecoverController($scope, router, api) {
        var token = router.getParam('token');
        if (token) {        
            api.get('/user/verify-token', {token: token});
        }       
    }

    /** @ngInject */
    function NotifyController($scope) {

    }

}());