import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from 'react-three-fiber';
import * as THREE from 'three';
import { makeNoise2D } from 'open-simplex-noise';
import { analyseSpectrum, useAudioUrl } from '../lib/audio';
import { Sky, Text } from '@react-three/drei';
import create from 'zustand';
import Page from '../components/page';
import { FiberScene } from '../components/scene';
import { useControl } from 'react-three-gui';

// 0 - stars: no rotation or freq response
// 17- first bass stars respond to music
const kickInTime = 33; // Sun fading in until this time
// 1:07- strings in start rotating stars
// 1:41- drums drop out
// 2:15- minimal drop
// 3:22- strings back In Sun can start fading out
// 3:56- outro segment Sun completely faded out
// 4:50 - end of song
// fireflies running against the terrain as point lights
// adding shapes to the peaks of the mountains like mushrooms or cacti

type State = {
  setState: (state: Partial<State>) => void;
};
create<State>((set) => ({
  setState: set,
}));

const length = 400;
const width = 400;
const zoom = 10;
const zoomX = zoom;
const zoomY = zoom;
const sceneSize = 7000;
const planeLength = sceneSize;
const planeWidth = sceneSize;
const minimumStarDistance = Math.sqrt((sceneSize * sceneSize) / 2);
const t = 1;

const widthSpacing = planeWidth / width;
const lengthSpacing = planeLength / length;

const noiseFunction = makeNoise2D(Date.now());
const rand = (min: number, max: number) => min + Math.random() * (max - min);

const newPosition = () => {
  const distance = rand(minimumStarDistance, 10000);
  const pos = new THREE.Vector3();
  const direction = new THREE.Vector3(
    rand(-1, 1),
    rand(0, 1),
    rand(-1, 1),
  ).normalize();

  new THREE.Ray(new THREE.Vector3(0, 0, 0), direction).at(distance, pos);

  return pos.toArray();
};

