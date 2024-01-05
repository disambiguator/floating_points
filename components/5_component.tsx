import { sample } from 'lodash';
import React, { useEffect, useRef } from 'react';
import { randInt } from 'lib/helpers';

const translateDistance = 1;
const squareLength = 400;

type Point = { x: number; y: number };

const endPoints = ({
  width,
  height,
  slope,
}: {
  width: number;
  height: number;
  slope: number;
}): [Point, Point] => {
  const interceptX = Math.random() * width;
  const interceptY = Math.random() * height;
  const m = slope;
  const b = interceptY - m * interceptX;

  return [
    { x: -b / m, y: 0 },
    { x: 0, y: b },
    { x: (height - b) / m, y: height },
    { x: width, y: m * width + b },
  ]
    .filter(
      (point) =>
        point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height,
    )
    .map(({ x, y }) => ({ x: Math.floor(x), y: Math.floor(y) })) as [
    Point,
    Point,
  ];
};

const setNewFragmentWidth = () => randInt(1, 6);

const Scatter = () => {
  let fragmentWidth = setNewFragmentWidth();
  let timer = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let slopeX = 0;
  let slopeY = 0;
  let points: [Point, Point];

  const reset = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;
    const colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e'];
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = sample(colors)!;
    ctx.fillRect(
      (width - squareLength) / 2,
      (height - squareLength) / 2,
      squareLength,
      squareLength,
    );
    timer = 0;
  };

  const animate = () => {
    timer++;

    if (timer < 100) return;

    const canvas = canvasRef.current;
    if (canvas == null) return;

    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;

    if (timer % fragmentWidth === 0) {
      slopeX = Math.random() * 10 - 5;
      slopeY = Math.random() * 10 - 5;
      const slope = slopeY / slopeX;

      points = endPoints({ width, height, slope });

      ctx.beginPath();

      ctx.lineWidth = 1;
      const r = Math.random() * 100;
      const g = Math.random() * 100;
      const b = Math.random() * 100;
      ctx.strokeStyle = `rgb(${r},${g},${b})`;
      ctx.strokeStyle = 'white';
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();

      fragmentWidth = setNewFragmentWidth();
    }

    ctx.save();

    const rightRegion = new Path2D();
    rightRegion.moveTo(points[0].x, points[0].y);
    rightRegion.lineTo(points[1].x, points[1].y);
    rightRegion.lineTo(width, height);
    rightRegion.lineTo(width, 0);
    rightRegion.lineTo(points[0].x, points[0].y);
    ctx.clip(rightRegion);
    ctx.translate(slopeX, slopeY);
    ctx.drawImage(canvas, translateDistance, 0);

    ctx.restore();

    ctx.save();
    const leftRegion = new Path2D();
    leftRegion.moveTo(points[0].x, points[0].y);
    leftRegion.lineTo(points[1].x, points[1].y);
    leftRegion.lineTo(0, height);
    leftRegion.lineTo(0, 0);
    leftRegion.lineTo(points[0].x, points[0].y);
    ctx.clip(leftRegion);
    ctx.translate(-slopeX, -slopeY);
    ctx.drawImage(canvas, -translateDistance, 0);

    ctx.restore();

    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();

    if (timer > 1000) {
      reset();
    }
  };

  useEffect(() => {
    reset();

    const animateInterval = window.setInterval(animate, 1000 / 60);
    return () => {
      clearInterval(animateInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <canvas
        style={{ position: 'fixed', top: 0, left: 0 }}
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasRef}
      />
    </div>
  );
};

export default Scatter;
