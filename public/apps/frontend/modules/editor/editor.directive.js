
(function(){

    angular
        .module('editor')
        .directive('uitool', uitool)
        .directive('uipaper', uipaper)
        .directive('uipallet', uipallet);

    function uitool(toolManager) {
        var directive = {
            restrict: 'A',
            link: link,
            scope: true
        };
        
        return directive;

        function link(scope, element, attrs) {
            var name = attrs.uitool;
            toolManager.add(name, scope);

            scope.activate = function() {
                element.addClass('active');
            };

            scope.deactivate = function() {
                element.removeClass('active');
            };
        }
    }

    function uipallet() {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, element, attrs) {
            var pallet = Graph.pallet('activity');
            pallet.render(element);

            scope.pallet = pallet;
        }
    }

    function uipaper(toolManager) {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, element, attrs) {
            var paper = Graph.paper();
            scope.paper = paper;

            paper.on({
                activatetool: function(e) {
                    toolManager.activate(e.name);  
                },
                deactivatetool: function(e) {
                    toolManager.deactivate(e.name);
                }
            });

            paper.render(element);

            ///////// examples /////////
            
            var s1 = Graph.shape('activity.action', {left: 300, top: 100});
            var s2 = Graph.shape('activity.action', {left: 100, top: 300});
            var s3 = Graph.shape('activity.action', {left: 300, top: 400});
            var s4 = Graph.shape('activity.action', {left: 500, top: 100});
            var s5 = Graph.shape('activity.start', {left: 600, top: 300});
            var s6 = Graph.shape('activity.lane', {left: 100, top: 100});
            var s7 = Graph.shape('activity.router', {left: 500, top: 400});
            var s8 = Graph.shape('activity.final', {left: 300, top: 400});

            s1.render(paper);
            
            s2.render(paper);
            s3.render(paper);
            s4.render(paper);
            s5.render(paper);
            s6.render(paper);
            s7.render(paper);
            s8.render(paper);

            var s9 = s6.addSiblingBellow();
            s9.height(100);
            var s10 = s9.addSiblingBellow();
        }
    }

}());