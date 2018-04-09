const numPoints = 20000

let positions = []
let arc_1 = 0
let arc_2 = 0

function setup() {
  createCanvas(windowWidth, windowHeight)
  frameRate(300)
  background(255, 255, 255)
  stroke(0, 0, 0)
  strokeWeight(1)

  positions = [
    {radius: 200, arc: 0},
    {radius: 100, arc: 0},
  ]
}

function setRandomStroke() {
  r = random(255)
  g = random(255)
  b = random(255)

  stroke(r, g, b, 100)
}

function draw() {
  point_1 = getPoint(200, arc_1)
  point_2 = getPoint(100, arc_2)

  point(
    (point_1.x + point_2.x) / 2,
    (point_1.y + point_2.y) / 2
  )

  arc_1 += 2* 360 / numPoints
  arc_2 += 7 * (360 / numPoints)
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
