let img
let width
let height

function preload() {
  // img = loadImage('rainbow.png')
  img = loadImage('bernal.jpg')
}

function sortColumn(x) {
  const col = []
  for (let y = 0; y < height; y++) {
    col.push(getPixelArray(x, y))
  }

  col.sort(col, (a, b) => {
    return hue(a) < hue(b)
  })

  col.forEach((o, y) => {
    setPixelArray(x, y, o)
  })

}

function setup() {
  pixelDensity(1)
  width = 1000
  height = 1000
  createCanvas(width, height)

  image(img, 0, 0, width, height)

  loadPixels()

  for (let x = 0; x < width; x++) {
    sortColumn(x);
  }

  updatePixels()
}

function mousePressed() {
  sortColumn(mouseX)
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
