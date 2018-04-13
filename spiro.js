const numPoints = 50000

let positions = [
  {radius: 200, arc: 0, speed: 2, offset: 200},
  {radius: 100, arc: 0, speed: 7, offset: 0}
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

function draw() {
  for (let i = 0; i < 20; i++) {
    points = positions.map(function(p) {
      return getPoint(p.radius, p.arc)
    })

    positions.forEach(function(p) {
      console.log(p)
      p.arc += (p.speed * 360 / (numPoints + p.offset))
    })

    points_2 = positions.map(function(p) {
      return getPoint(p.radius, p.arc)
    })

    line(
      (points[0].x + points[1].x) / 2,
      (points[0].y + points[1].y) / 2,
      (points_2[0].x + points_2[1].x) / 2,
      (points_2[0].y + points_2[1].y) / 2,
    )
  }

  if(counter > 1000) {
    frameRate(0)
  }
  counter++
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
