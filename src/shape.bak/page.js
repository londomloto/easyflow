
(function(){

    var Page = Graph.shape.Page = Graph.extend({

        canvas: null,
        rendered: true,
        tree: {
            parent: null,
            children: null
        },

        constructor: function() {
            this.canvas = new Graph.svg.Paper(1000, 1000);
            this.canvas.addClass('graph-page');
            this.tree.children = new Graph.collection.Shape();
        },

        children: function() {
            return this.tree.children;
        },

        render: function(container) {
            var me = this;
            me.rendered = true;
            me.canvas.render(container);
            return this;
        },

        append: function(shape) {
            shape.render(this, 'append');
            return shape;
        },

        prepend: function(shape) {
            shape.render(this, 'prepend');
            return shape;
        },

        draw: function(/* ns, arg1, arg2, ...argN */) {
            var args = _.toArray(arguments),
                part = _.split(args.shift(), '.'),
                tail = _.capitalize(part.pop() || ''),
                name  = 'Graph.shape.' + _.join(part.concat([tail]), '.'),
                clazz = Graph.ns(name);

            var shape;

            if (clazz) {
                shape = Graph.factory(clazz, args);
                shape.page = this;

                // shape.tree.parent = this;
                // this.children().push(shape);

                // shape.render(this);
            } else {
                console.warn("Class {" + name + "} doesn't exists!");
                shape = null;
            }

            return shape;
        },

        erase: function() {

        },

        isPage: function() {
            return true;
        }

    });

}());