
(function(){

    var E = Graph.lang.Event = function(type, data){
        this.type = type;
        this.init(data);
    };

    E.toString = function() {
        return 'function(type, data)';
    };
    
    _.extend(E.prototype, {
        
        cancelBubble: false,
        defaultPrevented: false,

        // sync with `interactjs`
        propagationStopped: false,
        immediatePropagationStopped: false,

        data: null,

        init: function(data) {
            this.data = data;
            _.assign(this, data || {});
        },

        stopPropagation: function() {
            this.cancelBubble = this.propagationStopped = true;
        },

        stopImmediatePropagation: function() {
            this.immediatePropagationStopped = this.propagationStopped = true;
        },

        preventDefault: function() {
            this.defaultPrevented = true;
        },

        toString: function() {
            return 'Graph.lang.Event';
        }
    });

    ///////// SHORTCUT /////////
    
    Graph.event = function(type, data) {
        return new Graph.lang.Event(type, data);
    };
    
}());