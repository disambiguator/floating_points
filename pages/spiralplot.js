let delta = 10
const l = 15
const colors = ['#ff0000', '#00ff00', '#0000ff']

import React from 'react';

class Spiral extends React.Component {
  constructor (props) {
    super(props)
    // this.setNewFragmentWidth()
    this.timer = 0
  }

  componentDidMount () {
    this.ctx = this.mount.getContext('2d');

    this.updateDimensions()
    this.interval = setInterval(this.animate, 10)
    window.addEventListener("resize", this.updateDimensions)
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = '#000000'
    // this.animate()

    // this.ctx.fillRect(0, 0, width, height)
    // this.ctx.fillStyle = '#ffffff'
    // this.ctx.textAlign = "center";
    // this.ctx.font = "50px Courier New";
    // this.ctx.fillText("disambiguator", width / 2, height / 2);
  }

  updateDimensions = () => {
    this.mount.width = window.innerWidth
    this.mount.height = window.innerHeight
  }

  componentWillUnmount () {
    clearInterval(this.interval)
    window.removeEventListener("resize", this.updateDimensions)
  }

  drawLine = (points_1, points_2) => {
    const [x1, y1] = points_1
    let [x2, y2] = points_2
    const l = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

    x2 = x1 + (l + delta) * (x2 - x1) / l
    y2 = y1 + (l + delta) * (y2 - y1) / l
    // pygame.draw.aalines(self.screen, (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)), False, [(x1, y1), (x2, y2)], 1)
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();

    return [x2, y2]
  }

  animate = () => {
    const width = this.mount.width
    const height = this.mount.height
    this.ctx.fillRect(0, 0, width, height)
    const SIDE_COUNT = 3
    // for (let SIDE_COUNT = 3; SIDE_COUNT < 13; SIDE_COUNT++) {
    const i = 0
    // for (let i = 0; i < 10; i++) {
      const theta = 2 * Math.PI / SIDE_COUNT
      const x0 = width / 2
      const y0 = height / 2

      let coords = [...Array(SIDE_COUNT).keys()].map((n) => (
        [x0 + l * Math.cos(n * theta), y0 + l * Math.sin(n * theta)]
      ))

    this.ctx.beginPath()
      this.ctx.moveTo(x0 + l * Math.cos(0), y0 + l * Math.sin(0))

      const range = [...Array(SIDE_COUNT - 1).keys()]
      range.forEach((n) => {
        this.ctx.lineTo(x0 + 1 + l * Math.cos(n * theta), y0 + 1 + l * Math.sin(n * theta))
      })
    this.ctx.stroke()

    delta = 50 + 50 * Math.cos(this.timer)

      for (let x = 0; x < 1000; x++) {
        coords = [...Array(SIDE_COUNT).keys()].map((y) => {
          this.ctx.strokeStyle = colors[(y - 1 + SIDE_COUNT) % SIDE_COUNT]
          return this.drawLine(coords[(y - 1 + SIDE_COUNT) % SIDE_COUNT], coords[y])
        })
      }

      // this.ctx.stroke();


      // this.ctx.fillRect(0, 0, width, height)
      // }
    // }

    this.timer=this.timer + 0.01

  }

  render () {
    return (
      <div>
        <canvas
          width={1}
          height={1}
          ref={mount => this.mount = mount}
        />
      </div>
    )
  }
}

export default Spiral
