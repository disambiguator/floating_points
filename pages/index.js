import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const pages = [
  // { name: 'Pixelsorting', path: '/pixel_sort' },
  {
    name: 'Spirographs',
    path: '/spiro',
    description: (
      <p>
        Generative shapes loosely based off a model of planetary motion, with
        customization and post-processing effects built for experimentation and
        play. This is a work in progress toward a VJing platform to use in
        performance. Imagery can be controlled via MIDI inputs and sliders, and
        can also transition to other scenes I've built. ThreeJS and GLSL.
      </p>
    ),
  },
  {
    name: 'Dusen',
    path: '/dusen',
    description: (
      <p>
        Seeing how texture and vibrancy I can add with simple shapes and colors.
        Written with a fragment shader and using signed distance functions and
        blending cosine color gradients.
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
    name: 'Kaleidoscope',
    path: '/kaleidoscope',
    description: (
      <p>
        Music visualization using randomly generated shapes, shaders, and live
        music reactivity. Written in ThreeJS and GLSL, music by{' '}
        <a href="https://soundcloud.com/bjornfree">Bjorn</a>.
      </p>
    ),
  },
  // { name: 'Cubes', path: '/cubes' },
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

const endPoints = ({ width, height, slope }) => {
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

class Scatter extends React.Component {
  constructor(props) {
    super(props);
    this.setNewFragmentWidth();
    this.timer = 0;
    this.state = { interval: null };
  }

  componentDidMount() {
    this.ctx = this.mount.getContext('2d');

    this.updateDimensions();
    const { width, height } = this.mount;

    this.interval = setInterval(this.animate, 50);
    window.addEventListener('resize', this.updateDimensions);
    this.ctx.lineWidth = 5;
    this.ctx.fillRect(0, 0, width, height);
    this.ctx.fillStyle = '#646464';
    this.ctx.textAlign = 'center';
    this.ctx.font = '80px Courier New';
  }

  updateDimensions = () => {
    const temp = this.ctx.getImageData(
      0,
      0,
      this.mount.width,
      this.mount.height,
    );

    this.mount.width = window.innerWidth;
    this.mount.height = window.innerHeight;

    this.ctx.putImageData(temp, 0, 0);
  };

  componentWillUnmount() {
    clearInterval(this.interval);
    if (this.state.interval) clearInterval(this.state.interval);
    window.removeEventListener('resize', this.updateDimensions);
  }

  setNewFragmentWidth = () => {
    this.fragmentWidth = Math.floor(Math.random() * 15) + 1;
  };

  animate = () => {
    const { width, height } = this.mount;

    if (this.timer % this.fragmentWidth === 0) {
      this.slopeX = Math.random() * 10 - 5;
      this.slopeY = Math.random() * 10 - 5;
      const slope = this.slopeY / this.slopeX;

      this.points = endPoints({ width, height, slope });

      this.ctx.beginPath();

      const r = Math.random() * 100;

      this.ctx.strokeStyle = `rgb(${r},${r},${r})`;
      this.ctx.moveTo(this.points[0].x, this.points[0].y);
      this.ctx.lineTo(this.points[1].x, this.points[1].y);
      this.ctx.stroke();

      this.setNewFragmentWidth();
    }

    this.ctx.save();

    const rightRegion = new Path2D();
    rightRegion.moveTo(this.points[0].x, this.points[0].y);
    rightRegion.lineTo(this.points[1].x, this.points[1].y);
    rightRegion.lineTo(width, height);
    rightRegion.lineTo(width, 0);
    rightRegion.lineTo(this.points[0].x, this.points[0].y);
    this.ctx.clip(rightRegion);
    this.ctx.translate(this.slopeX, this.slopeY);
    this.ctx.drawImage(this.mount, translateDistance, 0);
    this.ctx.restore();

    this.ctx.save();
    const leftRegion = new Path2D();
    leftRegion.moveTo(this.points[0].x, this.points[0].y);
    leftRegion.lineTo(this.points[1].x, this.points[1].y);
    leftRegion.lineTo(0, height);
    leftRegion.lineTo(0, 0);
    leftRegion.lineTo(this.points[0].x, this.points[0].y);
    this.ctx.clip(leftRegion);
    this.ctx.translate(-this.slopeX, -this.slopeY);
    this.ctx.drawImage(this.mount, -translateDistance, 0);
    this.ctx.restore();

    this.timer++;
  };

  render() {
    return (
      <div>
        <Contents>
          <h2>Paras Sanghavi</h2>
          <SubHeading>A series of visual experiments.</SubHeading>
          {pages.map((p) => (
            <Section
              key={p.name}
              onMouseEnter={() => {
                if (this.state.interval) clearInterval(this.state.interval);
                const { width, height } = this.mount;
                this.ctx.fillText(
                  p.name,
                  width * Math.random() * 0.9,
                  height * Math.random() * 0.9,
                );
                const interval = setInterval(() => {
                  this.ctx.fillText(
                    p.name,
                    width * Math.random() * 0.9,
                    height * Math.random() * 0.9,
                  );
                }, 750);
                this.setState({ interval });
              }}
              onMouseLeave={() => {
                clearInterval(this.state.interval);
                this.setState({ interval: null });
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
            <a href="github.com/disambiguator/floating_points">GitHub</a>
            {' | '}
            <a href="mailto:paras@disambiguo.us">email</a>
          </p>
        </Contents>
        <canvas
          style={{ position: 'fixed', top: 0, left: 0 }}
          width={1}
          height={1}
          ref={(mount) => {
            this.mount = mount;
          }}
        />
      </div>
    );
  }
}

export default Scatter;
