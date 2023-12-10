import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useEffect, useMemo, useRef } from 'react';
import { BoxGeometry, Group, type Mesh, Uniform, Vector3 } from 'three';
import { type MidiConfig, scaleMidi, useMidi } from '../lib/midi';
import { type Config, useSpectrum, useStore } from '../lib/store';
const renderSpeed = 1000;

const Shader = () => ({
  vertexShader: /* glsl */ `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform float amplitude;
    uniform vec3 origin;
    uniform vec3 direction;
    attribute float displacement;

    out vec3 vPosition;

    void main() {

    vPosition = position;

    vec3 newPosition = position + amplitude * displacement * 100.0 * direction;

    gl_Position = projectionMatrix *
      modelViewMatrix *
      vec4(newPosition,1.0);
    }
`,

  fragmentShader: /* glsl */ `
    #ifdef GL_ES
    precision highp float;
    #endif

    in vec3 vPosition;
    in float vColor;

    void main() {

    vec3 color = normalize(vPosition);

    gl_FragColor = vec4(color, 1.0);

    }
`,

  uniforms: {
    amplitude: new Uniform(0.0005),
    origin: new Uniform(new Vector3(0, 0, 0)),
    direction: new Uniform(new Vector3(0, 0, 0)),
  },
});

const Box = ({
  displacement,
  material,
}: {
  displacement: Float32Array;
  material: JSX.Element;
}) => {
  const meshRef = useRef<Mesh>(null);
  const geometryRef = useRef<BoxGeometry>(null);

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
      <boxGeometry args={[15, 15, 15]} ref={geometryRef}>
        <bufferAttribute
          attach="attributes-displacement"
          count={renderSpeed}
          array={displacement}
          itemSize={1}
        />
      </boxGeometry>
      {material}
    </mesh>
  );
};

const displacement = new Float32Array(renderSpeed);
for (let i = 0; i < renderSpeed; i++) {
  displacement[i] = Math.random() * 5;
}

export const Shapes = React.memo(function Shapes() {
  const groupRef = useRef<Group>(null!);
  const shader = useMemo(Shader, []);

  const material = useMemo(() => {
    return <shaderMaterial args={[shader]} />;
  }, [shader]);

  const [, setControls] = useControls('chaos', () => ({
    warp: {
      value: 0,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        shader.uniforms.amplitude.value = scaleMidi(v * 1000, 0, 0.0005);
      },
    },
  }));

  useSpectrum({
    amplitude: (v) => {
      setControls({ warp: v });
    },
  });

  useMidi(
    useMemo(
      (): MidiConfig => ({
        1: (value, modifiers) => {
          if (modifiers['shift']) {
            setControls({ warp: value });
          }
        },
      }),
      [setControls],
    ),
  );

  useFrame(() => {
    groupRef.current.rotateX(-0.005);
    const { ray } = useStore.getState();

    shader.uniforms.origin.value = ray.origin;
    shader.uniforms.direction.value = ray.direction;
  });

  const cubes = useMemo(
    () =>
      Array(500)
        .fill(undefined)
        .map((_value, i) => (
          <Box key={i} displacement={displacement} material={material} />
        )),
    [material],
  );

  return <group ref={groupRef}>{cubes}</group>;
});

export const chaosConfig: Config = {
  name: 'chaos',
  Contents: Shapes,
};
