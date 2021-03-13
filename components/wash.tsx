import React, { useEffect, useRef } from 'react';
import Page from '../components/page';
import { Dimensions } from '../lib/types';

let timer = 0;

interface Point {
  x: number;
  y: number;
}

const Scatter = ({ width, height }: Dimensions) => {
  const ref = useRef<HTMLCanvasElement>(null);
  let points: Array<Point>;
  let mount: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  const inRange = (point: Point) =>
    point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height;

  const endPoints = () => {
    const slopeX = Math.random() * 10 - 5;
    const slopeY = Math.random() * 10 - 5;
    const interceptX = Math.random() * width;
    const interceptY = Math.random() * height;
    const m = slopeY / slopeX;
    const b = interceptY - m * interceptX;

    return [
      { x: -b / m, y: 0 },
      { x: 0, y: b },
      { x: (height - b) / m, y: height },
      { x: width, y: m * width + b },
    ].filter(inRange);
  };

  const animate = () => {
    if (timer % 50 === 0) {
      points = endPoints();
    }

    ctx.beginPath();
    ctx.strokeStyle = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();

    ctx.save();

    ctx.scale(1.01, 1.01);
    ctx.drawImage(mount, 0, 0);
    ctx.restore();

    timer++;
  };

  useEffect(() => {
    mount = ref.current!;
    ctx = mount.getContext('2d')!;
    ctx.lineWidth = 5;

    const interval = setInterval(animate, 20);

    return () => {
      clearInterval(interval);
    };
  });

  return <canvas width={width} height={height} ref={ref} />;
};

export default function WashPage() {
  return (
    <Page>
      <Scatter width={window.innerWidth} height={window.innerHeight} />
    </Page>
  );
}
