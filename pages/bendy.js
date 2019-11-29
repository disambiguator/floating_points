import React from 'react'
import dynamic from 'next/dynamic'

const P5Wrapper = dynamic(() => import('react-p5-wrapper'), { ssr: false })

const sketch = p5 => {
  let initialArc = 0
  let counter = 0
  const coordinates = 0
  let buffer
  const points = 30
  const radius = 400
  const arc = 360 / points
  const hypotenuse = radius
  let lineIncrement = 130
  const zoom = 20

  const drawCircle = () => {
    for (let i = 0; i < points; i++) {
      const angle = initialArc + (arc * i * Math.PI) / 180

      const xCoordinate = p5.windowWidth / 2 + hypotenuse * Math.cos(angle)
      const yCoordinate = p5.windowHeight / 2 + hypotenuse * Math.sin(angle)

      buffer.point(xCoordinate, yCoordinate)
    }
  }

  const mouseDistanceFromCenter = () => {
    return {
      x: p5.mouseX - p5.windowWidth / 2,
      y: p5.mouseY - p5.windowHeight / 2,
    }
  }

  const setRandomStroke = () => {
    const r = p5.random(127, 255)
    const g = p5.random(127, 255)
    const b = p5.random(127, 255)

    p5.stroke(r, g, b, 50)
  }

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    buffer = p5.createGraphics(p5.windowWidth, p5.windowHeight)
    buffer.strokeWeight(5)
    buffer.background(0, 0, 0)
    p5.frameRate(60)
    buffer.stroke(255, 255, 255, 255)
    p5.draw()
  }

  const drawLine = () => {
    const angle1 = initialArc + (arc * coordinates * Math.PI) / 180

    const x1 = p5.windowWidth / 2 + hypotenuse * Math.cos(angle1)
    const y1 = p5.windowHeight / 2 + hypotenuse * Math.sin(angle1)

    const angle2 =
      initialArc + ((arc * coordinates + lineIncrement) * Math.PI) / 180

    const x2 = p5.windowWidth / 2 + hypotenuse * Math.cos(angle2)
    const y2 = p5.windowHeight / 2 + hypotenuse * Math.sin(angle2)

    buffer.line(x1, y1, x2, y2)
  }

  p5.draw = () => {
    const { x: zoomX, y: zoomY } = mouseDistanceFromCenter()
    buffer.image(
      buffer,
      -zoomX,
      -zoomY,
      p5.windowWidth + 2 * zoomX,
      p5.windowHeight + 2 * zoomY,
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

    p5.image(
      buffer,
      zoom,
      zoom,
      p5.windowWidth - 2 * zoom,
      p5.windowHeight - 2 * zoom,
    )
  }
}

export default () => <P5Wrapper sketch={sketch} />
