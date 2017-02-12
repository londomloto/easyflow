
(function(){

    angular
        .module('editor', [])
        .controller('EditorController', EditorController)
        .run(run);

    /////////
    
    /** @ngInject */
    function EditorController($scope, theme, api) {
        $scope.diagrams = [];
        $scope.diagram = null;
        $scope.paper = null;
        $scope.pallet = null;

        $scope.loadDiagrams = function() {
            api.get('/user/diagram/find').then(function(response){
                $scope.diagrams = response.data.data;
            });
        };

        $scope.open = function() {
            theme.showModal('open-diagram').then(function(){
                $scope.loadDiagrams();
            });
        };

        $scope.openDiagram = function(diagram) {
            $scope.diagram = diagram;
            theme.hideModal('open-diagram');
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