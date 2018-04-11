const numPoints = 50000

let positions = []
let arc_1 = 0
let arc_2 = 0

function setup() {
  createCanvas(windowWidth, windowHeight)
  frameRate(30)
  background('black')
  fill('white')
  stroke('white')
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
  for (let i = 0; i < 20; i++) {
    point_1 = getPoint(200, arc_1)
    point_2 = getPoint(100, arc_2)

    // point(
    //   (point_1.x + point_2.x) / 2,
    //   (point_1.y + point_2.y) / 2
    // )

    arc_1 += 2 * 360 / (numPoints + 200)
    arc_2 += 7 * (360 / numPoints)

    point_3 = getPoint(200, arc_1)
    point_4 = getPoint(100, arc_2)

    line(
      (point_1.x + point_2.x) / 2,
      (point_1.y + point_2.y) / 2,
      (point_3.x + point_4.x) / 2,
      (point_3.y + point_4.y) / 2
    )
  }
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
