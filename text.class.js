
EF.Text = (function($){

    var Text = EF.Vector.extend({
        constructor: function(text) {
            
            this.$super('foreignObject', {
                props: {
                    requiredExtensions: 'http://www.w3.org/1999/xhtml'
                }
            });

            this.node.html('<div class="ef-text" xmlns="http://www.w3.org/1999/xhtml"><span></span></div>');
            this.span = this.node.find('span');

            if (text !== undefined) {
                this.text(text);
            }
        },

        text: function(text) {
            if (text === undefined) {
                return this.prop('text');
            }

            this.prop('text', text);
            this.span.html(text);
        }
    });

    return Text;
}(jQuery));