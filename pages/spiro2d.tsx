import { times } from 'lodash';
import type p5 from 'p5';
import React from 'react';
import { ReactP5Wrapper } from 'components/p5_wrapper';
import Page from 'components/page';
import { randInt } from 'lib/helpers';

function sum<T>(array: T[], f: (arg0: T) => number) {
  return array.reduce((accum, p) => accum + f(p), 0);
}

type OrbitPosition = {
  arc: number;
  radius: number;
  speed: number;
};

const Spiro = () => {
  const numPoints = 50000;
  const renderSpeed = 2500;
  const colorEnabled = false as boolean;

  let counter = 0;

  const sketch = (p: p5) => {
    const width = p.windowWidth;
    const height = p.windowHeight;

    function getPoint(radius: number, angle: number) {
      const xCoordinate = width / 2 + radius * Math.cos(angle);
      const yCoordinate = height / 2 + radius * Math.sin(angle);
      return { x: xCoordinate, y: yCoordinate };
    }
    const positions: OrbitPosition[] = [];

    const addComplexity = () => {
      positions.push({
        radius: randInt(50, 300),
        arc: randInt(360),
        speed: (randInt(1, 10) * 360) / (randInt(10, 100) + numPoints),
      });
    };

    function strokeColor(x: number, y: number) {
      const r = p.random((x / width) * 255);
      const g = p.random((y / height) * 255);
      const b = p.random((y / height) * 255);

      p.stroke(r, g, b);
    }

    p.setup = () => {
      p.createCanvas(width, height);
      p.frameRate(30);
      p.background('black');
      p.fill('white');
      p.stroke('white');
      p.strokeWeight(1);

      times(10, addComplexity);
    };

    // function setRandomStroke() {
    //   const r = p.random(255);
    //   const g = p.random(255);
    //   const b = p.random(255);

    //   p.stroke(r, g, b, 100);
    // }

    // function setRenderSpeed(v) {
    //   renderSpeed = v;
    // }

    p.draw = () => {
      p.background(0, 0, 0, 5);
      for (let i = 0; i < renderSpeed; i++) {
        const points = positions.map((p) => getPoint(p.radius, p.arc));

        positions.forEach(function (p) {
          p.arc += p.speed;
        });

        const points2 = positions.map((p) => getPoint(p.radius, p.arc));

        const x1 = sum(points, (p) => p.x) / points.length;
        const y1 = sum(points, (p) => p.y) / points.length;

        if (colorEnabled) {
          strokeColor(x1, y1);
        }

        p.line(
          x1,
          y1,
          sum(points2, (p) => p.x) / points.length,
          sum(points2, (p) => p.y) / points.length,
        );
      }

      if (counter > 1000) {
        p.frameRate(0);
      }
      counter++;
    };

    // function toggleColor() {
    //   if (colorEnabled) {
    //     stroke('white');
    //     colorEnabled = false;
    //   } else {
    //     colorEnabled = true;
    //   }
    // }
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default function Spiro2DPage() {
  return (
    <Page>
      <Spiro />
    </Page>
  );
}
