import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import Page from './page';
import { FiberScene } from './scene';
import { useFrame, useThree } from 'react-three-fiber';

const height = 200;
const width = height * 2;

type Data = {
  text: string;
  background: string;
  textColor: string;
};

let happy: number;
let birthday: number;

const Box = ({
  position,
  data,
  index,
}: {
  position: [number, number, number];
  data: Data;
  index: number;
}) => {
  const { clock } = useThree();
  const canvasTextureRef = useRef<THREE.CanvasTexture>();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = width;
  canvas.height = height;

  const size = 300 / data.text.length + 40;

  useFrame(() => {
    ctx.fillStyle = data.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = data.textColor;
    ctx.textAlign = 'center';
    ctx.font = `${size}px Courier New`;
    ctx.fillText(
      happy === index ? 'Happy' : birthday === index ? 'birthday' : data.text,
      width / 2,
      height / 2,
    );
    canvasTextureRef.current!.needsUpdate = true;
  });

  ctx.fillStyle = data.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = data.textColor;
  ctx.textAlign = 'center';
  ctx.font = `${size}px Courier New`;
  ctx.fillText(data.text, width / 2, height / 2);

  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, height]} attach="geometry" />
      <meshBasicMaterial attach="material">
        <canvasTexture
          ref={canvasTextureRef}
          attach="map"
          args={[canvas]}
          minFilter={THREE.LinearFilter}
        />
      </meshBasicMaterial>
    </mesh>
  );
};

