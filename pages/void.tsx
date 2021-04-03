import { Sky } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { makeNoise2D } from 'open-simplex-noise';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';
import create, { SetState } from 'zustand';
import Page from '../components/page';
import { FiberScene } from '../components/scene';
import { Audio, Spectrum, analyseSpectrum, useAudioUrl } from '../lib/audio';

// 0 - stars: no rotation or freq response
const bassStartTime = 17; // stars respond to music
const kickInTime = 33; // Sun fading in until this time
const stringsStartTime = 67; // start rotating stars
// 1:41- drums drop out
// 2:15- minimal drop
// 3:22- strings back In Sun can start fading out
// 3:56- outro segment Sun completely faded out
// 4:50 - end of song
// fireflies running against the terrain as point lights
// adding shapes to the peaks of the mountains like mushrooms or cacti

type State = {
  spectrum: Spectrum;
  audio: Audio | undefined;
  setState: SetState<State>;
};
const useStore = create<State>((set) => ({
  spectrum: { volume: 0 } as Spectrum,
  setState: set,
  audio: undefined,
}));

const currentTime = ({ audio }: State) =>
  audio ? audio.listener.context.currentTime : 0;

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

const Stars = React.memo(function Stars() {
  const starsCount = 4000;
  const { speed } = useControls({
    speed: { label: 'starSpeed', min: 0, max: 0.01, value: 0.0005 },
  });

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
    const time = currentTime(useStore.getState());

    if (time > bassStartTime) {
      const { volume } = useStore.getState().spectrum;
      const size = 20 + Math.pow(volume / 4, 2);
      materialRef.current!.uniforms.size.value = size;
    }

    if (time > stringsStartTime) {
      pointsRef.current!.rotation.y += speed;
    }
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
  const noise = (x: number, y: number) =>
    Math.min(noiseFunction((x * zoomX) / length, (y * zoomY) / width), 1) *
    currentTime(useStore.getState()) *
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
  const { terrainSpeed, scale } = useControls({
    terrainSpeed: { label: 'terrainSpeed', min: 0, max: 60, value: 10 },
    scale: { label: 'terrainScale', min: 0, max: 1000, value: 10 },
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

  const frameOffset = Math.floor(60 / terrainSpeed);
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
  const [
    { mieCoefficient, rayleigh, mieDirectionalG, turbidity, si },
    set,
  ] = useControls(() => ({
    mieCoefficient: { min: 0, max: 0.1, value: 0.1 },
    rayleigh: { min: 0, max: 10, value: 10 },
    mieDirectionalG: { min: 0, max: 1, value: 0.9 },
    turbidity: { min: 0, max: 10, value: 10 },
    si: { min: -0.5, max: 0.5, value: Math.PI * -0.045, label: 'inclination' },
  }));

  useFrame(() => {
    const time = currentTime(useStore.getState());
    if (time < kickInTime + 1)
      set({ si: Math.min(-0.4 + (0.3 * time) / kickInTime, -0.1) });
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

function Scene() {
  const audio = useAudioUrl(
    process.env.NODE_ENV === 'development'
      ? 'void.mp3'
      : 'https://floating-points.s3.us-east-2.amazonaws.com/void.mp3',
  );
  const setState = useStore((state) => state.setState);
  setState({ audio });

  useFrame(() => {
    if (audio) setState({ spectrum: analyseSpectrum(audio) });
  });

  return (
    <>
      <Sunset />
      <Terrain />
      <Stars />
    </>
  );
}

function PerlinField() {
  return (
    <>
      <FiberScene
        gl={{ antialias: true }}
        camera={{ position: [0, 400, 2500], far: 20000 }}
        shadows
        controls
      >
        <Scene />
      </FiberScene>
    </>
  );
}

const Title = styled.div`
  @keyframes expand {
    from {
      letter-spacing: 1px;
      margin-left: 1px;
    }

    to {
      letter-spacing: 100px;
      margin-left: 100px;
    }
  }

  font-size: 45px;
  margin-bottom: 50px;
  margin-left: 100px;
  animation-duration: 60s;
  animation-name: expand;
  letter-spacing: 100px;
`;

const Splash = styled.div`
  text-align: center;
  font-family: 'Inconsolata', monospace;
`;

export default function VoidPage() {
  const [started, start] = useState(false);
  return (
    <Page onClick={() => start(true)}>
      {started ? (
        <PerlinField />
      ) : (
        <Splash>
          <Title>VOID</Title>
          <div>Click to start</div>
        </Splash>
      )}
    </Page>
  );
}
