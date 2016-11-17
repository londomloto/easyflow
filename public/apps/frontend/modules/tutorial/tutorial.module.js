
(function(){

    angular
        .module('tutorial', ['app'])
        .controller('TutorialController', TutorialController);

    /** @ngInject */
    function TutorialController($scope, api) {
        $scope.tutorials = [];

        api.get('/tutorial/find').then(function(response){
            $scope.tutorials = response.data.data;
        });
    }

}());