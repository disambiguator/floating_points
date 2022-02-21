import * as CanvasCapture from 'canvas-capture';
import { makeNoise2D } from 'open-simplex-noise';
import * as p5 from 'p5';
import React from 'react';
import { ReactP5Wrapper } from 'components/p5_wrapper';
import Page from 'components/page';

const fps = 60;

const noise = makeNoise2D(Math.random() * 100);

const Bendy = () => {
  const sketch = (p: p5) => {
    const width = p.windowHeight * 0.9;
    const height = p.windowHeight * 0.9;
    let i = 0;

    p.setup = () => {
      p.createCanvas(width, height);
      p.stroke('black');
      p.frameRate(0);
      p.frameRate(fps);
      p.noFill();
      p.background(110, 46, 240);
      // p.pixelDensity(5);
      p.strokeWeight(3);

      // Initialize and pass in canvas.
      CanvasCapture.init(
        document.getElementById('defaultCanvas0')! as HTMLCanvasElement,
        { showRecDot: true, showAlerts: true, showDialogs: true }, // Options are optional, more info below.
      );
      // Bind key presses to begin/end recordings.
      CanvasCapture.bindKeyToVideoRecord('v', {
        format: 'mp4',
        fps,
        name: 'myVideo',
        quality: 0.6,
        onExportProgress: (progress: number) =>
          console.log(`MP4 export progress: ${progress}.`),
        onExportFinish: () => console.log(`Finished MP4 export.`),
        onError: (e) => console.log(`Errored in MP4 export.`, e),
      });
      // CanvasCapture.bindKeyToJPEGFrames('j', {
      //   name: 'myJpeg', // Options are optional, more info below.
      //   quality: 0.8,
      // });
      // CanvasCapture.bindKeyToGIFRecord('g');

      // // These methods immediately save a single snapshot on keydown.
      // CanvasCapture.bindKeyToPNGSnapshot('p');
      // CanvasCapture.bindKeyToJPEGSnapshot('j', {
      //   name: 'myJpeg', // Options are optional, more info below.
      //   quality: 0.8,
      // });

      p.draw();
      // p.saveCanvas();
    };

    const sections = [
      '#F08616',
      '#2EF04B',
      '#F08616',
      '#2EF04B',
      '#F08616',
      '#2EF04B',
    ];

    const m = 30;
    const overlap = 0.2;
    p.draw = () => {
      //   p.background(126, 224, 152);
      // p.background('#6E2EF0');
      p.background(110, 46, 240);

      for (let j = 0; j < 100; j += 1) {
        const size = j * m;

        sections.forEach((s, index) => {
          p.stroke(s);

          const initial = noise(j / 8, i) * (-1 ^ index % 2);
          // const initial = noise(j / 8, 0) + i * (-1 ^ index % 2);
          // const initial = noise(j / 8, i) + i * (-1 ^ index % 2);
          // const initial = noise(j / 8, 0) + i * (-1) ** (index % 2);
          // const initial = noise(j / 8, i * 2) + i * (-1) ** (index % 2);

          p.arc(
            width / 2,
            height / 2,
            size + (m / 2) * (index % 2),
            size + (m / 2) * (index % 2),
            initial - overlap + (index * p.PI * 2) / sections.length,
            initial + overlap + ((index + 1) * p.PI * 2) / sections.length,
          );
        });
      }

      if (CanvasCapture.isRecording()) CanvasCapture.recordFrame();

      i = i + 0.01;
    };

    // p.mouseClicked = () => {
    //   console.log(p.frameRate());
    //   if (p.frameRate() > 0) {
    //     p.frameRate(0);
    //   } else {
    //     p.frameRate(60);
    //   }
    // };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default function BendyPage() {
  return (
    <Page background="#6E2EF0">
      <Bendy />
    </Page>
  );
}
