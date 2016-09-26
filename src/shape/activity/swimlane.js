
(function(){
    
    var Swimlane = Graph.shape.activity.Swimlane = Graph.shape.Base.extend({

        props: {
            x: 0,
            y: 0,

            offsetLeft: 0,
            offsetTop: 0,

            height: 150,
            width: 200,
            rotate: 0,

            headerHeight: 30,

            text: 'Swimlane',
            textRotate: 270

        },

        initComponent: function() {
            var comp = this.components,
                prop = this.props;

            // component `group`
            comp.group = new Graph.svg.Group();
            comp.group.addClass('graph-shape graph-shape-activity-swimlane');
            comp.group.draggable({axis: 'y'});
            comp.group.on({
                'render': _.bind(this.onGroupRender, this),
                'resize.sortable': _.bind(this.onGroupResize, this)
            });
            
            // component `block (rectangle)`
            comp.block = comp.group.append(new Graph.svg.Rect(0, 0, prop.width, prop.height));
            comp.block.resizable();
            comp.block.on({
                resize: _.bind(this.onBlockResize, this),
                collect: _.bind(this.onBlockCollect, this),
                render: _.bind(this.onBlockRender, this)
            });

            // component `header`
            comp.headGroup = comp.group.append(new Graph.svg.Group());
            comp.headGroup.selectable(false);

            comp.head = comp.headGroup.append(new Graph.svg.Rect(0, 0, prop.headerHeight, prop.height));
            comp.head.selectable(false);

            // component `text`
            comp.text = comp.headGroup.append(new Graph.svg.Text(0, 0, prop.text));
            comp.text.selectable(false);
            comp.text.on({
                render: _.bind(this.onTextRender, this)
            });
        },  

        render: function(parent, method) {
            var me = this;
            me.$super(parent, method);
            me.page.on('scroll', _.bind(me.onPageScroll, me));
        },

        translate: function(dx, dy) {
            this.props.x += dx;
            this.props.y += dy;
            this.components.group.translate(dx, dy).apply();
        },

        rotate: function(deg, cx, cy) {

        },

        width: function(width) {
            if (_.isUndefined(width)) {
                return this.props.width;
            }
            this.props.width = width;
            return this;
        },

        height: function(height) {
            if (_.isUndefined(height)) {
                return this.props.height;
            }
            this.props.height = height;
            return this;
        },

        centerText: function() {
            this.components.text.reset();
            this.components.text.center(this.components.head);
            this.components.text.rotate(this.props.textRotate).apply();
        },

        onPageScroll: function(e) {
            var comp = this.components,
                prop = this.props;
            
            if (e.dir == 'right' || e.dir == 'left') {
                comp.headGroup.reset();
                if (e.currX >= prop.offsetLeft) {
                    comp.headGroup.translate((e.currX - prop.offsetLeft - e.origX), 0).apply();    
                }
            }
        },

        onGroupRender: function() {
            var comp = this.components;
            comp.group.translate(this.props.x, this.props.y).apply();
        },

        onGroupResize: function(e, group) {
            var comp = this.components;
            comp.block.attr({
                width: e.width
            });
            comp.block.resizer.redraw();
        },

        onBlockRender: function() {
            var comp = this.components,
                data = this.props,
                bbox = comp.block.bbox(false, false).data(),
                bmat = comp.block.ctm();

            this.props.offsetLeft = bmat.x(bbox.x, bbox.y);
            this.props.offsetTop  = bmat.y(bbox.x, bbox.y);

            // comp.block.attr('width', comp.block.canvas.attrs.width - data.x * 2);
            // comp.block.dirty = true;
        },

        onBlockCollect: function(e) {
            e.collect(this.components.group);
            this.components.group.forward();
        },

        onBlockResize: function(e) {
            var comp = this.components,
                bbox = comp.block.bbox(false, false).data();

            // resize head
            comp.head.resize(1, e.sy, e.cx, e.cy, 0, 0);
            
            // center text
            this.centerText();

            this.props.width  = bbox.width;
            this.props.height = bbox.height;

            e.width  = this.props.width;
            e.height = this.props.height;

            comp.group.fire('resize', e, comp.group);
        },

        onTextRender: function() {
            this.centerText();
        }

    });

}());