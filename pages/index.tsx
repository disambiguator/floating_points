import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import assetUrl from '../lib/assetUrl';
import { useIsMobile } from '../lib/mediaQueries';
import styles from './index.module.scss';

const artwork = [
  {
    name: 'Shader Gallery',
    path: '/shaders',
    description: (
      <p>
        A collection of various GLSL shaders I have written for textures,
        performance, and audio reactivity.
      </p>
    ),
  },
  {
    name: 'Void',
    path: '/void',
    description: (
      <p>
        A music video and visualization for Bjorn Free - Void, from the Dawn EP.
      </p>
    ),
  },
  {
    name: 'Spirographs',
    path: '/scenes/spiro',
    previewPath: '/spiro',
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
    path: '/scenes/dusen',
    previewPath: '/dusen',
    description: (
      <p>
        Seeing how much texture and vibrancy I can add with simple shapes and
        colors. Written with a fragment shader using signed distance functions
        and blending cosine color gradients.
      </p>
    ),
  },
  {
    name: 'Stark',
    path: '/stark',
    description: (
      <p>
        Audio reactive shader using microphone input as a texture. Inspired by
        Jen Stark.
      </p>
    ),
  },
  {
    name: 'Glass',
    path: '/glass',
    description: (
      <p>Glass shattering motion and intersection detection in p5.js</p>
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
  const fragmentWidth = setNewFragmentWidth();
  let timer = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let slopeX = 0;
  let slopeY = 0;
  let points: { x: number; y: number }[];

  const isMobile = useIsMobile();

  const updateDimensions = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const temp = ctx.getImageData(0, 0, canvas.width, canvas.height);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(temp, 0, 0);
  };

  const animate = () => {
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
    updateDimensions();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;

    const animateInterval = window.setInterval(animate, 50);
    window.addEventListener('resize', updateDimensions);
    ctx.lineWidth = 5;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#646464';

    return () => {
      clearInterval(animateInterval);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div>
      <style global jsx>{`
        html {
          background-color: black;
        }
      `}</style>
      <div className={styles.root}>
        <div className={styles.contents}>
          <h1>Paras Sanghavi</h1>
          <div className={styles.subheading}>
            web developer and generative artist based in San Francisco.
          </div>
          <div>
            {'contact me: '}
            <a href="mailto:paras@disambiguo.us">email</a>
            {' | '}
            <a href="https://www.instagram.com/disambiguator/">instagram</a>
            {' | '}
            <a href="https://github.com/disambiguator">github</a>
            {' | '}
            <a href="https://linkedin.com/in/psanghavi">linkedin</a>
          </div>
        </div>

        <div className={styles.gallery}>
          {artwork.map((p) => (
            <div className={styles.galleryItem} key={p.name}>
              <Link href={p.path} passHref>
                <video
                  loop
                  autoPlay={isMobile}
                  style={{ cursor: 'pointer' }}
                  //@ts-ignore
                  onMouseOver={(event) => event.target.play()}
                  //@ts-ignore
                  onMouseOut={(event) => event.target.pause()}
                >
                  <source
                    src={assetUrl(`${p.previewPath || p.path}.mp4`)}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </Link>
              <Link href={p.path}>
                <a className={styles.title}>{p.name}</a>
              </Link>
              {p.description}
            </div>
          ))}
        </div>
      </div>
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
