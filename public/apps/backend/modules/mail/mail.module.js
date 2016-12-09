(function(){

    angular
        .module('mail', ['app'])
        .controller('MailController', MailController)
        .controller('InboxController', InboxController)
        .controller('OutboxController', OutboxController)
        .controller('ComposeController', ComposeController)
        .controller('TrashController', TrashController);

    /** @ngInject */
    function MailController($scope) {
        
    }

    /** @ngInject */
    function ComposeController($scope) {

    }

    /** @ngInject */
    function InboxController($scope, Store, router, theme, api) {
        var id = router.getParam('id');

        if (id) {

            $scope.message = null;
            $scope.reply = {
                subject: 'Balasan: '
            };

            api.get('/mail/inbox/find/' + id).then(function(response){
                $scope.message = response.data.data;
                $scope.reply.subject = 'Balasan: ' + $scope.message.subject;
            });

            $scope.sendReply = function() {
                if ( ! $scope.form.$valid) return;
                
                var data = angular.copy($scope.reply);
                data.to = $scope.message.email;

                api.post('/mail/inbox/reply', data).then(function(response){
                    if (response.data.success) {
                        theme.showAlert('Informasi', 'Pesan balasan sudah dikirimkan ke alamat email ' + $scope.message.email);
                    } else {
                        theme.toast(response.data.message, 'danger');
                    }
                });
            };

            $scope.deleteMessage = function(message) {
                api.del('/mail/inbox/delete/' + message.id).then(function(response){
                    if (response.data.success) {
                        router.go('main.mail.inbox');
                    }
                });
            };

        } else {
            $scope.messages = [];

            $scope.colors = [
                'info',
                'warning',
                'primary',
                'warn',
                'success',
                'accent',
                'danger'
            ];

            var colorMin = 0;
            var colorMax = $scope.colors.length - 1;

            $scope.pickColor = function() {
                var index = Math.floor(Math.random() * (colorMax - colorMin + 1)) + colorMin;
                return $scope.colors[index];
            };

            $scope.inboxStore = new Store({
                url: '/mail/inbox/find',
                pageSize: 20
            });

            $scope.inboxStore.on('load', function(data){
                $scope.messages = data;
            });

            $scope.inboxStore.load();
        }

        
    }

    /** @ngInject */
    function OutboxController($scope) {

    }

    /** @ngInject */
    function TrashController($scope, Store, theme, api) {
        $scope.messages = [];

        $scope.trashStore = new Store({
            url: '/mail/find-trash',
            pageSize: 20
        });

        $scope.trashStore.on('load', function(data){
            var count = data.length;

            while(count--) {
                data[count].selected = false;
            }

            $scope.messages = data;
        });

        $scope.deleteSelection = function() {
            var selection = $scope.messages.filter(function(message){
                return message.selected;
            });

            var keys = selection.map(function(item){ return item.id; });

            if (keys.length) {
                api.post('/mail/delete-trash', {keys: keys}).then(function(){
                    $scope.trashStore.load({page: 1});
                });
            }
        };

        $scope.emptyTrash = function() {
            theme.showConfirm('Konfirmasi', 'Kosongkan kotak sampah?').then(function(action){
                if (action) {
                    api.post('/mail/empty-trash').then(function(){
                        $scope.trashStore.load({page: 1});
                    });
                }
            });
        };

        $scope.trashStore.load();
    }

}());