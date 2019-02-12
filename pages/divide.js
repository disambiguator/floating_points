import React from 'react';
import styled from 'styled-components';

const translateDistance = 1
let timer = 0

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`


class Scatter extends React.Component {
  componentDidMount () {
    this.ctx = this.mount.getContext('2d');
    this.ctx.lineWidth = 5;

    setInterval(this.animate, 20)
  }

  componentWillUnmount () {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop = () => {
    cancelAnimationFrame(this.frameId)
  }

  animate = () => {
    if(timer % 5 === 0) {
      this.topX = Math.random() * 800
      this.bottomX = Math.random() * 800

      this.ctx.beginPath();
      this.ctx.strokeStyle = "#"+((1<<24)*Math.random()|0).toString(16);
      this.ctx.moveTo(this.topX, 0);
      this.ctx.lineTo(this.bottomX, 800);
      this.ctx.stroke();
    }

    this.ctx.save();

    const rightRegion = new Path2D()
    rightRegion.moveTo(this.topX, 0)
    rightRegion.lineTo(this.bottomX, 800)
    rightRegion.lineTo(800, 800)
    rightRegion.lineTo(800, 0)
    rightRegion.lineTo(this.topX, 0)
    this.ctx.clip(rightRegion);
    this.ctx.translate(translateDistance, 0);
    this.ctx.drawImage(this.mount, translateDistance, 0);
    this.ctx.restore();

    this.ctx.save();
    const leftRegion = new Path2D()
    leftRegion.moveTo(this.topX, 0)
    leftRegion.lineTo(this.bottomX, 800)
    leftRegion.lineTo(0, 800)
    leftRegion.lineTo(0, 0)
    leftRegion.lineTo(this.topX, 0)
    this.ctx.clip(leftRegion);
    this.ctx.translate(-translateDistance, 0);
    this.ctx.drawImage(this.mount, -translateDistance, 0);
    this.ctx.restore();

    timer++;
  }

  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  render () {
    return (
      <Container>
        <style global jsx>{`
      html,
      body,
      body > div:first-child,
      div#__next,
      div#__next > div,
      div#__next > div > div {
        height: 100%;
      }
    `}</style>

        <canvas
          width={800}
          height={800}
          ref={mount => this.mount = mount}
        />
      </Container>
    )
  }
}

export default Scatter