const Stars = React.memo(function Stars({ started }: { started: boolean }) {
  const starsCount = 4000;
  const speed = useControl('starSpeed', {
    type: 'number',
    min: 0,
    max: 0.01,
    value: 0.0005,
  });

  const audio = useAudioUrl(
    process.env.NODE_ENV === 'development'
      ? 'void.mp3'
      : 'https://floating-points.s3.us-east-2.amazonaws.com/void.mp3',
    started,
  );

  const materialRef = useRef<THREE.ShaderMaterial>();
  const pointsRef = useRef<THREE.Points>();

  const vertices = useMemo(
    () => new Array(starsCount).fill(undefined).flatMap(newPosition),
    [starsCount],
  );

  const pointShader = {
    uniforms: {
      size: { value: 10 },
      scale: { value: 350 },
      color: { value: new THREE.Color('white') },
    },
    defines: {
      USE_SIZEATTENUATION: '',
    },
    vertexShader: THREE.ShaderLib.points.vertexShader,
    fragmentShader: `
      uniform vec3 color;
      void main() {
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          gl_FragColor = vec4(color, 2.*(0.5-ll));
      }
      `,
  };

  useFrame(() => {
    const size = audio
      ? 20 + Math.pow(analyseSpectrum(audio).volume / 4, 2)
      : 20;
    materialRef.current!.uniforms.size.value = size;

    pointsRef.current!.rotation.y += speed;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={starsCount}
          array={new Float32Array(vertices)}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        args={[pointShader]}
        transparent
        depthWrite={false}
        depthTest
      />
    </points>
  );
});

const Row = ({
  y,
  material,
  scale,
}: {
  y: number;
  scale: number;
  material: JSX.Element;
}) => {
  const { clock } = useThree();

  const noise = (x: number, y: number) =>
    Math.min(noiseFunction((x * zoomX) / length, (y * zoomY) / width), 1) *
    clock.elapsedTime *
    scale;

  const vertices = (x: number, y: number) => [
    -planeWidth / 2 + x * widthSpacing,
    noise(x, y),
    -planeWidth / 2 + y * lengthSpacing,
  ];

  const meshRef = useRef<THREE.Mesh>();
  const geometryRef = useRef<THREE.BufferGeometry>();
  useEffect(() => {
    geometryRef.current!.computeVertexNormals();
  }, []);

  const array = new Array(width)
    .fill(undefined)
    .flatMap((_, x) => [
      ...vertices(x, y),
      ...vertices(x + 1, y),
      ...vertices(x, y + 1),
      ...vertices(x + 1, y + 1),
    ]);

  const indices = new Array(width)
    .fill(undefined)
    .flatMap((_, i) => [
      i * 4,
      i * 4 + 1,
      i * 4 + 2,
      i * 4 + 2,
      i * 4 + 1,
      i * 4 + 3,
    ]);

  return (
    <mesh key={y} ref={meshRef} receiveShadow>
      <bufferGeometry
        ref={geometryRef}
        index={new THREE.BufferAttribute(new Uint16Array(indices), 1)}
      >
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={array.length / 3}
          itemSize={3}
          array={new Float32Array(array)}
        />
      </bufferGeometry>
      {material}
    </mesh>
  );
};

const Terrain = React.memo(function Terrain() {
  const speed = useControl('terrainSpeed', {
    type: 'number',
    min: 0,
    max: 60,
    value: 10,
  });
  const scale = useControl('terrainScale', {
    type: 'number',
    min: 0,
    max: 1000,
    value: 400,
  });

  const iRef = useRef(-1);
  const yRef = useRef(-1);
  const groupRef = useRef<THREE.Group>();
  const material = useMemo(
    () => (
      <meshLambertMaterial
        side={THREE.BackSide}
        color={new THREE.Color(242 / 255, 142 / 255, 92 / 255)}
      />
    ),
    [],
  );
  const [meshes, setMeshes] = useState(
    new Array(length)
      .fill(undefined)
      .map((_, y) => <Row key={y} y={y} scale={scale} material={material} />),
  );

  const frameOffset = Math.floor(60 / speed);
  useFrame(() => {
    iRef.current++;
    const i = iRef.current;

    groupRef.current!.translateZ((-planeLength * t) / length / frameOffset);

    if (i % frameOffset !== 0) return;
    yRef.current++;
    const y = yRef.current;
    const newMeshes = [...meshes];
    for (let j = 0; j < t; j++) {
      newMeshes[(y * t + j) % length] = (
        <Row
          key={i + length}
          y={y * t + j + length - 1}
          scale={scale}
          material={material}
        />
      );
    }

    setMeshes(newMeshes);
  });

  return <group ref={groupRef}>{meshes}</group>;
});

function Sunset() {
  const mieCoefficient = useControl('mieCoefficient', {
    type: 'number',
    min: 0,
    max: 0.1,
    value: 0.005,
  });
  const rayleigh = useControl('rayleigh', {
    type: 'number',
    min: 0,
    max: 10,
    value: 2.5,
  });
  const mieDirectionalG = useControl('mieDirectionalG', {
    type: 'number',
    min: 0,
    max: 1,
    value: 0.9,
  });
  const turbidity = useControl('turbidity', {
    type: 'number',
    min: 0,
    max: 10,
    value: 10,
  });

  useControl('inclination', {
    type: 'number',
    min: -0.5,
    max: 0.5,
    value: Math.PI * -0.045,
  });

  const { clock } = useThree();
  const [si, setSi] = useState(-0.5);

  useFrame(() => {
    if (clock.elapsedTime < kickInTime + 1)
      setSi(Math.min(-0.5 + (0.4 * clock.elapsedTime) / kickInTime, -0.1));
  });

  return (
    <>
      <Sky
        distance={sceneSize}
        {...{
          turbidity,
          rayleigh,
          mieCoefficient,
          mieDirectionalG,
        }}
        sunPosition={[0, si, -Math.PI]}
      />
      <directionalLight castShadow position={[0, (si + 0.2) * 32, -Math.PI]} />
    </>
  );
}

function Scene({ started }: { started: boolean }) {
  return (
    <>
      <Sunset />
      <Terrain />
      {!started && (
        <Text
          fontSize={200}
          position={new THREE.Vector3(0, 500, 0)}
          color="white"
        >
          Click to start audio
        </Text>
      )}
      <Stars started={started} />
    </>
  );
}

function PerlinField({ started }: { started: boolean }) {
  return (
    <>
      <FiberScene
        gl={{ antialias: true }}
        camera={{ position: [0, 400, 2500], far: 20000 }}
        shadowMap
        controls
      >
        <Scene started={started} />
      </FiberScene>
    </>
  );
}

export default function VoidPage() {
  const [started, start] = useState(false);
  return (
    <Page onClick={() => start(true)}>
      {started && <PerlinField started={started} />}
    </Page>
  );
}
