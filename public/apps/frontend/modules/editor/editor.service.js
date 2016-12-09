
(function(){

    angular
        .module('editor')
        .service('toolManager', toolManager);

    function toolManager() {
        this.tools = {};

        this.add = function(name, tool) {
            this.tools[name] = tool;
        };

        this.activate = function(name) {
            for (var prop in this.tools) {
                if (this.tools.hasOwnProperty(prop)) {
                    this.tools[prop].deactivate();
                }
            }
            this.tools[name] && this.tools[name].activate();
        };

        this.deactivate = function(name) {
            this.tools[name] && this.tools[name].deactivate();
        };
    }

}());