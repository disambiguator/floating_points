import type * as p5 from 'p5';
import React from 'react';
import { ReactP5Wrapper } from 'components/p5_wrapper';
import Page from 'components/page';

type Walker = {
  x: number;
  y: number;
};

const visited: Array<Array<boolean>> = [];

const hasVisited = (x: number, y: number) => {
  if (visited[x] === undefined) visited[x] = [];

  if (visited[x][y] === true) return true;

  visited[x][y] = true;
  return false;
};

const Bendy = () => {
  const sketch = (p: p5) => {
    const width = p.windowWidth;
    const height = p.windowHeight;

    const newWalker = (): Walker => ({
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
    });

    const walkers: Walker[] = Array(20)
      .fill(undefined)
      .map(() => newWalker());

    const weight = 50;
    let c = 0;

    p.setup = () => {
      p.createCanvas(width, height);
      p.frameRate(60);
      p.colorMode(p.HSB);
      p.strokeWeight(weight);
    };

    p.draw = () => {
      if (walkers.length === 0) {
        p.frameRate(0);
        return;
      }

      if (c >= 255) c = 0;
      else c++;
      p.stroke(c, 255, 255);

      const step = 5;
      walkers.forEach((w) => {
        const choiceX = Math.floor(Math.random() * 3) - 1;
        const choiceY = Math.floor(Math.random() * 3) - 1;
        let newX = w.x + choiceX * step;
        let newY = w.y + choiceY * step;

        let tries = 0;
        while (hasVisited(newX, newY)) {
          tries++;
          if (tries > 100) {
            w.x = Math.random() * width;
            w.y = Math.random() * height;
            return;
          }

          const choiceX = Math.floor(Math.random() * 3) - 1;
          const choiceY = Math.floor(Math.random() * 3) - 1;
          newX = w.x + choiceX * step;
          newY = w.y + choiceY * step;
        }

        w.x = newX;
        w.y = newY;
        p.point(w.x, w.y);
      });
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
