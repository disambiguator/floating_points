import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const pages = [
  // { name: 'Pixelsorting', path: '/pixel_sort' },
  {
    name: 'Spirographs',
    path: '/spiro',
    description: (
      <p>
        Loosely based off a model of planetary motion, generative shapes and
        shaders built for experimentation and play. This is a work in progress
        toward a VJing platform to use in live performance. Imagery can be
        controlled via in-page sliders and MIDI inputs and can also transition
        to other scenes. ThreeJS and GLSL.
      </p>
    ),
  },
  {
    name: 'Dusen',
    path: '/dusen',
    description: (
      <p>
        Seeing how much texture and vibrancy I can add with simple shapes and
        colors. Written with a fragment shader using signed distance functions
        and blending cosine color gradients.
      </p>
    ),
  },
  {
    name: 'Warp',
    path: '/bendy',
    description: (
      <p>
        A wormhole feedback effect with interactive mouse movements and canvas
        manipulation. Written in p5.js.
      </p>
    ),
  },
  {
    name: 'Divide',
    path: '/divide',
    description: <p>A soothing color tunnel, written in pure HTML canvas.</p>,
  },
  {
    name: 'Cubes',
    path: '/cubes',
    description: (
      <p>
        A quick experiment to explore perspective cameras. Click and drag to
        move the angle of the camera.
      </p>
    ),
  },
  // { name: 'Overlap', path: '/overlap' },
];

const translateDistance = 1;

const PageTitle = styled.div`
  font-weight: bold;
  font-size: 20px;
  padding-top: 20px;
`;

const Section = styled.div``;

const Contents = styled.div`
  @font-face {
    font-family: 'Inconsolata';
    src: url('Inconsolata-Medium.ttf');
  }

  color: white;
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 400px;
  display: flex;
  padding: 20px;
  margin: 10px;
  flex-direction: column;
  justify-content: center;
  font-family: 'Inconsolata', monospace;
  font-size: 17px;
  line-height: 20px;
  background-color: rgba(255, 255, 255, 0.1);

  @media only screen and (max-width: 400px) {
    width: auto;
  }

  a,
  a:visited,
  a:hover,
  a:active {
    color: inherit;
  }
`;

const SubHeading = styled.div`
  padding-bottom: 10px;
`;

const endPoints = ({
  width,
  height,
  slope,
}: {
  width: number;
  height: number;
  slope: number;
}) => {
  const interceptX = Math.random() * width;
  const interceptY = Math.random() * height;
  const m = slope;
  const b = interceptY - m * interceptX;

  return [
    { x: -b / m, y: 0 },
    { x: 0, y: b },
    { x: (height - b) / m, y: height },
    { x: width, y: m * width + b },
  ].filter(
    (point) =>
      point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height,
  );
};

const setNewFragmentWidth = () => Math.floor(Math.random() * 15) + 1;

const Scatter = () => {
  const [hoverInterval, setHoverInterval] = useState<NodeJS.Timeout | null>();
  const fragmentWidth = setNewFragmentWidth();
  let timer = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let slopeX = 0;
  let slopeY = 0;
  let points: { x: number; y: number }[];
  let ctx: CanvasRenderingContext2D;
  let canvas: HTMLCanvasElement;

  const updateDimensions = () => {
    const temp = ctx.getImageData(0, 0, canvas.width, canvas.height);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.putImageData(temp, 0, 0);
  };

  const animate = () => {
    const { width, height } = canvas;

    if (timer % fragmentWidth === 0) {
      slopeX = Math.random() * 10 - 5;
      slopeY = Math.random() * 10 - 5;
      const slope = slopeY / slopeX;

      points = endPoints({ width, height, slope });

      ctx.beginPath();

      const r = Math.random() * 100;

      ctx.strokeStyle = `rgb(${r},${r},${r})`;
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();

      setNewFragmentWidth();
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

    timer++;
  };

  useEffect(() => {
    canvas = canvasRef.current!;
    ctx = canvas.getContext('2d')!;
  });

  useEffect(() => {
    updateDimensions();
    const { width, height } = canvas;

    const animateInterval = window.setInterval(animate, 50);
    window.addEventListener('resize', updateDimensions);
    ctx.lineWidth = 5;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#646464';
    ctx.textAlign = 'center';
    ctx.font = '80px Courier New';

    return () => {
      clearInterval(animateInterval);
      if (hoverInterval) clearInterval(hoverInterval);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div>
      <Contents>
        <SubHeading>A series of visual experiments.</SubHeading>
        {pages.map((p) => (
          <Section
            key={p.name}
            onMouseEnter={() => {
              if (hoverInterval) clearInterval(hoverInterval);
              const { width, height } = canvas;
              ctx.fillText(
                p.name,
                width * Math.random() * 0.9,
                height * Math.random() * 0.9,
              );
              setHoverInterval(
                setInterval(() => {
                  ctx.fillText(
                    p.name,
                    width * Math.random() * 0.9,
                    height * Math.random() * 0.9,
                  );
                }, 750),
              );
            }}
            onMouseLeave={() => {
              if (hoverInterval) {
                clearInterval(hoverInterval);
                setHoverInterval(null);
              }
            }}
          >
            <PageTitle>
              <Link href={p.path}>
                <a>{p.name}</a>
              </Link>
            </PageTitle>
            {p.description}
          </Section>
        ))}
        <p>
          by Paras Sanghavi{' | '}
          <a href="github.com/disambiguator/floating_points">github</a>
          {' | '}
          <a href="mailto:paras@disambiguo.us">email</a>
        </p>
      </Contents>
      <canvas
        style={{ position: 'fixed', top: 0, left: 0 }}
        width={1}
        height={1}
        ref={canvasRef}
      />
    </div>
  );
};

export default Scatter;
