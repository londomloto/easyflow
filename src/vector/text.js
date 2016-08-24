
EF.vector.Text = (function(_, $){

    var Text = EF.vector.Vector.extend({

        constructor: function(text) {

            this.$super('foreignObject');
            this.attr('requiredExtensions', 'http://www.w3.org/1999/xhtml');

            this.components = {
                html: $('<div xlmns="http://www.w3.org/1999/xhtml"><span></span></div>')
            };

            this.node.append(this.components.html);

            if( ! _.isUndefined(text)) {
                this.text(text);
            }
        },

        text: function(text) {
            if (_.isUndefined(text)) {
                return this.components.html.children('span').html();
            }

            this.components.html.children('span').html(text);

            return this;
        },

        pathinfo: function() {
            
        }
    });

    return Text;
}(_, jQuery));