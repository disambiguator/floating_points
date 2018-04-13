const numPoints = 50000
let renderSpeed = 2500

let positions = [
  {radius: randInt(50, 300), arc: 0, speed: 2, offset: randInt(0,200)},
  {radius: randInt(50, 300), arc: 0, speed: 7, offset: randInt(10,20)},
  {radius: randInt(50, 300), arc: 0, speed: 1, offset: randInt(10,20)},
  {radius: randInt(50, 300), arc: 0, speed: 12, offset: randInt(10,20)},
  {radius: randInt(50, 300), arc: 0, speed: 8, offset: randInt(10,20)},
  {radius: randInt(50, 300), arc: 0, speed: 4, offset: randInt(80,200)}
]

let counter=0

function setup() {
  createCanvas(windowWidth, windowHeight)
  frameRate(30)
  background('black')
  fill('white')
  stroke('white')
  strokeWeight(1)
}

function setRandomStroke() {
  r = random(255)
  g = random(255)
  b = random(255)

  stroke(r, g, b, 100)
}

function randInt(min, max) {
  return Math.floor(Math.random() * max) + min;
}

function setRenderSpeed(v) {
  renderSpeed = v
}

function draw() {
  background(0,0,0,5)
  for (let i = 0; i < renderSpeed; i++) {
    points = positions.map(function(p) {
      return getPoint(p.radius, p.arc)
    })

    positions.forEach(function(p) {
      p.arc += (p.speed * 360 / (numPoints + p.offset))
    })

    points_2 = positions.map(function(p) {
      return getPoint(p.radius, p.arc)
    })

    line(
      sum(points, p => p.x)/points.length,
      sum(points, p => p.y)/points.length,
      sum(points_2, p => p.x)/points.length,
      sum(points_2, p => p.y)/points.length,
    )
  }

  if(counter > 1000) {
    frameRate(0)
  }
  counter++
}

function sum(array, f) {
  return array.reduce(function(accum, p) {return accum + f(p)}, 0)
}

function drawPoint(radius, angle) {
  setRandomStroke()

  var xCoordinate = windowWidth / 2 + radius * Math.cos(angle)
  var yCoordinate = windowHeight / 2 + radius * Math.sin(angle)
  point(xCoordinate, yCoordinate)
}

function getPoint(radius, angle) {
  var xCoordinate = windowWidth / 2 + radius * Math.cos(angle)
  var yCoordinate = windowHeight / 2 + radius * Math.sin(angle)
  return {x: xCoordinate, y: yCoordinate}
}
