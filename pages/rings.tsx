import CCapture from 'ccapture.js';
import { makeNoise2D } from 'open-simplex-noise';
import * as p5 from 'p5';
import React from 'react';
import { ReactP5Wrapper } from 'components/p5_wrapper';
import Page from 'components/page';

const noise = makeNoise2D(Math.random() * 100);

const fps = 60;

const capturer = new CCapture({ format: 'png', framerate: fps });

const Bendy = () => {
  const sketch = (p: p5) => {
    const width = p.windowHeight * 0.9;
    // const width = 1080;
    const height = width;
    console.log('dimensions', width);
    let i = 0;

    p.setup = () => {
      p.createCanvas(width, height);
      p.stroke('black');
      // p.frameRate(0);
      p.frameRate(fps);
      p.noFill();
      p.background(110, 46, 240);
      p.pixelDensity(2);
      p.strokeWeight(3);
      p.draw();
      // p.saveCanvas();
    };

    // ffmpeg -r 30 -f image2 -s 1024x1024 -i "%07d.png" -vcodec libx264 -crf 0 -pix_fmt yuv420p output.mp4

    let startMillis: number; // needed to subtract initial millis before first draw to begin at t=0.
    // duration in milliseconds
    const duration = 30000;
    p.draw = () => {
      if (p.frameCount === 1) {
        // start the recording on the first frame
        // this avoids the code freeze which occurs if capturer.start is called
        // in the setup, since v0.9 of p5.js
        capturer.start();
      }
      if (startMillis == null) {
        startMillis = p.millis();
      }

      // compute how far we are through the animation as a value between 0 and 1.
      const elapsed = p.millis() - startMillis;
      const t = p.map(elapsed, 0, duration, 0, 1);

      // if we have passed t=1 then end the animation.
      if (t > 1) {
        p.noLoop();
        console.log('finished recording.');
        capturer.stop();
        capturer.save();
        return;
      }

      //   p.background(126, 224, 152);
      // p.background('#6E2EF0');
      p.background(110, 46, 240);

      const sections = [
        '#F08616',
        '#2EF04B',
        '#F08616',
        '#2EF04B',
        '#F08616',
        '#2EF04B',
      ];

      for (let j = 0; j < 100; j += 1) {
        const m = 30;
        const size = j * m;

        const overlap = 0.2;

        sections.forEach((s, index) => {
          p.stroke(s);

          const initial = noise(j / 8, i) * (-1 ^ index % 2);
          // const initial = noise(j / 8, 0) + i * (-1 ^ index % 2);
          // const initial = noise(j / 8, 0) + i * (-1) ** (index % 2);
          // const initial = noise(j / 8, i) + i * (-1) ** (index % 2);

          p.arc(
            width / 2,
            height / 2,
            size + (m / 2) * (index % 2),
            size + (m / 2) * (index % 2),
            initial - overlap + (index * p.PI * 2) / sections.length,
            initial + overlap + ((index + 1) * p.PI * 2) / sections.length,
          );
        });
      }
      // handle saving the frame
      console.log('capturing frame');
      capturer.capture(document.getElementById('defaultCanvas0'));
      i = i + 0.01;
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default function BendyPage() {
  return (
    <Page background="#6E2EF0">
      <Bendy />
    </Page>
  );
}
