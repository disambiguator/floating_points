let img
let width
let height
let positions = {}

function preload() {
  // img = loadImage('rainbow.png')
  img = loadImage('http://i.imgur.com/Fx6BGlt.jpg')
}

function sortColumn(x, y_start, y_end) {
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
  frameRate(30)

  image(img, 0, 0, width, height)
}

function mouseMoved() {
  const x = mouseX
  const y = mouseY

  if (x >= width) {
    return
  }

  positions[x] = {
    minimumY: y,
    currentY: positions[x] ? positions[x].currentY : height
  }
}

function draw() {
  loadPixels()

  Object.keys(positions).forEach(function(currentX) {
    if (positions[currentX].currentY > positions[currentX].minimumY) {
      positions[currentX].currentY = Math.max(positions[currentX].currentY - randRange(1, 5), positions[currentX].minimumY)
      sortColumn(int(currentX), positions[currentX].currentY, height)
    }
  })

  updatePixels()
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
