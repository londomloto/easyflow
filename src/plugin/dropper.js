
(function(){

    Graph.plugin.Dropper = Graph.extend({

        props: {
            overlap: 'center',
            accept: '.graph-draggable'
        },

        config: {},

        constructor: function(vector, config) {
            var me = this;

            me.vector = vector;
            me.vector.addClass('graph-dropzone').removeClass('graph-draggable');
                
            config = config || {};

            _.forEach(['accept', 'overlap'], function(name){
                me.props[name] = config[name];
                delete config[name];
            });

            me.config = _.extend({}, config);

            me.vector.on({
                render: _.bind(me.onVectorRender, me)
            });

            if (me.vector.rendered) {
                me.setup();
            }
        },

        setup: function() {
            var me = this;

            if (me.plugin) {
                return;
            }

            me.plugin = interact(me.vector.node()).dropzone({

                checker: _.bind(me.onDropValidate, me),

                ondropactivate: _.bind(me.onDropActivate, me),
                ondropdeactivate: _.bind(me.onDropDeactivate, me),
                ondragenter: _.bind(me.onDragEnter, me),
                ondragleave: _.bind(me.onDragLeave, me),
                ondrop: _.bind(me.onDrop, me)
            });
        },

        onDropValidate: function( edrop, edrag, dropped, dropzone, dropel, draggable, dragel ) {
            return true;
            /*if (dropped) {
                if (this.config.validate) {
                    var args = _.toArray(arguments);
                    dropped = this.config.validate.apply(this, args);
                }    
            }
            
            return dropped;*/
        },

        onVectorRender: function() {
            this.setup();
        },

        onDropActivate: function(e) {
            this.vector.addClass('activate');
        },

        onDropDeactivate: function(e) {
            this.vector.removeClass('activate');
        },

        onDragEnter: function(e) {
            this.vector.removeClass('activate').addClass('enter');
        },

        onDragLeave: function(e) {
            this.vector.removeClass('enter').addClass('activate');
        },

        onDrop: function(e) {
            this.vector.removeClass('activate enter leave');
        }
    });

}());