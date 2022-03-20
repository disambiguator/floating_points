import { makeNoise2D } from 'open-simplex-noise';
import * as p5 from 'p5';
import React from 'react';
import { ReactP5Wrapper } from 'components/p5_wrapper';
import Page from 'components/page';

const noise = makeNoise2D(Math.random() * 100);

const Bendy = () => {
  const sketch = (p: p5) => {
    const width = p.windowHeight * 0.9;
    const height = p.windowHeight * 0.9;
    let i = 0;

    p.setup = () => {
      p.createCanvas(width, height);
      p.stroke('black');
      p.frameRate(0);
      p.frameRate(60);
      p.noFill();
      p.background(110, 46, 240);
      p.pixelDensity(5);
      p.strokeWeight(3);
      p.draw();
      // p.saveCanvas();
    };

    p.draw = () => {
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

        const x = i;
        sections.forEach((s, index) => {
          p.stroke(s);

          const initial = noise(j / 8, x) * (-1 ^ index % 2);
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

      i = i + 0.01;
    };

    p.mouseClicked = () => {
      if (p.frameRate() > 0) {
        p.frameRate(0);
      } else {
        p.frameRate(60);
      }
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
