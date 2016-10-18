
(function(){

    Graph.plugin.Editor = Graph.extend(Graph.plugin.Plugin, {

        props: {
            vector: null,
            rendered: false,
            suspended: true,
            width: 'auto',
            height: 'auto'
        },

        editing: {
            commitHandler: null
        },

        components: {
            editor: null
        },

        constructor: function(vector, options) {
            var vendor;

            _.assign(this.props, options || {});

            this.props.vector = vector.guid();

            vendor = vector.interactable().vendor();
            vendor.on('doubletap', _.bind(this.onDoubleTap, this, _, vector));

            this.initComponent();
        },

        initComponent: function() {
            var me = this, comp = this.components;
            comp.editor = Graph.$('<div class="graph-editor" contenteditable="true"></div>');
            comp.editor.on('keypress', function(e){
                if (e.keyCode === Graph.event.ENTER) {
                    me.commit();
                }
            });
        },
        
        commit: function() {
            var text = this.components.editor.text();
            this.suspend();
            this.vector().props.text = text;
            this.fire('edit', {text: text});
        },

        render: function() {
            if (this.props.rendered) {
                this.redraw();
                return;
            }

            this.vector().paper().container().append(this.components.editor);
            this.props.rendered = true;
            this.redraw();
        },

        suspend: function() {
            this.props.suspended = true;
            this.components.editor.detach();

            if (this.editing.commitHandler) {
                Graph.topic.unsubscribe('paper/beforezoom', this.editing.commitHandler);
                Graph.topic.unsubscribe('paper/beforescroll', this.editing.commitHandler);
                this.vector().paper().off('pointerdown', this.editing.commitHandler);
                this.editing.commitHandler = null;
            }
        },

        resume: function() {
            var container;

            if ( ! this.props.rendered) {
                this.render();
            } else {
                if (this.props.suspended) {
                    this.props.suspended = false;
                    container = this.vector().paper().container();
                    container.append(this.components.editor);
                }
                this.redraw();
            }
        },

        redraw: function() {
            var editor = this.components.editor,
                vector = this.vector(),
                matrix = vector.matrix(true),
                scale  = matrix.scale();

            var vbox = vector.bbox().clone().transform(matrix).toJson();
            var left, top, width, height;
            
            if (this.props.width != 'auto') {
                width = Math.max((Math.min(this.props.width, vbox.width)), 150);
                left  = vbox.x + (vbox.width - width) / 2;
            } else {
                width = vbox.width;
                left = vbox.x;
            }

            if (this.props.height != 'auto') {
                height = Math.max((Math.min(this.props.height, vbox.height)), 50);
                top = vbox.y + (vbox.height - height) / 2;
            } else {
                height = vbox.height;
                top = vbox.y;
            }

            editor.css({
                left: left + 4 * scale.x,
                top:  top + 4 * scale.y,
                width: width - 8 * scale.x,
                height: height - 8 * scale.y
            });

            editor.text((vector.props.text || ''));
            editor.focus();

            vbox = null;
        },

        onDoubleTap: _.debounce(function(e, vector) {
            var me = this;

            if (vector.$collector) {
                vector.$collector.decollect(vector);
            }

            if (vector.paper().tool().current() == 'linker') {
                vector.paper().tool().activate('panzoom');
            }

            me.resume();
            
            me.editing.commitHandler = function() {
                me.commit();
            };

            Graph.topic.subscribe('paper/beforezoom', me.editing.commitHandler);
            Graph.topic.subscribe('paper/beforescroll', me.editing.commitHandler);

            vector.paper().on('pointerdown', me.editing.commitHandler);
            vector = null;

        }, 100) 

    });

}());