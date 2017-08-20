let img
let width
let height

function preload() {
  // img = loadImage('rainbow.png')
  img = loadImage('bernal.jpg')
}

function sortColumn(x) {
  // loadPixels();

  const col = []
  for (let y = 0; y < height; y++) {
    col.push(color(...get(x, y)))
  }

  col.sort(col, (a, b) => {
    return hue(a) < hue(b)
  })

  col.forEach((o, y) => {
    set(x, y, o)
  })

  updatePixels()
}

function setup() {
  pixelDensity(1);
  width = 1000
  height = 1000
  // colorMode(HSB, 255);
  createCanvas(width, height)

  image(img, 0, 0, width, height)

  // for (let x = 0; x < width; x++) {
  //   sortColumn(x);
  // }
}

function mousePressed() {
  sortColumn(mouseX)
}
