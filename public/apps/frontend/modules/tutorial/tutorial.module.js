
(function(){

    angular
        .module('tutorial', ['app'])
        .controller('TutorialController', TutorialController)
        .directive('uiVideo', uiVideoDirective);

    /** @ngInject */
    function TutorialController($scope, api) {
        $scope.tutorials = [];

        api.get('/tutorial/find').then(function(response){
            $scope.tutorials = response.data.data;
        });
    }

    /** @ngInject */
    function uiVideoDirective($timeout) {
        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                source: '@',
                poster: '@',
                type: '@'
            }
        };

        return directive;

        function link(scope, element, attrs) {
            if (scope.source) {
                element.append(
                    '<source src="' + scope.source + '" type="' + scope.type + '"></source>'
                );
                videojs(element[0], {controls: true, preload: 'auto', poster: scope.poster});    
            }
        }
    }

}());