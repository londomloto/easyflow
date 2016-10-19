# Easyflow

Web based workflow desiner (GUI)

### Vector API

##### Graph.paper([width = 800 [, height = 600]])

Create new paper

```javascript
var paper = Graph.paper(800, 600).render('#div');
```
Or,
```javascript
var paper = (new Graph.svg.Paper(800, 600)).render('#div');
```

##### Paper.rect([x = 0 [, y = 0 [, width = 0 [, height = 0]]]])

Create and render rectangle into paper

```javascript
var r = paper.rect(20, 20, 100, 100);
```
Or,
```javascript
var r = (new Graph.svg.Rect(20, 20, 100, 100)).render(paper);
```

##### Paper.circle([cx = 0 [, cy = 0 [, r = 0]]])

Create and render circle into paper

```javascript
var c = paper.circle(20, 20, 30);
```
Or,
```javascript
var r = (new Graph.svg.Circle(20, 20, 30)).render(paper);
```