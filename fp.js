const colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e']

const max_size = 100
const scale = 5

var targets = []

function setup() {
    createCanvas(windowWidth, windowHeight)
    noFill()
    strokeWeight(3)
    frameRate(15)
    stroke(255, 204, 0, 25)
}

function draw() {
    background(255, 255, 255, 25)

    var numRings = 10

    for (var i = 0; i < numRings; i++) {
        drawCircle(50 * i)
    }
}

function mousePressed() {
    stroke(255, 204, 0, 25)
    ellipse(mouseX, mouseY, 25)
}

function randomColor() {
    return _.sample(colors)
}

function drawCircle(radius) {
    var numPoints = 20

    var arc = 360 / numPoints

    for (var i = 0; i < numPoints; i++) {
        var angle = arc * i * Math.PI / 180;

        var xCoordinate = windowWidth / 2 + radius * Math.cos(angle)
        var yCoordinate = windowHeight / 2 + radius * Math.sin(angle)

        ellipse(xCoordinate, yCoordinate, 25)
    }
}
