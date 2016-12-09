
(function(){

    angular
        .module('editor')
        .directive('uiEditor', uiEditor)
        .directive('uiPallet', uiPallet)
        .directive('uiPaper', uiPaper);

    function uiEditor() {
        var directive = {
            link: link,
            restrict: 'A',
            controller: Controller,
            controllerAs: 'vm',
            scope: true
        };

        return directive;

        /** @ngInject */
        function Controller($scope) {
            var vm = this;
            vm.paper = null;

            $scope.createDiagram = function() {
                if (vm.paper && vm.pallet) {

                }
            };

        }

        function link(scope, element, attrs) {

        }
    }

    function uiPallet() {
        var directive = {
            link: link,
            restrict: 'A',
            require: '^uiEditor'
        };

        return directive;

        function link(scope, element, attrs, ctrl) {
            var pallet;

            pallet = Graph.pallet('activity');
            pallet.render(element);

            ctrl.pallet = pallet;

            /*pallet.on({
                shapeclick: function(e) {
                    console.log(e);
                }
            });*/

        }
    }

    /** @ngInject */
    function uiPaper() {
        var directive = {
            link: link,
            restrict: 'A',
            require: '^uiEditor'
        };

        return directive;

        function link(scope, element, attrs, ctrl) {
            var paper = Graph.paper();
            paper.render(element);

            paper.addPallet(ctrl.pallet);
            ctrl.paper = paper;
        }
    }

}());