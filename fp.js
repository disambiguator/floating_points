const colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e']

const max_size = 100
const scale = 5

var targets = []

function setup() {
    createCanvas(windowWidth, windowHeight)
    noFill()
    strokeWeight(3)
    frameRate(15)
}

function draw() {
   background(255, 255, 255, 25)
    ellipse(mouseX, mouseY, 25)
}

function mousePressed() {
    stroke(255, 204, 0, 25)
    ellipse(mouseX, mouseY, 25)
}

function randomColor() {
    return _.sample(colors)
}
