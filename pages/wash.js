import React from 'react'
import styled from 'styled-components'

const width = 800
const height = 800

let timer = 0

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const inRange = point =>
  point.x >= 0 && point.x <= 800 && point.y >= 0 && point.y <= 800

const endPoints = () => {
  const slopeX = Math.random() * 10 - 5
  const slopeY = Math.random() * 10 - 5
  const interceptX = Math.random() * 800
  const interceptY = Math.random() * 800
  const m = slopeY / slopeX
  const b = interceptY - m * interceptX

  return [
    { x: -b / m, y: 0 },
    { x: 0, y: b },
    { x: (height - b) / m, y: height },
    { x: width, y: m * width + b },
  ].filter(inRange)
}

class Scatter extends React.Component {
  componentDidMount() {
    this.ctx = this.mount.getContext('2d')
    this.ctx.lineWidth = 5

    setInterval(this.animate, 20)
  }

  componentWillUnmount() {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = window.requestAnimationFrame(this.animate)
    }
  }

  stop = () => {
    window.cancelAnimationFrame(this.frameId)
  }

  animate = () => {
    if (timer % 50 === 0) {
      this.points = endPoints()
    }

    this.ctx.beginPath()
    this.ctx.strokeStyle = '#' + (((1 << 24) * Math.random()) | 0).toString(16)
    this.ctx.moveTo(this.points[0].x, this.points[0].y)
    this.ctx.lineTo(this.points[1].x, this.points[1].y)
    this.ctx.stroke()

    this.ctx.save()

    // const rightRegion = new Path2D()
    // rightRegion.moveTo(this.points[0].x, this.points[0].y);
    // rightRegion.lineTo(this.points[1].x, this.points[1].y);
    // rightRegion.lineTo(width, height)
    // rightRegion.lineTo(width, 0)
    // rightRegion.lineTo(this.points[0].x, 0)
    // this.ctx.clip(rightRegion);
    // this.ctx.translate(translateDistance, 0);
    // this.ctx.drawImage(this.mount, translateDistance, 0);
    // this.ctx.restore();
    //
    // this.ctx.save();
    // const leftRegion = new Path2D()
    // leftRegion.moveTo(this.topX, 0)
    // leftRegion.lineTo(this.bottomX, 800)
    // leftRegion.lineTo(0, 800)
    // leftRegion.lineTo(0, 0)
    // leftRegion.lineTo(this.topX, 0)
    // this.ctx.clip(leftRegion);
    this.ctx.scale(1.01, 1.01)
    this.ctx.drawImage(this.mount, 0, 0)
    this.ctx.restore()

    timer++
  }

  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  render() {
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
          width={width}
          height={height}
          ref={mount => {
            this.mount = mount
          }}
        />
      </Container>
    )
  }
}

export default Scatter
