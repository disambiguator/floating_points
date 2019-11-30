import React from 'react'
import dynamic from 'next/dynamic'
import Page from '../components/page'
import { Dimensions, P5WrapperComponent } from '../lib/types'
import * as p5 from 'p5'

const P5Wrapper: P5WrapperComponent = dynamic(
  () => import('react-p5-wrapper'),
  { ssr: false },
)

const Bendy = ({ height, width }: Dimensions) => {
  const sketch = (p: p5) => {
    let initialArc = 0
    let counter = 0
    const coordinates = 0
    let buffer: p5.Graphics
    const points = 30
    const radius = width / 2
    const arc = 360 / points
    const hypotenuse = radius
    let lineIncrement = 130
    let zoomX = 0
    let zoomY = 0
    const zoom = 20

    const drawCircle = () => {
      for (let i = 0; i < points; i++) {
        const angle = initialArc + (arc * i * Math.PI) / 180

        const xCoordinate = width / 2 + hypotenuse * Math.cos(angle)
        const yCoordinate = height / 2 + hypotenuse * Math.sin(angle)

        buffer.point(xCoordinate, yCoordinate)
      }
    }

    const mouseDistanceFromCenter = () => {
      return {
        x: p.mouseX - width / 2,
        y: p.mouseY - height / 2,
      }
    }

    p.setup = () => {
      p.createCanvas(width, height)
      buffer = p.createGraphics(width, height)
      buffer.strokeWeight(5)
      buffer.background(0, 0, 0)
      p.frameRate(60)
      buffer.stroke(255, 255, 255, 255)
      p.draw()
    }

    const drawLine = () => {
      const angle1 = initialArc + (arc * coordinates * Math.PI) / 180

      const x1 = width / 2 + hypotenuse * Math.cos(angle1)
      const y1 = height / 2 + hypotenuse * Math.sin(angle1)

      const angle2 =
        initialArc + ((arc * coordinates + lineIncrement) * Math.PI) / 180

      const x2 = width / 2 + hypotenuse * Math.cos(angle2)
      const y2 = height / 2 + hypotenuse * Math.sin(angle2)

      buffer.line(x1, y1, x2, y2)
    }

    p.mouseMoved = () => {
      const distance = mouseDistanceFromCenter()
      zoomX = distance.x
      zoomY = distance.y
    }

    p.touchMoved = () => {
      const distance = mouseDistanceFromCenter()
      zoomX = distance.x
      zoomY = distance.y
    }

    p.draw = () => {
      buffer.image(
        buffer,
        -zoomX,
        -zoomY,
        width + 2 * zoomX,
        height + 2 * zoomY,
      )
      for (let i = 0; i < 10; i++) {
        buffer.background(0, 0, 0, 5)
        initialArc += 1
        drawCircle()
        drawLine()

        lineIncrement -= 0.1

        counter += 1
        if (counter > 1000) counter = 0
      }

      p.image(buffer, zoom, zoom, width - 2 * zoom, height - 2 * zoom)
    }
  }

  return <P5Wrapper sketch={sketch} />
}

export default () => (
  <>
    <Page>
      {({ height, width }) => <Bendy height={height} width={width} />}
    </Page>
  </>
)
