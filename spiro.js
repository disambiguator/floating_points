const numPoints = 50000;
let renderSpeed = 2500;
let colorEnabled = false;
const positions = [];

let counter = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  background('black');
  fill('white');
  stroke('white');
  strokeWeight(1);

  _.times(10, addComplexity);
}

function addComplexity() {
  positions.push({
    radius: randInt(50, 300),
    arc: randInt(0, 360),
    speed: (randInt(1, 10) * 360) / (randInt(10, 100) + numPoints),
  });
}

function setRandomStroke() {
  r = random(255);
  g = random(255);
  b = random(255);

  stroke(r, g, b, 100);
}

function randInt(min, max) {
  return Math.floor(Math.random() * max) + min;
}

function setRenderSpeed(v) {
  renderSpeed = v;
}

function draw() {
  background(0, 0, 0, 5);
  for (let i = 0; i < renderSpeed; i++) {
    points = positions.map(p => getPoint(p.radius, p.arc));

    positions.forEach(function(p) {
      p.arc += p.speed;
    });

    points_2 = positions.map(p => getPoint(p.radius, p.arc));

    const x1 = sum(points, p => p.x) / points.length;
    const y1 = sum(points, p => p.y) / points.length;

    if (colorEnabled) {
      strokeColor(x1, y1);
    }

    line(
      x1,
      y1,
      sum(points_2, p => p.x) / points.length,
      sum(points_2, p => p.y) / points.length,
    );
  }

  if (counter > 1000) {
    frameRate(0);
  }
  counter++;
}

function strokeColor(x, y) {
  r = random((x / windowWidth) * 255);
  g = random((y / windowHeight) * 255);
  b = random((y / windowHeight) * 255);

  stroke(r, g, b);
}

function toggleColor() {
  if (colorEnabled) {
    stroke('white');
    colorEnabled = false;
  } else {
    colorEnabled = true;
  }
}

function sum(array, f) {
  return array.reduce((accum, p) => accum + f(p), 0);
}

function drawPoint(radius, angle) {
  setRandomStroke();

  const xCoordinate = windowWidth / 2 + radius * Math.cos(angle);
  const yCoordinate = windowHeight / 2 + radius * Math.sin(angle);
  point(xCoordinate, yCoordinate);
}

function getPoint(radius, angle) {
  const xCoordinate = windowWidth / 2 + radius * Math.cos(angle);
  const yCoordinate = windowHeight / 2 + radius * Math.sin(angle);
  return { x: xCoordinate, y: yCoordinate };
}
