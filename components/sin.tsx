import * as p5 from 'p5';
import P5Wrapper from 'react-p5-wrapper';
import React from 'react';
import Page from './page';

const Bendy = () => {
  const sketch = (p: p5) => {
    let counter = 0;
    const width = p.windowWidth;
    const height = p.windowHeight;

    p.setup = () => {
      p.createCanvas(width, height);
      p.strokeWeight(30);
      p.background('#4A2500');
      p.frameRate(60);
      p.stroke('#cffdff');
    };

    p.draw = () => {
      p.background('#4A2500');
      for (let i = 0; i < 20; i++) {
        p.point(
          ((p.sin((Math.PI * (counter + p.mouseX)) / 1000) + 1) * width) / 4 +
            width / 4,
          ((p.sin((2 * Math.PI * (counter + p.mouseY)) / 1000) + 1) * height) /
            4 +
            height / 4,
        );
        counter += 1;
      }
    };
  };

  return <P5Wrapper sketch={sketch} />;
};

export default function SinPage() {
  return (
    <Page>
      <Bendy />
    </Page>
  );
}
