function runMicromovements (bindingElement) {
  let section = 0
  const size = 50
  const width = 640
  const height = 480
  const rowCount = Math.ceil(width / size)
  const heightCount = Math.ceil(height / size)

  const video = document.querySelector('video')

  const canvas = document.querySelector('canvas')
  const constraints = {
    video: {width: {exact: width}, height: {exact: height}}
  }

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {video.srcObject = stream})
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')

  const captureImage = function () {
    const x = (section % rowCount) * size
    const y = Math.floor(section / rowCount) * size

    ctx.drawImage(
      video,
      x, y, size, size,
      x, y, size, size
    )

    section++

    if (section > (heightCount * rowCount)) {
      section = 0
    }
  }

  window.onload = function () {
    setInterval(captureImage, 50)
  }
}

export default runMicromovements
