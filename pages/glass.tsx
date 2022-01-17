import * as p5 from 'p5';
import React from 'react';
import { ReactP5Wrapper } from 'components/p5_wrapper';
import Page from 'components/page';

type Crack = {
  x: number;
  y: number;
  angle?: number | undefined;
  originX: number;
  originY: number;
};

const Bendy = () => {
  const sketch = (p: p5) => {
    const width = p.windowWidth;
    const height = p.windowHeight;

    const weight = 1;
    const distance = 1;
    let i = 0;
    const cracks: Crack[] = [];

    function setGradient(c1: p5.Color, c2: p5.Color) {
      p.noFill();
      for (let x = -height; x < width; x++) {
        const inter = p.map(x, -height, width, 0, 1);
        const c = p.lerpColor(c1, c2, inter);
        p.stroke(c);
        p.line(x, 0, x + height, height);
      }
    }

    const intersectsCracks = (crack: Crack, x: number, y: number) =>
      cracks.find(
        (c: Crack) =>
          c !== crack && linePoint(c.originX, c.originY, c.x, c.y, x, y),
      );

    function linePoint(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      px: number,
      py: number,
    ) {
      const d1 = p.dist(px, py, x1, y1);
      const d2 = p.dist(px, py, x2, y2);

      const lineLen = p.dist(x1, y1, x2, y2);

      const buffer = 0.01;

      if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
        return true;
      }
      return false;
    }

    p.setup = () => {
      p.createCanvas(width, height);
      p.frameRate(60);
      p.strokeWeight(weight);

      const c1 = p.color(8, 38, 69);
      const c2 = p.color(8, 18, 69);
      setGradient(c1, c2);

      p.stroke(219, 193, 96);
    };

    p.draw = () => {
      if (i++ % 20 === 0) {
        addPoint(Math.random() * width, Math.random() * height);
      }

      const activeCracks = cracks.filter(({ angle }) => angle !== undefined);

      if (activeCracks.length === 0) {
        p.frameRate(0);
        console.log('goodbye');
        return;
      }

      activeCracks.forEach((crack) => {
        if (crack.angle === undefined) return;

        const { x, y, angle } = crack;
        const newX = x + distance * p.cos(angle);
        const newY = y + distance * p.sin(angle);

        p.line(x, y, newX, newY);

        if (newX > width || newY > height) {
          crack.angle = undefined;
          return;
        }

        if (intersectsCracks(crack, newX, newY)) {
          p.strokeWeight(7);
          p.point(newX, newY);
          p.strokeWeight(weight);
          crack.angle = undefined;
          return;
        }

        crack.x = newX;
        crack.y = newY;
      });
    };

    const addPoint = (x: number, y: number) => {
      p.frameRate(60);

      // const points = 3 + Math.floor(Math.random() * 5);
      // const offset = Math.random() * 360;

      const points = 3 + Math.floor(Math.random() * 3);
      const offset = Math.random() * 360;

      for (let i = 0; i < points; i++) {
        cracks.push({
          originX: x,
          originY: y,
          x,
          y,
          angle: p.radians((i * 360) / points + offset),
        });
      }
    };

    p.mouseClicked = () => {
      addPoint(p.mouseX, p.mouseY);
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default function WalkerPage() {
  return (
    <Page>
      <Bendy />
    </Page>
  );
}
