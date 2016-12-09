
(function(){

    angular
        .module('app')
        .directive('uiTabs', uiTabs)
        .directive('uiPane', uiPane)
        .directive('uiBack', uiBack)
        .directive('uiHtml', uiHtml);


    /** @ngInject */
    function uiHtml($compile) {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, element, attrs) {
            var model = attrs.uiHtml;

            scope.$watch(model, function(html){ 
                element.html(html);
                $compile(element.contents())(scope);
            });
        }
    }

    /** @ngInject */
    function uiTabs($timeout) {
        var directive = {
            link: link,
            restrict: 'A',
            controller: TabsController,
            controllerAs: 'vm',
            scope: true,
            transclude: true,
            template: '<div class="ui-tabs">' + 
                            '<ul>' + 
                                '<li data-pane-index="{{ $index }}" data-ng-repeat="item in panes">' + 
                                    '<a data-ng-click="select(item)">{{ item.title }}</a>' + 
                                '</li>'+
                                '<li class="slider"></li>' +
                            '</ul>' + 
                            '<div data-ng-transclude></div>' +
                       '</div>'
        };

        return directive;

        /** @ngInject */
        function TabsController($scope) {
            var vm = this;
            var panes = $scope.panes = [];

            vm.addPane = function(pane) {
                panes.push(pane);
                if (panes.length === 1) {
                    $scope.select(pane);
                }
            };

            $scope.selection = null;

            $scope.select = function(pane) {
                angular.forEach(panes, function(p){
                    p.selected = false;
                });

                pane.selected = true;
                $scope.selection = pane;
            };
        }

        function link(scope, element, attrs) {
            var slider = element.find('.slider');
            scope.$watch('selection', function(pane){
                if (pane) {
                    $timeout(function(){
                        var index = scope.panes.indexOf(pane),
                            tab = element.find('[data-pane-index="' + index + '"]'),
                            tabWidth = tab.innerWidth();

                        slider.css({
                            left: index * tabWidth,
                            width: tabWidth
                        })
                    });
                }
            });
        }
    }

    /** @ngInject */
    function uiPane() {
        var directive = {
            link: link,
            restrict: 'A',
            require: '^uiTabs',
            scope: true,
            transclude: true,
            template: '<div data-ng-class="{ \'hidden\' : selected === false }" data-ng-transclude></div>'
        };

        return directive;

        function link(scope, element, attrs, tabs) {
            scope.title = attrs.title;
            scope.selected = false;
            tabs.addPane(scope);
        }
    }

    /** ngInject */
    function uiBack($templateRequest) {
        var directive = {
            link: link,
            restrict: 'A'
        };

        return directive;

        function link(scope, element, attrs) {
            
        }
    }

}());