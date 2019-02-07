import React from 'react';

let section = 0
const size = 50
const width = 640
const height = 480
const rowCount = Math.ceil(width / size)
const heightCount = Math.ceil(height / size)

const constraints = {
  video: { width: { exact: width }, height: { exact: height } }
}

class Micromovements extends React.Component {
  constructor (props) {
    super(props)
  }

  componentDidMount () {
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => (this.video.srcObject = stream))

    setInterval(this.captureImage, 50)
  }

  captureImage = () => {
    const x = (section % rowCount) * size
    const y = Math.floor(section / rowCount) * size

    this.context.drawImage(
      this.video,
      x, y, size, size,
      x, y, size, size
    )

    section++

    if (section > (heightCount * rowCount)) {
      section = 0
    }
  }

  render = () => (
    <div>
      <video
        autoPlay={true}
        ref={(v) => {
          console.log(v)
          this.video = v
        }}
      />
      <canvas
        width={width}
        height={height}
        ref={(c) => this.context = c.getContext('2d')}
      />
    </div>
  )
}

export default Micromovements;