import React from 'react';
import Page from '../components/page';
import { Dimensions } from '../lib/types';
import p5 from 'p5';
import { times } from 'lodash';

import P5Wrapper from 'react-p5-wrapper';

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * max) + min;
}

function sum<T>(array: T[], f: (arg0: T) => number) {
  return array.reduce((accum, p) => accum + f(p), 0);
}

interface OrbitPosition {
  arc: number;
  radius: number;
  speed: number;
}

const Spiro = ({ width, height }: Dimensions) => {
  const numPoints = 50000;
  const renderSpeed = 2500;
  const colorEnabled = false;

  let counter = 0;

  function getPoint(radius: number, angle: number) {
    const xCoordinate = width / 2 + radius * Math.cos(angle);
    const yCoordinate = height / 2 + radius * Math.sin(angle);
    return { x: xCoordinate, y: yCoordinate };
  }

  const sketch = (p: p5) => {
    const positions: OrbitPosition[] = [];

    const addComplexity = () => {
      positions.push({
        radius: randInt(50, 300),
        arc: randInt(0, 360),
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

  return <P5Wrapper sketch={sketch} />;
};

export default function Spiro2DPage() {
  return (
    <Page>
      <Spiro width={window.innerWidth} height={window.innerHeight} />
    </Page>
  );
}
