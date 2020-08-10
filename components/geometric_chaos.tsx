import React, { useEffect, useState, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FiberScene } from './scene';
import sum from 'lodash/sum';
import Page from './page';
import { useFrame, useThree } from 'react-three-fiber';
import { Effects } from './effects';
import { scaleMidi, defaultConfig, BaseConfig } from './mixer';
import { ShaderMaterial } from 'three';
import { api } from '../lib/store';
const renderSpeed = 1000;

const Shader = {
  vertexShader: `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform float amplitude;
    uniform vec3 origin;
    uniform vec3 direction;
    attribute float displacement;

    varying vec3 vPosition;

    float computeDistance(vec3 mouseOrigin, vec3 mouseDirection, vec3 vertexPosition) {
      vec3 d = normalize(mouseDirection);
      vec3 v = vertexPosition - mouseOrigin;
      float t = dot(v, d);
      vec3 P = mouseOrigin + t * d;
      return distance(P, vertexPosition);
    }

    void main() {

    vPosition = position;

    vec3 newPosition = position + amplitude * displacement * 100.0 * direction;

    gl_Position = projectionMatrix *
      modelViewMatrix *
      vec4(newPosition,1.0);
    }
`,

  fragmentShader: `
    #ifdef GL_ES
    precision highp float;
    #endif

    // same name and type as VS
    varying vec3 vPosition;
    varying float vColor;

    void main() {

    vec3 color = normalize(vPosition);

    // feed into our frag colour
    gl_FragColor = vec4(color, 1.0);

    }
`,

  uniforms: {
    amplitude: new THREE.Uniform(0.0005),
    origin: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
    direction: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  },
};

const Box = ({
  displacement,
  material,
}: {
  displacement: Float32Array;
  material: JSX.Element;
}) => {
  const meshRef = useRef<THREE.Mesh>();
  const geometryRef = useRef<THREE.Geometry>();

  useEffect(() => {
    const m = meshRef.current!;
    m.rotation.x += (Math.PI / 64) * Math.random() * 100;
    m.rotation.y += (Math.PI / 64) * Math.random() * 100;
    m.rotation.z += (Math.PI / 64) * Math.random() * 100;

    const geometry = geometryRef.current!;
    geometry.translate(
      Math.random() * 300,
      Math.random() * 300,
      Math.random() * 300,
    );
  }, []);

  return (
    <mesh ref={meshRef}>
      <boxBufferGeometry
        attach="geometry"
        args={[15, 15, 15]}
        ref={geometryRef}
      >
        <bufferAttribute
          attachObject={['attributes', 'displacement']}
          count={renderSpeed}
          array={displacement}
          itemSize={1}
        />
      </boxBufferGeometry>
      {material}
    </mesh>
  );
};

export const Shapes = React.memo(function Shapes({
  config,
}: {
  config: BaseConfig;
}) {
  const { camera } = useThree();
  const materialRef = useRef<ShaderMaterial>();
  const displacement = useMemo(() => {
    const d = new Float32Array(renderSpeed);
    for (let i = 0; i < renderSpeed; i++) {
      d[i] = Math.random() * 5;
    }
    return d;
  }, []);

  const amplitude = config.noiseAmplitude * 1000;

  const material = useMemo(
    () => (
      <shaderMaterial
        args={[Shader]}
        ref={materialRef}
        attach="material"
        uniforms-amplitude-value={scaleMidi(amplitude, 0, 0.0005)}
      />
    ),
    [],
  );

  useFrame(() => {
    camera.translateX(-0.5);
    const { ray } = api.getState();

    const material = materialRef.current!;
    material.uniforms.origin.value = ray.origin;
    material.uniforms.direction.value = ray.direction;
    material.uniforms.amplitude.value = scaleMidi(amplitude, 0, 0.0005);
  });

  const cubes = useMemo(
    () =>
      Array(500)
        .fill(undefined)
        .map((_value, i) => (
          <Box key={i} displacement={displacement} material={material} />
        )),
    [],
  );

  return <>{cubes}</>;
});

const Scene = () => {
  const { camera, mouse } = useThree();
  const [analyser, setAnalyser] = useState<THREE.AudioAnalyser>();
  const [amplitude, setAmplitude] = useState(0);

  const raycaster = new THREE.Raycaster();

  useFrame(() => {
    if (analyser == null) return;

    const freq = analyser.getFrequencyData();

    const value = sum(freq) / 5000.0;
    setAmplitude((oldAmp) => oldAmp + (value - oldAmp) * 0.8);

    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    api.setState({ ray: raycaster.ray });
  });

  useEffect(() => {
    const audioLoader = new THREE.AudioLoader();
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);

    audioLoader.load(
      'https://floating-points.s3.us-east-2.amazonaws.com/dreamspace.mp3',
      (buffer) => {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();

        const analyser = new THREE.AudioAnalyser(sound, 32);
        setAnalyser(analyser);
      },
    );
    return () => {
      sound.stop();
    };
  }, []);

  const config = {
    ...defaultConfig,
    kaleidoscope: 5,
    name: 'chaos',
    noiseAmplitude: amplitude,
  } as const;

  return (
    <>
      <Shapes config={config} />
      <Effects params={config} />
    </>
  );
};

const Spiro = () => {
  return (
    <FiberScene
      camera={{ far: 10000, position: [0, 0, 300] }}
      gl={{ antialias: true }}
    >
      <Scene />
    </FiberScene>
  );
};

export const chaosConfig = {
  params: { name: 'chaos' as const },
  Contents: Shapes,
};

export default function GeoChaosPage() {
  const [started, start] = useState(false);

  return (
    <Page onClick={() => start(true)}>
      {started ? <Spiro /> : <div>Click to start</div>}
    </Page>
  );
}
