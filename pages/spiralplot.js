import React from 'react'

let delta = 10
const l = 15
// const colors = ['#ff0000', '#00ff00', '#0000ff']
const colors = [
  '#4018FF',
  '#1F43E8',
  '#1E95FF',
  '#11CDE8',
  '#1EFFC9',
  '#2846FF',
  '#117AE8',
  '#2EDDFF',
]

class Spiral extends React.Component {
  constructor(props) {
    super(props)
    // this.setNewFragmentWidth()
    this.timer = 0
    this.sides = 3
  }

  componentDidMount() {
    this.ctx = this.mount.getContext('2d')

    this.updateDimensions()
    this.interval = setInterval(this.animate, 10)
    window.addEventListener('resize', this.updateDimensions)
    this.ctx.lineWidth = 1
    this.ctx.fillStyle = '#000000'
    // this.animate()

    // this.ctx.fillRect(0, 0, width, height)
    // this.ctx.fillStyle = '#ffffff'
    this.ctx.textAlign = 'center'
    this.ctx.font = '50px Courier New'
  }

  updateDimensions = () => {
    this.mount.width = window.innerWidth
    this.mount.height = window.innerHeight
  }

  onInput = event => {
    this.timer = (event.currentTarget.value * Math.PI) / 180
  }

  componentWillUnmount() {
    clearInterval(this.interval)
    window.removeEventListener('resize', this.updateDimensions)
  }

  drawLine = (points1, points2) => {
    const [x1, y1] = points1
    let [x2, y2] = points2
    const l = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

    x2 = x1 + ((l + delta) * (x2 - x1)) / l
    y2 = y1 + ((l + delta) * (y2 - y1)) / l
    // pygame.draw.aalines(self.screen, (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)), False, [(x1, y1), (x2, y2)], 1)
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()

    return [x2, y2]
  }

  animate = () => {
    const width = this.mount.width
    const height = this.mount.height
    const timer = this.timer
    const sides = this.sides
    this.ctx.fillRect(0, 0, width, height)
    const theta = (2 * Math.PI) / sides
    const x0 = width / 2
    const y0 = height / 2

    let coords = [...Array(sides).keys()].map(n => [
      x0 + l * Math.cos(n * theta + timer),
      y0 + l * Math.sin(n * theta + timer),
    ])

    // delta = 43 + 40 * Math.cos(this.timer*Math.PI/180)
    delta = 4
    if (delta === 3) {
      this.sides++
      if (this.sides > 8) {
        this.sides = 3
      }
    }

    for (let x = 0; x < 1000; x++) {
      coords = [...Array(sides).keys()].map(y => {
        this.ctx.strokeStyle = colors[(y - 1 + sides) % sides]
        return this.drawLine(coords[(y - 1 + sides) % sides], coords[y])
      })
    }

    // this.timer = this.timer + 1
  }

  render() {
    return (
      <div>
        <canvas
          width={1}
          height={1}
          ref={mount => {
            this.mount = mount
          }}
        />
        <input type="range" min={0} max={100} onInput={this.onInput} />
      </div>
    )
  }
}

export default Spiral
