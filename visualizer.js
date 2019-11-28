let fft, mySound, peakDetect

function setup() {
  createCanvas(windowWidth, windowHeight)
  noFill()
  strokeWeight(5)
  frameRate(60)
  stroke(255, 204, 0, 25)
  background(0, 0, 0)

  setupVisualizer()
}

function draw() {
  background(0, 0, 0, 10)

  drawCircle()
}

function drawCircle() {
  const numPoints = 360
  const spectrum = fft.analyze()
  // peakDetect.update(fft)
  const arc = 360 / numPoints

  // if (peakDetect.isDetected) {
  //     strokeWeight(200)
  // } else {
  //     strokeWeight(5)
  // }

  for (let i = 0; i < numPoints; i++) {
    const radius = 40 + spectrum[i]

    const angle = (arc * i * Math.PI) / 180

    const xCoordinate = windowWidth / 2 + radius * Math.cos(angle)
    const yCoordinate = windowHeight / 2 + radius * Math.sin(angle)

    setRandomStroke()
    point(xCoordinate, yCoordinate)
  }
}

function setRandomStroke() {
  r = random(255)
  g = random(255)
  b = random(255)

  stroke(r, g, b, 100)
}

function preload() {
  mySound = loadSound('/sound.wav')
  // mySound = new p5.AudioIn()
  // mySound.start()
}

function setupVisualizer() {
  mySound.setVolume(0.1)
  mySound.play()

  fft = new p5.FFT()
  fft.setInput(mySound)

  peakDetect = new p5.PeakDetect(20, 500)
}
