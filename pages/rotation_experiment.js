import React, {useEffect, useState} from 'react'
import dynamic from 'next/dynamic'

const P5Wrapper = dynamic(() => import('react-p5-wrapper'))

const sketch = (p5) => {
  let initialArc = 0
  let counter = 0
  let coordinates = 0
  const points = 30
  const radius = 400
  const arc = 360 / points
  const hypotenuse = radius
  let lineIncrement = 130

  const drawCircle = () => {
    for (let i = 0; i < points; i++) {
      const angle = initialArc + (arc * i) * Math.PI / 180

      const xCoordinate = p5.windowWidth / 2 + hypotenuse * Math.cos(angle)
      const yCoordinate = p5.windowHeight / 2 + hypotenuse * Math.sin(angle)

      p5.point(xCoordinate, yCoordinate)
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
    p5.noFill()
    p5.strokeWeight(5)
    p5.frameRate(60)
    p5.stroke(255, 255, 255, 255)
    p5.background(0, 0, 0)

    p5.draw()
  }

  const drawLine = () => {
    const angle1 = initialArc + (arc * coordinates) * Math.PI / 180

    const x1 = p5.windowWidth / 2 + hypotenuse * Math.cos(angle1)
    const y1 = p5.windowHeight / 2 + hypotenuse * Math.sin(angle1)

    const angle2 = initialArc + (arc * coordinates + lineIncrement) * Math.PI / 180

    const x2 = p5.windowWidth / 2 + hypotenuse * Math.cos(angle2)
    const y2 = p5.windowHeight / 2 + hypotenuse * Math.sin(angle2)

    p5.line(x1, y1, x2, y2)
  }

  p5.draw = () => {
    for (let i = 0; i < 5; i++) {
      p5.background(0, 0, 0, 10)
      initialArc = initialArc + 0.01
      drawCircle()
      drawLine()

      // if (counter % 4 === 0) {
      lineIncrement = lineIncrement + 0.5
      // }

      counter = counter + 1
      if (counter > 1000) counter = 0
    }
  }
}

const Rings = () => {
  return <P5Wrapper sketch={sketch}/>
}

const Page = () => {
  const [dimensions, setDimensions] = useState(null)

  useEffect(() => {
    if (dimensions == null) {
      setDimensions({width: window.innerWidth, height: window.innerHeight})
    }
  })

  return (
    <div>
      {dimensions ? <Rings height={dimensions.height} width={dimensions.width}/> : null}
    </div>
  )
}

export default Page
