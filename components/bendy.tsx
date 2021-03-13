import * as p5 from 'p5';
import React from 'react';
import P5Wrapper from 'react-p5-wrapper';
import styled from 'styled-components';
import Page from './page';

const FixedSketch = styled(P5Wrapper)`
  canvas {
    position: fixed;
  }
`;

const Bendy = () => {
  const sketch = (p: p5) => {
    let initialArc = 0;
    let counter = 0;
    const coordinates = 0;
    let buffer: p5.Graphics;
    const points = 30;
    let width = p.windowWidth;
    let height = p.windowHeight;
    let radius = p.windowWidth / 2;
    const arc = 360 / points;
    const hypotenuse = radius;
    let lineIncrement = 130;
    let zoomX = 0;
    let zoomY = 0;
    const zoom = 20;

    const drawCircle = () => {
      for (let i = 0; i < points; i++) {
        const angle = initialArc + (arc * i * Math.PI) / 180;

        const xCoordinate = width / 2 + hypotenuse * Math.cos(angle);
        const yCoordinate = height / 2 + hypotenuse * Math.sin(angle);

        buffer.point(xCoordinate, yCoordinate);
      }
    };

    const mouseDistanceFromCenter = () => {
      return {
        x: p.mouseX - width / 2,
        y: p.mouseY - height / 2,
      };
    };

    p.setup = () => {
      p.createCanvas(width, height);
      buffer = p.createGraphics(width, height);
      buffer.strokeWeight(5);
      buffer.background(0, 0, 0);
      p.frameRate(60);
      buffer.stroke(255, 255, 255, 255);
      p.draw();
    };

    const drawLine = () => {
      const angle1 = initialArc + (arc * coordinates * Math.PI) / 180;

      const x1 = width / 2 + hypotenuse * Math.cos(angle1);
      const y1 = height / 2 + hypotenuse * Math.sin(angle1);

      const angle2 =
        initialArc + ((arc * coordinates + lineIncrement) * Math.PI) / 180;

      const x2 = width / 2 + hypotenuse * Math.cos(angle2);
      const y2 = height / 2 + hypotenuse * Math.sin(angle2);

      buffer.line(x1, y1, x2, y2);
    };

    p.mouseMoved = () => {
      const distance = mouseDistanceFromCenter();
      zoomX = distance.x;
      zoomY = distance.y;
    };

    p.touchMoved = () => {
      const distance = mouseDistanceFromCenter();
      zoomX = distance.x;
      zoomY = distance.y;
    };

    p.draw = () => {
      buffer.image(
        buffer,
        -zoomX,
        -zoomY,
        width + 2 * zoomX,
        height + 2 * zoomY,
      );
      for (let i = 0; i < 10; i++) {
        buffer.background(0, 0, 0, 5);
        initialArc += 1;
        drawCircle();
        drawLine();

        lineIncrement -= 0.1;

        counter += 1;
        if (counter > 1000) counter = 0;
      }

      p.image(buffer, zoom, zoom, width - 2 * zoom, height - 2 * zoom);
    };

    p.windowResized = () => {
      radius = p.windowWidth / 2;
      width = p.windowWidth;
      height = p.windowHeight;

      p.resizeCanvas(width, height);

      const newBuffer = p.createGraphics(width, height);
      newBuffer.strokeWeight(5);
      newBuffer.background(0, 0, 0);
      newBuffer.stroke(255, 255, 255, 255);
      newBuffer.image(buffer, 0, 0, width, height);

      buffer.remove();
      buffer = newBuffer;
    };
  };

  return <FixedSketch sketch={sketch} />;
};

export default function BendyPage() {
  return (
    <Page>
      <Bendy />
    </Page>
  );
}
