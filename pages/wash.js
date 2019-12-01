import React from 'react'
import styled from 'styled-components'
import Page from '../components/page'

let timer = 0

const inRange = point =>
  point.x >= 0 && point.x <= 800 && point.y >= 0 && point.y <= 800

class Scatter extends React.Component {
  componentDidMount() {
    this.ctx = this.mount.getContext('2d')
    this.ctx.lineWidth = 5

    setInterval(this.animate, 20)
  }

  componentWillUnmount() {
    this.stop()
  }

  endPoints = () => {
    const {width, height} = this.props

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

  animate = () => {
    if (timer % 50 === 0) {
      this.points = this.endPoints()
    }

    this.ctx.beginPath()
    this.ctx.strokeStyle = '#' + (((1 << 24) * Math.random()) | 0).toString(16)
    this.ctx.moveTo(this.points[0].x, this.points[0].y)
    this.ctx.lineTo(this.points[1].x, this.points[1].y)
    this.ctx.stroke()

    this.ctx.save()

    this.ctx.scale(1.01, 1.01)
    this.ctx.drawImage(this.mount, 0, 0)
    this.ctx.restore()

    timer++
  }

  render() {
    const {width, height} = this.props
    return (
        <canvas
          width={width}
          height={height}
          ref={mount => {
            this.mount = mount
          }}
        />
    )
  }
}

export default () => <Page>
  {({width, height}) => <Scatter width={800} height={800} />}
</Page>
