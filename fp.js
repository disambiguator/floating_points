const colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e']

var radiusScale = 40
var offset = 1
var initialArc = 0
var amplitude
var direction = 0.1

function setup() {
    setupVisualizer()

    createCanvas(windowWidth, windowHeight)
    noFill()
    strokeWeight(3)
    frameRate(60)
    stroke(255, 204, 0, 25)
    background(0, 0, 0)

    initialArc = 0
}

function draw() {
    setRandomStroke()

    background(0, 0, 0, 10)

    // var numRings = 5

    var buckets = ['bass', 'lowMid', 'mid', 'highMid', 'treble']

    drawCircle(radiusScale * 0, buckets[0])
    drawCircle(radiusScale * 1, buckets[1])
    drawCircle(radiusScale * 2, buckets[2])
    drawCircle(radiusScale * 3, buckets[3])
    drawCircle(radiusScale * 4, buckets[4])
    drawCircle(radiusScale * 5, buckets[3])
    drawCircle(radiusScale * 6, buckets[2])
    drawCircle(radiusScale * 7, buckets[1])
    drawCircle(radiusScale * 8, buckets[0])

    if (Math.abs(offset) > 15)
        direction = -direction

    offset += direction

    initialArc += 0.2
}

function mousePressed() {
    stroke(255, 204, 0, 25)
    ellipse(mouseX, mouseY, 25)
}

function randomColor() {
    return _.sample(colors)
}

function drawCircle(radius, bucket) {
    var numPoints = radius / 8

    fft.analyze()

    var arc = 360 / numPoints

    for (var i = 0; i < numPoints; i++) {
        var angle = (arc * i + initialArc) * Math.PI / 180

        var xCoordinate = windowWidth / 2 + (radius + offset * radius) * Math.cos(angle)
        var yCoordinate = windowHeight / 2 + (radius + offset * radius) * Math.sin(angle)

        ellipse(xCoordinate, yCoordinate, Math.pow(fft.getEnergy(bucket), 2)/100)
    }
}

function preload() {
    mySound = loadSound('/matzomix011.mp3')
}

function setRandomStroke() {
    r = random(127, 255)
    g = random(127, 255)
    b = random(127, 255)

    stroke(r, g, b, 50)
}

function setupVisualizer() {
    mySound.setVolume(0.1)
    mySound.jump(random(0, mySound.duration()))
    mySound.play()

    fft = new p5.FFT()
    fft.setInput(mySound)

    amplitude = new p5.Amplitude()
}
