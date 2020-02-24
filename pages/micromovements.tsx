import React, { useEffect, useRef } from 'react';

let section = 0;
const size = 50;
const width = 640;
const height = 480;
const rowCount = Math.ceil(width / size);
const heightCount = Math.ceil(height / size);

const constraints = {
  video: { width: { exact: width }, height: { exact: height } },
};

const setStream = async (video: HTMLVideoElement) => {
  video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
};

const Micromovements = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureImage = () => {
    const x = (section % rowCount) * size;
    const y = Math.floor(section / rowCount) * size;

    const canvas = canvasRef.current;
    if (canvas == undefined) throw new Error();

    const context = canvas.getContext('2d');
    if (context == undefined) throw new Error();

    const video = videoRef.current;
    if (video == undefined) throw new Error();
    context.drawImage(video, x, y, size, size, x, y, size, size);

    section++;

    if (section > heightCount * rowCount) {
      section = 0;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video == undefined) throw new Error();

    setStream(video);
    setInterval(captureImage, 50);
  });

  return (
    <div>
      <video autoPlay ref={videoRef} />
      <canvas width={width} height={height} ref={canvasRef} />
    </div>
  );
};

export default Micromovements;
