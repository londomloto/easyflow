
(function(){

    angular
        .module('editor', [])
        .controller('EditorController', EditorController)
        .run(run);

    /////////
    
    /** @ngInject */
    function EditorController($scope, theme) {
        $scope.diagrams = [];
        $scope.paper = null;
        $scope.pallet = null;

        $scope.loadDiagrams = function() {
            $http.get('../server/load').then(function(response){
                $scope.diagrams = response.data.data;
            });
        };

        $scope.open = function() {
            theme.showModal('open-diagram').then(function(){
                $scope.loadDiagrams();
            });
        };

        $scope.create = function() {
            theme.showModal('create-diagram');
        };

        $scope.trash = function() {
            if ($scope.paper) {
                $scope.paper.removeSelection();
            }
        };

        $scope.export = function() {
            if ($scope.paper) {
                $scope.paper.saveAsImage('example.png');
            }
        };

        $scope.activateTool = function(name) {
            if ($scope.paper) {
                $scope.paper.tool().activate(name);
            }
        };

        $scope.deactivateTool = function(name) {
            if ($scope.paper) {
                $scope.paper.tool().deactivate(name);
            }
        };

        $scope.hideModal = function(name) {
            theme.hideModal(name);
        };
    }
    
    function run() {
        
    }

}());