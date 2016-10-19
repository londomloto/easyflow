# Easyflow

Web based workflow desiner (GUI)

## Vector API

#### Graph.paper([width = 800 [, height = 600]])

Create new paper

```javascript
var paper = Graph.paper(800, 600).render('#div');
// or
var paper = (new Graph.svg.Paper(800, 600)).render('#div');
```

#### Paper.rect([x = 0 [, y = 0 [, width = 0 [, height = 0]]]])

Create and render rectangle into paper

```javascript
var r = paper.rect(20, 20, 100, 100);
// or
var r = (new Graph.svg.Rect(20, 20, 100, 100)).render(paper);
```

#### Paper.circle([cx = 0 [, cy = 0 [, r = 0]]])

Create and render circle into paper

```javascript
var c = paper.circle(20, 20, 30);
// or
var r = (new Graph.svg.Circle(20, 20, 30)).render(paper);
```
## Core Plugins

#### draggable([options])
Get or set drag plugin
```javascript
var r = paper.rect();

r.draggable({
	ghost: true,
    hint: true,
    axis: 'x',
    grid: [10, 10]
});

// get plugin, then set snapping
r.draggable().snap([{x: 100}])

```
#### resizable([options])
Get or set resize plugin
```javascript
var r = paper.rect();
r.resizable();
```

#### editable([options])
Get or set label editor plugin
```javascript
var r = paper.rect();
r.editable();
```
#### connectable([options])
Get or set link provider plugin
```javascript
var r = paper.rect();
r.connectable({
	wiring: 'h:h'
});
```
#### zoomable([options])
Get or set panzoom plugin
```javascript
var p = Graph.paper();
p.zoomable();
```

#### animable([options])
Get or set animator plugin
```javascript
var r = paper.rect();
r.animable().animate({x: 100}, 1000, 'bounce');
```