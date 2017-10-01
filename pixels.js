let img
let width
let height
let positions = {}

function preload() {
  img = loadImage(imageLibrary())
}

function imageLibrary() {
  return sample([
    'http://i.imgur.com/Fx6BGlt.jpg',
    'https://i.imgur.com/IwnuBWX.jpg'
  ])
}

function sample(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function step(x, y) {
  const temp = getPixelArray(x, y)
  let j = y + 1
  while (j <= height && hue(getPixelArray(x, j)) > hue(temp)) {
    setPixelArray(x, j - 1, getPixelArray(x, j))
    j++
  }
  setPixelArray(x, j - 1, temp)
}

function setup() {
  pixelDensity(1)
  width = 700
  height = 400
  createCanvas(width, height)
  frameRate(100)

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

  Object.keys(positions).forEach(function (currentX) {
    if (positions[currentX].currentY > positions[currentX].minimumY) {
      positions[currentX].currentY = Math.max(positions[currentX].currentY - 1, positions[currentX].minimumY)
      step(int(currentX), positions[currentX].currentY)
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
