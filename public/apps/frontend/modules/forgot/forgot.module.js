(function(){

    angular
        .module('forgot', ['app'])
        .controller('ForgotController', ForgotController)
        .controller('RecoverController', RecoverController);

    /** @ngInject */
    function ForgotController($scope, router, theme, api) {
        
        $scope.email = '';
        $scope.info = '';

        $scope.requestPassword = function() {
            if ($scope.email) {
                var params = {
                    email: $scope.email,
                    url: router.getUrl('forgot.recover', {email: $scope.email})
                }
                api.get('/user/request-pass', params).then(function(response){
                    if ( ! response.data.success) {
                        theme.toast(response.data.message, 'danger');
                    } else {
                        router.go('forgot.notify', {type: 'request'});
                    }   
                });
            }
        };

    }

    /** @ngInject */
    function RecoverController($scope, router, theme, api) {
        theme.init($scope);

        var token = router.getParam('token'),
            email = router.getParam('email');

        $scope.recover = {
            expired: false,
            passwd1: '',
            passwd2: ''
        };

        if (token) {
            api.get('/user/verify-token', {token: token}).then(function(response){
                $scope.recover.expired = !response.data.success;
            });
        } else {
            $scope.recover.expired = true;
        }

        $scope.recoverPassword = function(form) {
            if (form.$valid) {
                var params = {
                    email: email,
                    passwd: $scope.recover.passwd1
                };

                api.post('/user/recover-pass', params).then(function(response){
                    if (response.data.success) {
                        router.go('forgot.notify', {type: 'recover'});
                    } else {
                        theme.toast(response.data.message);
                    }
                });
            }
        };

    }

}());