const htttData = [
  [
    { text: 'used', textColor: 'blue', background: 'white' },
    { text: 'internet', textColor: 'blue', background: 'orange' },
    { text: 'private', textColor: 'black', background: 'red' },
    { text: 'closed', textColor: 'green', background: 'white' },
    { text: 'cocktails', textColor: 'white', background: 'blue' },
    { text: 'bacon', textColor: 'black', background: 'green' },
    { text: 'loss', textColor: 'orange', background: 'blue' },
    { text: 'vcr', textColor: 'red', background: 'orange' },
    { text: 'donut', textColor: 'white', background: 'blue' },
    { text: 'lube', textColor: 'black', background: 'white' },
    { text: 'patrol', textColor: 'green', background: 'orange' },
    { text: 'rapid', textColor: 'orange', background: 'green' },
    { text: 'block', textColor: 'black', background: 'orange' },
  ],
  [
    { text: 'bail', textColor: 'red', background: 'blue' },
    { text: 'xing', textColor: 'orange', background: 'green' },
    { text: 'tow', textColor: 'red', background: 'white' },
    { text: 'will', textColor: 'green', background: 'white' },
    { text: 'sale', textColor: 'blue', background: 'white' },
    { text: 'soon', textColor: 'black', background: 'red' },
    { text: 'color', textColor: 'white', background: 'blue' },
    { text: 'god', textColor: 'red', background: 'orange' },
    { text: 'anytime', textColor: 'blue', background: 'white' },
    { text: 'retirement', textColor: 'red', background: 'white' },
    { text: 'video', textColor: 'white', background: 'blue' },
    { text: '24hr', textColor: 'red', background: 'black' },
    { text: 'poor', textColor: 'white', background: 'red' },
    { text: 'favorite', textColor: 'black', background: 'green' },
  ],
  [
    { text: '25¢', textColor: 'green', background: 'red' },
    { text: 'bangbang', textColor: 'red', background: 'black' },
    { text: 'coin', textColor: 'black', background: 'green' },
    { text: 'armed', textColor: 'black', background: 'white' },
    { text: 'tv', textColor: 'white', background: 'red' },
    { text: 'copies', textColor: 'white', background: 'green' },
    { text: 'yourself', textColor: 'blue', background: 'orange' },
    { text: 'danger', textColor: 'black', background: 'white' },
    { text: 'perfect', textColor: 'white', background: 'black' },
    { text: 'gasoline', textColor: 'white', background: 'blue' },
    { text: 'mania', textColor: 'black', background: 'green' },
  ],
  [
    { text: 'aid', textColor: 'white', background: 'blue' },
    { text: 'fine', textColor: 'black', background: 'white' },
    { text: 'zone', textColor: 'red', background: 'yellow' },
    { text: 'ultra', textColor: 'white', background: 'blue' },
    { text: 'theft', textColor: 'black', background: 'white' },
    { text: 'aids', textColor: 'black', background: 'red' },
    { text: 'meat', textColor: 'red', background: 'yellow' },
    { text: 'call', textColor: 'black', background: 'green' },
    { text: 'trust', textColor: 'red', background: 'white' },
    { text: 'end', textColor: 'black', background: 'white' },
    { text: 'no', textColor: 'white', background: 'green' },
    { text: 'grand guignol', textColor: 'black', background: 'orange' },
    { text: 'girls', textColor: 'white', background: 'black' },
    { text: 'ultra', textColor: 'white', background: 'blue' },
  ],
  [
    { text: 'long stay', textColor: 'black', background: 'red' },
    { text: 'be', textColor: 'red', background: 'orange' },
    { text: '99¢', textColor: 'red', background: 'green' },
    { text: 'exit', textColor: 'white', background: 'red' },
    { text: '100%', textColor: 'blue', background: 'white' },
    { text: 'sway', textColor: 'red', background: 'white' },
    { text: 'pool', textColor: 'black', background: 'orange' },
    { text: 'oil', textColor: 'red', background: 'black' },
    { text: 'delicious', textColor: 'black', background: 'red' },
    { text: 'nothing', textColor: 'blue', background: 'white' },
    { text: 'autos', textColor: 'green', background: 'orange' },
    { text: 'screen', textColor: 'white', background: 'blue' },
    { text: 'test', textColor: 'orange', background: 'red' },
    { text: 'home', textColor: 'blue', background: 'white' },
    { text: 'vacant', textColor: 'black', background: 'green' },
  ],
  [
    { text: 'only', textColor: 'white', background: 'red' },
    { text: 'tanning', textColor: 'white', background: 'blue' },
    { text: 'liquor', textColor: 'red', background: 'white' },
    { text: 'extra', textColor: 'black', background: 'yellow' },
    { text: 'drugs', textColor: 'white', background: 'red' },
    { text: 'enter', textColor: 'white', background: 'blue' },
    { text: 'players', textColor: 'white', background: 'green' },
    { text: 'photo', textColor: 'red', background: 'yellow' },
    { text: 'ballistic', textColor: 'orange', background: 'green' },
    { text: 'collision', textColor: 'white', background: 'black' },
    { text: 'enforced', textColor: 'black', background: 'white' },
    { text: 'check', textColor: 'blue', background: 'green' },
    { text: 'fear', textColor: 'red', background: 'orange' },
    { text: 'beef', textColor: 'blue', background: 'yellow' },
  ],
  [
    { text: 'anti', textColor: 'blue', background: 'orange' },
    { text: 'trouble', textColor: 'white', background: 'black' },
    { text: 'recovery', textColor: 'black', background: 'red' },
    { text: 'coiffure', textColor: 'green', background: 'white' },
    { text: 'depot', textColor: 'white', background: 'black' },
    { text: 'hair', textColor: 'white', background: 'red' },
    { text: 'luxuries', textColor: 'black', background: 'orange' },
    { text: 'enforced', textColor: 'white', background: 'black' },
    { text: 'sale', textColor: 'black', background: 'yellow' },
    { text: 'haunted', textColor: 'white', background: 'red' },
    { text: 'center', textColor: 'blue', background: 'orange' },
    { text: 'turn', textColor: 'white', background: 'red' },
  ],
  [
    { text: 'security', textColor: 'white', background: 'green' },
    { text: 'hamburger', textColor: 'black', background: 'white' },
    { text: 'prosecuted', textColor: 'red', background: 'yellow' },
    { text: 'remembering', textColor: 'white', background: 'blue' },
    { text: 'spiritual', textColor: 'black', background: 'orange' },
    { text: 'media', textColor: 'red', background: 'yellow' },
    { text: 'popcorn', textColor: 'black', background: 'white' },
    { text: ' $ ', textColor: 'black', background: 'red' },
    { text: 'advisor', textColor: 'white', background: 'black' },
    { text: 'karaoke', textColor: 'green', background: 'white' },
    { text: 'teens', textColor: 'white', background: 'blue' },
    { text: 'sunset', textColor: 'black', background: 'white' },
    { text: 'beepers', textColor: 'white', background: 'green' },
    { text: 'mail', textColor: 'white', background: 'blue' },
  ],
];

const HTTF = () => {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color(0x7ec0ee);
  }, []);

  const boxes: JSX.Element[] = [];
  htttData.forEach((column, i) => {
    column.forEach((boxData, stack) => {
      boxes.push(
        <Box
          key={i * column.length + stack}
          index={i * column.length + stack}
          data={boxData}
          position={[-300 + width * i, -1200 + height * stack, 0]}
        />,
      );
    });
  });

  useEffect(() => {
    const interval = setInterval(() => {
      happy = Math.floor(Math.random() * boxes.length);
      birthday = Math.floor(Math.random() * boxes.length);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return <>{boxes}</>;
};

export default () => (
  <Page>
    {(_dimensions) => (
      <FiberScene
        gl={{ antialias: true }}
        camera={{ position: [0, 500, 1000], far: 10000 }}
      >
        <HTTF />
      </FiberScene>
    )}
  </Page>
);
