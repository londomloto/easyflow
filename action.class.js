
EF.Action = (function(){

    var Class = EF.Shape.extend({

        __super__: EF.Shape,

        constructor: function() {
            this.vector = new EF.Vector('g');
        }
    });
    
    return Class;
}());