var radiusScale = 80
var offset = 1
var initialArc = 0
var amplitude
var direction = 0.1

function setup() {
  setupVisualizer()

  createCanvas(windowWidth, windowHeight)
  noFill()
  strokeWeight(10)
  frameRate(0)
  stroke(255, 204, 0, 25)
  background(0, 0, 0)

  draw()
}

function draw() {

  var buckets = ['bass', 'lowMid', 'mid', 'highMid', 'treble']

  setRandomStroke()
  drawCircle(radiusScale * 1, buckets[0])

  setRandomStroke()
  drawCircle(radiusScale * 2, buckets[1])

  setRandomStroke()
  drawCircle(radiusScale * 3, buckets[3])

  setRandomStroke()
  drawCircle(radiusScale * 4, buckets[4])

  setRandomStroke()
  drawCircle(radiusScale * 5, buckets[2])
}

function randomColor() {
  return _.sample(colors)
}

function drawCircle(radius, bucket) {

  const waveform = fft.waveform()
  const arc = 360 / waveform.length

  const maxAmpl = max(waveform)
  const minAmpl = min(waveform)

  beginShape()
  for (var i = 0; i < waveform.length; i++) {
    var angle = (arc * i) * Math.PI / 180


    const hypotenuse = radius + map(waveform[i], minAmpl, maxAmpl, 0, 5)
    debugger

    var xCoordinate = windowWidth / 2 + hypotenuse * Math.cos(angle)
    var yCoordinate = windowHeight / 2 + hypotenuse * Math.sin(angle)

    vertex(xCoordinate, yCoordinate)
  }
  endShape(CLOSE)
}

function preload() {
  mySound = loadSound('/quantic.mp3')
}

function setRandomStroke() {
  r = random(127, 255)
  g = random(127, 255)
  b = random(127, 255)

  stroke(r, g, b, 50)
}

function setupVisualizer() {
  fft = new p5.FFT()
  fft.setInput(mySound)
}
