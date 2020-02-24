let img;
const width = 700;
const height = 400;
let positions = {};
let autoSlice = false;
let fanSlice = false;
let slope;
let reflectMode = false;

function imageLibrary() {
  return sample([
    'http://i.imgur.com/Fx6BGlt.jpg',
    'https://i.imgur.com/IwnuBWX.jpg',
  ]);
}

function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const randRangeDouble = (min, max) => Math.random() * (max - min) + min;

let reflectButton;
let reflectImage;

const s = sketch => {
  const sliceRand = () => {
    slice(
      randRangeDouble(-height / width, height / width),
      randRange(0, height),
      randRange(3, 50),
    );
  };

  const enableFanSlice = () => {
    slope = -5;
    slice(slope, height / 2, 5);
    fanSlice = true;
  };

  reflectButton = e => {
    reflectMode = e.checked;
  };

  const step = (x, y, yMax, reflect) => {
    const temp = getPixelArray(x, y);
    let j = y + 1;
    while (j <= yMax && sketch.hue(getPixelArray(x, j)) > sketch.hue(temp)) {
      setPixelArray(x, j - 1, getPixelArray(x, j));
      if (reflect) {
        setPixelArray(x, height - j - 1, getPixelArray(x, j));
      }
      j++;
    }
    setPixelArray(x, j - 1, temp);
    if (reflect) {
      setPixelArray(x, height - j - 1, temp);
    }
  };

  const reset = () => {
    sketch.image(img, 0, 0, width, height);
    positions = {};
  };

  sketch.preload = () => {
    img = sketch.loadImage(imageLibrary());
  };

  sketch.setup = () => {
    sketch.pixelDensity(1);
    sketch.createCanvas(width, height);
    sketch.frameRate(100);

    reset();
  };

  const imageSubmit = () => {
    const path = document.getElementById('imageUrl').value;
    img = sketch.loadImage(path, reset);
  };

  const updatePositions = (x, yMin, yMax) => {
    positions[x] = {
      minimumY: yMin,
      currentY: yMax,
      maximumY: yMax,
    };

    sketch.frameRate(100);
  };

  const slice = (m, b, sliceSize) => {
    for (let x = 0; x < width; x++) {
      const y = Math.floor(m * x + b);
      updatePositions(x, y, y + sliceSize);
    }
  };

  function toggleAutoSlice() {
    if (autoSlice) {
      document.getElementById('autoSlice').innerText = 'Auto-Slice Start';
    } else {
      document.getElementById('autoSlice').innerText = 'Auto-Slice Stop';
    }

    autoSlice = !autoSlice;
    sketch.frameRate(100);
  }

  sketch.mouseDragged = () => {
    const x = Math.floor(sketch.mouseX);
    const y = Math.floor(sketch.mouseY);

    if (x >= width || y <= 0) {
      return;
    }

    if (positions[x]) {
      updatePositions(x, Math.min(y, positions[x].minimumY), height);
    } else {
      updatePositions(x, y, height);
    }
  };

  const fullySort = () => {
    for (let x = 0; x < width; x++) {
      updatePositions(x, 0, height);
    }
  };

  sketch.draw = () => {
    sketch.loadPixels();

    Object.keys(positions).forEach(function(currentX) {
      const p = positions[currentX];

      if (p.currentY > p.minimumY) {
        p.currentY = Math.max(p.currentY - 1, p.minimumY);
        step(sketch.int(currentX), p.currentY, p.maximumY, reflectMode);
      } else {
        delete positions[currentX];
      }
    });

    sketch.updatePixels();

    if (Object.keys(positions).length === 0) {
      autoSlice ? sliceRand() : sketch.frameRate(0);
      if (fanSlice) {
        slope += height / width;

        if (slope > 0) {
          sketch.frameRate(0);
        } else {
          slice(slope, height / 2, 10);
        }
      }
    }
  };

  const setPixelArray = (x, y, o) => {
    const idx = 4 * (y * width + x);
    sketch.pixels[idx] = o[0];
    sketch.pixels[idx + 1] = o[1];
    sketch.pixels[idx + 2] = o[2];
    sketch.pixels[idx + 3] = o[3];
  };

  const getPixelArray = (x, y) => {
    const off = (y * width + x) * 4;
    return [
      sketch.pixels[off],
      sketch.pixels[off + 1],
      sketch.pixels[off + 2],
      sketch.pixels[off + 3],
    ];
  };

  const randRange = (min, max) => sketch.int(Math.random() * (max - min) + min);

  reflectImage = () => {
    sketch.loadPixels();

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height / 2; y++) {
        setPixelArray(x, height - y, getPixelArray(x, y));
      }
    }

    sketch.updatePixels();
  };
};

const myp5 = new p5(s);
