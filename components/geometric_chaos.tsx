import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from 'react-three-fiber';
import * as THREE from 'three';
import { ShaderMaterial } from 'three';
import { useStore } from '../lib/store';
import { scaleMidi } from './mixer';
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
  const { camera } = useThree();
  const materialRef = useRef<ShaderMaterial>();
  const displacement = useMemo(() => {
    const d = new Float32Array(renderSpeed);
    for (let i = 0; i < renderSpeed; i++) {
      d[i] = Math.random() * 5;
    }
    return d;
  }, []);

  const { noiseAmplitude } = useStore(({ noiseAmplitude }) => ({
    noiseAmplitude,
  }));

  const amplitude = noiseAmplitude * 1000;

  const material = useMemo(
    () => (
      <shaderMaterial
        args={[Shader]}
        ref={materialRef}
        uniforms-amplitude-value={scaleMidi(amplitude, 0, 0.0005)}
      />
    ),
    [],
  );

  useFrame(() => {
    camera.translateX(-0.5);
    const { ray } = useStore.getState();

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

export const chaosConfig = {
  params: { name: 'chaos' as const },
  Contents: Shapes,
};
