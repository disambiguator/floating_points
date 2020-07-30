import React, { useEffect, useRef } from 'react';
import Page from './page';

const translateDistance = 1;
const width = 800;
const height = 800;

const Divide = () => {
  let topX = 0;
  let bottomX = 0;
  let timer = 0;

  const ref = useRef<HTMLCanvasElement>(null);
  let mount: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  useEffect(() => {
    mount = ref.current!;
    ctx = mount.getContext('2d')!;
    ctx.lineWidth = 5;
  });

  const animate = () => {
    if (timer % 5 === 0) {
      topX = Math.random() * 800;
      bottomX = Math.random() * 800;

      ctx.beginPath();
      ctx.strokeStyle = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
      ctx.moveTo(topX, 0);
      ctx.lineTo(bottomX, 800);
      ctx.stroke();
    }

    ctx.save();

    const rightRegion = new Path2D();
    rightRegion.moveTo(topX, 0);
    rightRegion.lineTo(bottomX, 800);
    rightRegion.lineTo(800, 800);
    rightRegion.lineTo(800, 0);
    rightRegion.lineTo(topX, 0);
    ctx.clip(rightRegion);
    ctx.translate(translateDistance, 0);
    ctx.drawImage(mount, translateDistance, 0);
    ctx.restore();

    ctx.save();
    const leftRegion = new Path2D();
    leftRegion.moveTo(topX, 0);
    leftRegion.lineTo(bottomX, 800);
    leftRegion.lineTo(0, 800);
    leftRegion.lineTo(0, 0);
    leftRegion.lineTo(topX, 0);
    ctx.clip(leftRegion);
    ctx.translate(-translateDistance, 0);
    ctx.drawImage(mount, -translateDistance, 0);
    ctx.restore();

    timer++;
  };

  useEffect(() => {
    const interval = setInterval(animate, 20);

    return () => {
      clearInterval(interval);
    };
  });

  return <canvas width={width} height={height} ref={ref} />;
};

export default function DividePage() {
  return (
    <Page>
      <Divide />
    </Page>
  );
}
