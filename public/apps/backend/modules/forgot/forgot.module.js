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
                    redir: router.getUrl('forgot.recover', {email: $scope.email})
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
    function RecoverController($scope, router, theme, api) {
        var token = router.getParam('token'),
            email = router.getParam('email');

        if (token) {        
            api.get('/user/verify-token', {token: token}).then(function(response){
                if ( ! response.data.success) {
                    router.go('forgot.notify', {type: 'expired'});
                }
            });
        }

        $scope.passwd1 = '';
        $scope.passwd2 = '';

        $scope.recoverPassword = function() {
            if ($scope.form.$valid) {
                var params = {
                    email: email,
                    passwd: $scope.passwd1
                };
                api.post('/user/recover-pass', params).then(function(response){
                    if (response.data.success) {
                        router.go('forgot.notify', {type: 'recover'});
                    } else {
                        theme.toast(response.data.message, 'danger');
                    }
                });
            }
        };
    }

    /** @ngInject */
    function NotifyController($scope) {

    }

}());