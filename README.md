# Easyflow

Web based workflow desiner (GUI)

## Graphic API

Easyflow was builded based on Graphic library.

### Core Language

##### Graph.extend(superclass, props)
Create new class using javascript classic inheritance technique.

```javascript
var Vector = Graph.extend(Graph.lang.Class, {
	constructor: function(node, attr) {
    	this.node = document.createElementNS(
        	'http://www.w3.org/2000/svg', 
            node
        );
        this.attr(attr);
    },
    attr: function(attr) {
    	// ...
    },
    render: function(paper) {
    	paper.appendChild(this.node);
        return this.$super(); // call parent method
    }
});

var Circle = Graph.extend(Vector, {
	constructor: function(cx, cy, r) {
    	this.$super('circle', {
        	cx: cx,
            cy: cy,
            r: r
        });
    }
});

var c1 = new Circle(0, 0, 20);
c1.render(/* paper */);

```

##### Graph.point(x, y)
Create point object

```javascript
var p1 = Graph.point(0, 0);
p1.distance(p2);
p1.stringify();		// 0,0;
```

##### Graph.matrix(a, b, c, d, e, f)
Create 2D matrix object

```javascript
// matrix
[a, c, e]				[1, 0, 0]
[b, d, f]				[0, 1, 0]
[0, 0, 1]				[0, 0, 1]

var m1 = Graph.matrix(1, 0, 0, 1, 30, 0);
m1.translate(30);
m1.scale(2);
m1.rotate(45);
// ... other matrix operations
```

##### Graph.path(command)
Create path from path command. Example command: `M100,100L200,200...Z`;

```javascript
var path = Graph.path('M100,100L200,200');

path.dimension();	// {x: ..., y: ..., width: ..., height: ...}
path.relative().command(); // M100,100L...
path.absolute().command();
path.curve().command();
path.transform(matrix).command()

```

### Vector

##### Graph.paper(x, y, width, height)
Create svg

```javascript
var paper = Graph.paper(0, 0, 1000, 1000);
paper.attr('viewBox', '...');
```

##### Graph.find(selector)
Find vector using standard css selector

```javascript
var vectors = Graph.find('circle');
vectors.attr('fill', 'red');
```

### Vector - Paper

##### paper.circle(cx, cy, r)
Add circle to paper

```javascript
var c1 = paper.circle(0, 0, 20);
```

##### paper.rect(x, y, width, height, r)
Add circle to paper

```javascript
var r1 = paper.circle(0, 0, 20, 20, 4);
```

##### paper.path(d)
Add path to paper

```javascript
var p1 = paper.path('M100,100L200,200L300,200');
```