import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`


class Scatter extends React.Component {
  componentDidMount () {
    this.ctx = this.mount.getContext('2d');
    this.ctx.lineWidth = 10;

    setInterval(this.animate, 50)
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
    const translateDistance = 5
    const topX = Math.random() * 800
    const bottomX = Math.random() * 800

    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.strokeStyle = "#"+((1<<24)*Math.random()|0).toString(16);
    this.ctx.moveTo(topX, 0);
    this.ctx.lineTo(bottomX, 800);
    this.ctx.stroke();

    const rightRegion = new Path2D()
    rightRegion.moveTo(topX, 0)
    rightRegion.lineTo(bottomX, 800)
    rightRegion.lineTo(800, 800)
    rightRegion.lineTo(800, 0)
    rightRegion.lineTo(topX, 0)
    this.ctx.clip(rightRegion);
    this.ctx.translate(translateDistance, 0);
    this.ctx.drawImage(this.mount, translateDistance, 0);
    this.ctx.restore();

    this.ctx.save();
    const leftRegion = new Path2D()
    leftRegion.moveTo(topX, 0)
    leftRegion.lineTo(bottomX, 800)
    leftRegion.lineTo(0, 800)
    leftRegion.lineTo(0, 0)
    leftRegion.lineTo(topX, 0)
    this.ctx.clip(leftRegion);
    this.ctx.translate(-translateDistance, 0);
    this.ctx.drawImage(this.mount, -translateDistance, 0);
    this.ctx.restore();

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
