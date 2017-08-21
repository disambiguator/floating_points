let img
let width
let height
let minimumY
let currentX
let currentY
const colWidth = 30

function preload() {
  // img = loadImage('rainbow.png')
  img = loadImage('http://i.imgur.com/Fx6BGlt.jpg')
}

function sortColumn(x, y_start, y_end) {
  if(x >= width) { return }

  const col = []
  for (let y = y_start; y < y_end; y++) {
    col.push(getPixelArray(x, y))
  }

  col.sort((a, b) => -(hue(b) - hue(a)))

  col.forEach((o, y) => {
    setPixelArray(x, y_start + y, o)
  })

}

function setup() {
  pixelDensity(1)
  width = 700
  height = 400
  createCanvas(width, height)

  image(img, 0, 0, width, height)

  // loadPixels()
  //
  // for (let x = 0; x < width; x++) {
  //   sortColumn(x);
  // }
  //
  // updatePixels()
}

function mouseClicked() {
  if(mouseX >= width) { return }

  // const colWidth = randRange(10, 100)
  // const position = randRange(0, width)

  frameRate(30)

  minimumY = mouseY
  currentY = height
  currentX = mouseX
}

function draw() {
  loadPixels()

  for (let x = 0; x < colWidth; x++) {
    sortColumn(currentX + x, currentY, height)
  }

  updatePixels()

  if(minimumY > currentY) {
    frameRate(0)
  }

  currentY -= 3
}

function setPixelArray(x, y, o) {
  const idx = 4 * (y * width + x)
  pixels[idx] = o[0]
  pixels[idx + 1] = o[1]
  pixels[idx + 2] = o[2]
  pixels[idx + 3] = o[3]
}

function getPixelArray(x, y) {
  const off = (y * width + x) * 4
  return [
    pixels[off],
    pixels[off + 1],
    pixels[off + 2],
    pixels[off + 3]
  ]
}

function randRange(min, max) {
  return int(Math.random() * (max - min) + min)
}
