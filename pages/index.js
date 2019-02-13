const pages = [
  { name: 'Pixelsorting', path: '/pixel_sort' },
  { name: 'Spirographs', path: '/spiro' },
  { name: 'Visualizer', path: '/visualizer' },
  { name: 'Scatter', path: '/scatter' },
  { name: 'Cubes', path: '/cubes' },
]

import React from 'react';
import styled from 'styled-components';

const translateDistance = 1
let timer = 0

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Contents = styled.h1`
  color: white;
  z-index: 1;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`

const endPoints = ({ width, height }) => {
  const slopeX = Math.random() * 10 - 5
  const slopeY = Math.random() * 10 - 5
  const interceptX = Math.random() * width
  const interceptY = Math.random() * height
  const m = slopeY / slopeX
  const b = interceptY - m * interceptX

  return [
    { x: -b / m, y: 0 },
    { x: 0, y: b },
    { x: (height - b) / m, y: height },
    { x: width, y: m * width + b },
  ].filter((point) => (0 <= point.x && point.x <= width && 0 <= point.y && point.y <= height))
}

class Scatter extends React.Component {
  constructor (props) {
    super(props)
    this.state = { width: 0, height: 0 }
    this.setNewFragmentWidth()
  }

  componentDidMount() {
    setInterval(this.animate, 10)
    this.setState({ width: window.innerWidth, height: window.innerHeight })
  }

  componentDidUpdate () {
    this.ctx = this.mount.getContext('2d');
    this.ctx.lineWidth = 5;
    this.ctx.fillStyle = '#000000'
    this.ctx.fillRect(0, 0, this.state.width, this.state.height)
    this.ctx.fillStyle = '#ffffff'
    this.ctx.textAlign = "center";
    this.ctx.font = "50px Courier New";
    this.ctx.fillText("disambiguator", this.state.width/2, this.state.height/2);
  }

  setNewFragmentWidth = () => {
    this.fragmentWidth = Math.floor(Math.random() * 40) + 1
  }

  animate = () => {
    if (timer % this.fragmentWidth === 0) {
      this.points = endPoints({ width: this.state.width, height: this.state.height })

      this.ctx.beginPath();
      // this.ctx.strokeStyle = "#"+((1<<24)*Math.random()|0).toString(16);

      const r = Math.random() * 80;

      this.ctx.strokeStyle = `rgb(${r},${r},${r})`;
      this.ctx.moveTo(this.points[0].x, this.points[0].y);
      this.ctx.lineTo(this.points[1].x, this.points[1].y);
      this.ctx.stroke();

      this.setNewFragmentWidth()
    }

    this.ctx.save();

    const rightRegion = new Path2D()
    rightRegion.moveTo(this.points[0].x, this.points[0].y);
    rightRegion.lineTo(this.points[1].x, this.points[1].y);
    rightRegion.lineTo(this.state.width, this.state.height)
    rightRegion.lineTo(this.state.width, 0)
    rightRegion.lineTo(this.points[0].x, 0)
    this.ctx.clip(rightRegion);
    this.ctx.translate(translateDistance, 0);
    this.ctx.drawImage(this.mount, translateDistance, 0);
    this.ctx.restore();

    this.ctx.save();
    const leftRegion = new Path2D()
    leftRegion.moveTo(this.topX, 0)
    leftRegion.lineTo(this.bottomX, this.state.width)
    leftRegion.lineTo(0, this.state.height)
    leftRegion.lineTo(0, 0)
    leftRegion.lineTo(this.topX, 0)
    this.ctx.clip(leftRegion);
    this.ctx.translate(-translateDistance, 0);
    this.ctx.drawImage(this.mount, -translateDistance, 0);
    this.ctx.restore();

    timer++;
  }

  render () {
    return (
      <Contents>
        <h1>disambiguator</h1>
        {/*<ul>*/}
          {/*{pages.map((p) => (*/}
            {/*<li>*/}
              {/*<a href={p.path}>{p.name}</a>*/}
            {/*</li>*/}
          {/*))}*/}
        {/*</ul>*/}
        <Container>
          <style global jsx>{`
      html,
      body,
      body > div:first-child,
      div#__next,
      div#__next > div,
      div#__next > div > div {
        height: 100%;
        background: black;
      }
    `}</style>
          <canvas
            style={{ position: 'fixed', top: 0, left: 0 }}
            width={this.state.width}
            height={this.state.height}
            ref={mount => this.mount = mount}
          />
        </Container>
      </Contents>
    )
  }
}

export default Scatter
