import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { scaleMidi } from '../lib/midi';
import { Config, useStore } from '../lib/store';
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
  const geometryRef = useRef<THREE.BufferGeometry>();

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
      <boxBufferGeometry args={[15, 15, 15]} ref={geometryRef}>
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

export const Shapes = React.memo(function Shapes() {
  const materialRef = useRef<THREE.ShaderMaterial>();
  const displacement = useMemo(() => {
    const d = new Float32Array(renderSpeed);
    for (let i = 0; i < renderSpeed; i++) {
      d[i] = Math.random() * 5;
    }
    return d;
  }, []);

  const material = useMemo(() => {
    return <shaderMaterial args={[Shader]} ref={materialRef} />;
  }, []);

  useControls('chaos', {
    warp: {
      value: 0,
      min: 0,
      max: 127,
      onChange: (v) => {
        materialRef.current!.uniforms.amplitude.value = scaleMidi(
          v * 1000,
          0,
          0.0005,
        );
      },
    },
  });

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
    [displacement, material],
  );

  return <>{cubes}</>;
});

export const chaosConfig: Config = {
  name: 'chaos',
  Contents: Shapes,
  params: {},
};
