
EF.Draggable = (function(_){

    var Draggable = EF.Class.extend({
        constructor: function(vector, config) {
            var me = this;
            var node = vector.node[0];
            var defaults = {
                snap: [10, 10],
                inertia: true,
                // manualStart: true,
                restrict: {
                    restriction: 'parent',
                    endOnly: true
                }
            };

            this.config = _.extend(defaults, config || {});

            if (this.config.snap) {
                this.config.snap = {
                    targets: [
                        interact.createSnapGrid({x: this.config.snap[0], y: this.config.snap[1]})
                    ]
                }    
            }

            /*this.config.onmove = function(e) {
                console.log(e.target);
            };*/
            
            interact(node).draggable(this.config)/*.on('move', function(e){
                var interaction = e.interaction;
                if (interaction.pointerIsDown && ! interaction.interacting()) {
                    var original = e.currentTarget;
                    var cloned = e.currentTarget.cloneNode(true);
                    vector.container.node.append(cloned);
                    interaction.start({ name: 'drag' }, e.interactable, cloned);
                }
            });*/
        }
    }); 

    return Draggable;
}(_));