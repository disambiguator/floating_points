import { useFrame } from '@react-three/fiber';
import { folder, useControls } from 'leva';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { type BufferGeometry, type Mesh, Uniform, Vector3 } from 'three';
import { type MidiConfig, scaleMidi, useMidi } from '../lib/midi';
import { type Config, useSpectrum, useStore } from '../lib/store';
const renderSpeed = 1000;

const Shader = {
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
};

const Box = ({
  displacement,
  material,
}: {
  displacement: Float32Array;
  material: JSX.Element;
}) => {
  const meshRef = useRef<Mesh>(null);
  const geometryRef = useRef<BufferGeometry>(null);

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
          attachObject={['attributes', 'displacement']}
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
  const materialRef = useRef<typeof Shader>(null);

  const setAmplitude = useCallback((v: number) => {
    materialRef.current!.uniforms.amplitude.value = scaleMidi(
      v * 1000,
      0,
      0.0005,
    );
  }, []);

  const material = useMemo(() => {
    return <shaderMaterial args={[Shader]} ref={materialRef} />;
  }, []);

  useSpectrum({ amplitude: setAmplitude });

  const [, setControls] = useControls(() => ({
    chaos: folder({
      warp: { value: 0, min: 0, max: 127, onChange: setAmplitude },
    }),
  }));

  useMidi(
    useMemo(
      (): MidiConfig => ({
        1: (value, modifiers) => {
          if (modifiers.shift) {
            // @ts-expect-error - dont know why this does not work
            setControls({ warp: value });
          }
        },
      }),
      [setControls],
    ),
  );

  useFrame(({ camera }) => {
    camera.translateX(-0.5);
    const { ray } = useStore.getState();

    const material = materialRef.current!;
    material.uniforms.origin.value = ray.origin;
    material.uniforms.direction.value = ray.direction;
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

  return <>{cubes}</>;
});

export const chaosConfig: Config = {
  name: 'chaos',
  Contents: Shapes,
  params: {},
};
