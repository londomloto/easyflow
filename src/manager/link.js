
(function(){

    var Manager = Graph.extend({

        links: {},
        
        constructor: function() {},

        register: function(link) {
            var id = link.guid();
            this.links[id] = link;
        },

        unregister: function(link) {
            var id = link.guid();
            if (this.links[id]) {
                this.links[id] = null;
                delete this.links[id];
            }
        },

        count: function() {
            return _.keys(this.links).length;
        },

        get: function(key) {
            if (_.isUndefined(key)) {
                return this.toArray();
            }

            if (key instanceof SVGElement) {
                key = Graph.$(key).data(Graph.string.ID_LINK);
            } else if (key instanceof Graph.dom.Element) {
                key = key.data(Graph.string.ID_LINK);
            }

            return this.links[key];
        },
        
        /**
         * Synchronize with vector
         */
        synchronize: function(vector) {
            /*var me = this;

            if (me.count()) {
                var links = vector.linkable().links().slice(),
                    path1 = vector.bbox().clone().expand(10).pathinfo();

                var path2;

                // _.forEach(me.links, function(link){
                //     if (_.indexOf(links, link) === -1) {
                //         path2 = link.pathinfo();
                //         if (path1.intersect(path2)) {
                //             link.pristine = true;
                //             links.push(link);
                //         }
                //     }
                // });

                if (links.length) {
                    var q = $({}), f;
                    _.forEach(links, function(link, i){
                        f = (function(link){
                            return function(next) {
                                if (link.pristine || link.$intersect) {
                                    link.refresh();
                                } else {
                                    link.refresh();
                                }
                                next();
                            };
                        }(link));
                        q.queue(f);
                    });
                }

            }*/
        },
        
        toArray: function() {
            var links = this.links, keys = _.keys(links);
            return _.map(keys, function(k){
                return links[k];
            });
        },

        toString: function() {
            return 'Graph.manager.Link';
        }

    });

    /**
     * Singleton link manager
     */
    Graph.manager.link = new Manager();

}());