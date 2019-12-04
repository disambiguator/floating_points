import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'

const pages = [
  // { name: 'Pixelsorting', path: '/pixel_sort' },
  { name: 'Warp', path: '/bendy' },
  { name: 'Spirographs', path: '/spiro' },
  // { name: 'Visualizer', path: '/visualizer' },
  // { name: 'Scatter', path: '/scatter' },
  { name: 'Divide', path: '/divide' },
  { name: 'Cubes', path: '/cubes' },
  { name: 'Overlap', path: '/overlap' },
]

const translateDistance = 1

const Contents = styled.h1`
  color: white;
  z-index: 1;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: Arial;
  background-color: rgba(255, 255, 255, 0.2);

  a,
  a:visited,
  a:hover,
  a:active {
    color: inherit;
  }
`

const endPoints = ({ width, height, slope }) => {
  const interceptX = Math.random() * width
  const interceptY = Math.random() * height
  const m = slope
  const b = interceptY - m * interceptX

  return [
    { x: -b / m, y: 0 },
    { x: 0, y: b },
    { x: (height - b) / m, y: height },
    { x: width, y: m * width + b },
  ].filter(
    point =>
      point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height,
  )
}

class Scatter extends React.Component {
  constructor(props) {
    super(props)
    this.setNewFragmentWidth()
    this.timer = 0
  }

  componentDidMount() {
    this.ctx = this.mount.getContext('2d')

    this.updateDimensions()
    const width = this.mount.width
    const height = this.mount.height

    this.interval = setInterval(this.animate, 10)
    window.addEventListener('resize', this.updateDimensions)
    this.ctx.lineWidth = 5
    this.ctx.fillRect(0, 0, width, height)
    this.ctx.fillStyle = '#ffffff'
    this.ctx.textAlign = 'center'
    this.ctx.font = '50px Courier New'
    this.ctx.fillText('disambiguator', width / 2, height / 2)
  }

  updateDimensions = () => {
    const temp = this.ctx.getImageData(
      0,
      0,
      this.mount.width,
      this.mount.height,
    )

    this.mount.width = window.innerWidth
    this.mount.height = window.innerHeight

    this.ctx.putImageData(temp, 0, 0)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
    window.removeEventListener('resize', this.updateDimensions)
  }

  setNewFragmentWidth = () => {
    this.fragmentWidth = Math.floor(Math.random() * 15) + 1
  }

  animate = () => {
    const width = this.mount.width
    const height = this.mount.height

    if (this.timer % this.fragmentWidth === 0) {
      this.slopeX = Math.random() * 10 - 5
      this.slopeY = Math.random() * 10 - 5
      const slope = this.slopeY / this.slopeX

      this.points = endPoints({ width: width, height: height, slope: slope })

      this.ctx.beginPath()
      // this.ctx.strokeStyle = "#"+((1<<24)*Math.random()|0).toString(16);

      const r = Math.random() * 100 + 30

      this.ctx.strokeStyle = `rgb(${r},${r},${r})`
      this.ctx.moveTo(this.points[0].x, this.points[0].y)

      // const a = this.points[0].x < this.points[1].x ? this.points[0].x : this.points[1].x
      // const b = this.points[0].x < this.points[1].x ? this.points[1].x : this.points[0].x
      //
      // for(let i=a; i<b; i++) {
      //   const y = this.points[0].y + slope*(i-this.points[0].x) + Math.random() * 10 - 2
      //
      //   this.ctx.lineTo(i, y);
      // }

      this.ctx.lineTo(this.points[1].x, this.points[1].y)
      this.ctx.stroke()

      this.setNewFragmentWidth()
    }

    this.ctx.save()

    const rightRegion = new Path2D()
    rightRegion.moveTo(this.points[0].x, this.points[0].y)
    rightRegion.lineTo(this.points[1].x, this.points[1].y)
    rightRegion.lineTo(width, height)
    rightRegion.lineTo(width, 0)
    rightRegion.lineTo(this.points[0].x, this.points[0].y)
    this.ctx.clip(rightRegion)
    this.ctx.translate(this.slopeX, this.slopeY)
    this.ctx.drawImage(this.mount, translateDistance, 0)
    this.ctx.restore()

    this.ctx.save()
    const leftRegion = new Path2D()
    leftRegion.moveTo(this.points[0].x, this.points[0].y)
    leftRegion.lineTo(this.points[1].x, this.points[1].y)
    leftRegion.lineTo(0, height)
    leftRegion.lineTo(0, 0)
    leftRegion.lineTo(this.points[0].x, this.points[0].y)
    this.ctx.clip(leftRegion)
    this.ctx.translate(-this.slopeX, -this.slopeY)
    this.ctx.drawImage(this.mount, -translateDistance, 0)
    this.ctx.restore()

    this.timer++
  }

  render() {
    return (
      <div>
        <Contents>
          <h2>disambiguator</h2>
          {pages.map(p => (
            <Link href={p.path}>
              <a>{p.name}</a>
            </Link>
          ))}
        </Contents>
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
          width={1}
          height={1}
          ref={mount => {
            this.mount = mount
          }}
        />
      </div>
    )
  }
}

export default Scatter
