import * as p5 from 'p5';
import React from 'react';
import { ReactP5Wrapper } from '../components/p5_wrapper';
import Page from '../components/page';

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

function sample<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

const randRangeDouble = (min: number, max: number) =>
  Math.random() * (max - min) + min;
const randRange = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min) + min);

const PixelSort = () => {
  let reflectButton;
  let reflectImage;
  let reset;
  let fullySort;
  let sliceRand;
  let enableFanSlice;
  let toggleAutoSlice;
  let save;
  let imageSubmit;

  const s = (sketch: p5) => {
    const updatePositions = (x, yMin, yMax) => {
      positions[x] = {
        minimumY: yMin,
        currentY: yMax,
        maximumY: yMax,
      };

      sketch.frameRate(100);
    };

    const slice = (m, b, sliceSize) => {
      console.log('me?');
      for (let x = 0; x < width; x++) {
        const y = Math.floor(m * x + b);
        updatePositions(x, y, y + sliceSize);
      }
    };

    sliceRand = () => {
      debugger;
      console.log('me?!!!');

      slice(
        randRangeDouble(-height / width, height / width),
        randRange(0, height),
        randRange(3, 50),
      );
    };

    save = sketch.save;

    enableFanSlice = () => {
      slope = -5;
      slice(slope, height / 2, 5);
      fanSlice = true;
    };

    reflectButton = (e) => {
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

    reset = () => {
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

    imageSubmit = () => {
      debugger;
      // const path = document.getElementById('imageUrl').value
      // img = sketch.loadImage(path, reset)
    };

    toggleAutoSlice = () => {
      if (autoSlice) {
        document.getElementById('autoSlice').innerText = 'Auto-Slice Start';
      } else {
        document.getElementById('autoSlice').innerText = 'Auto-Slice Stop';
      }

      autoSlice = !autoSlice;
      sketch.frameRate(100);
    };

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

    fullySort = () => {
      for (let x = 0; x < width; x++) {
        updatePositions(x, 0, height);
      }
    };

    sketch.draw = () => {
      sketch.loadPixels();

      Object.keys(positions).forEach(function (currentX) {
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

  return (
    <div>
      <button onClick={reset}>Reset</button>
      <button onClick={fullySort}>Just sort the thing</button>
      <button onClick={sliceRand}>Slice</button>
      <button onClick={toggleAutoSlice}>Auto-Slice Start</button>
      <button onClick={enableFanSlice}>Fan Slice</button>
      <button onClick={reflectImage}>Reflect Whole Image</button>
      <input type="checkbox" id="reflectMode" onChange={reflectButton} />
      <label htmlFor="reflectMode">Reflect Mode</label>
      <button id="save" onClick={() => save('pixelSorted.jpg')}>
        Save Image
      </button>

      <label htmlFor="imageUrl">Custom Image Path</label>
      <input type="url" id="imageUrl" />
      <button id="imageSubmit" onClick={imageSubmit}>
        Submit
      </button>
      <ReactP5Wrapper sketch={s} />
    </div>
  );
};

export default function PixelSortPage() {
  return (
    <Page>
      <PixelSort />
    </Page>
  );
}
