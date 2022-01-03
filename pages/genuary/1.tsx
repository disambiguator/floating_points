import { Effects, Instance, Instances } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import glsl from 'glslify';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import Page from 'components/page';
import { FiberScene } from 'components/scene';

const numCubes = 10000;

const Shader = {
  vertexShader: `
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec3 vPosition;
    void main() {
        vPosition = (vec4(position,1.) * instanceMatrix).xyz;
        gl_Position = projectionMatrix *
        modelViewMatrix *
        instanceMatrix *
        vec4(position,1.0);
    }
  `,
  fragmentShader: `
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec3 vPosition;
    void main() {
      vec3 color = normalize(vPosition);
      gl_FragColor = vec4(color, 1.0);
    }
`,

  uniforms: {
    origin: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
    direction: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
  },
};

const BoxInstance = () => {
  const position: [number, number, number] = [
    Math.random() * 300,
    Math.random() * 300,
    Math.random() * 300,
  ];

  return <Instance position={position} />;
};

const KaleidoscopeShader = {
  uniforms: {
    tDiffuse: { value: null },
  },
  vertexShader: `
  #ifdef GL_ES
  precision highp float;
  #endif

  varying vec2 vUv;
  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
  `,
  fragmentShader: glsl`
        #ifdef GL_ES
        precision highp float;
        #endif
        uniform float aspect;
        uniform sampler2D tDiffuse;
        varying vec2 vUv;

        #pragma glslify: kaleidoscope = require(../../lib/shaders/kaleidoscope.glsl)

        void main() {
          vec2 coord = vUv;

          // Shift to -1 to 1 coordinate system
          coord = coord * 2. - 1.;

          coord = kaleidoscope(coord, 2.);

          // Get old frame (in 0 to 1 coordinate system)
          coord = (coord + 1.)/2.;

          gl_FragColor = texture2D(tDiffuse, coord);
        }
      `,
};

export const Shapes = React.memo(function Shapes() {
  const materialRef = useRef<THREE.ShaderMaterial>();
  useFrame(({ camera }) => {
    camera.translateX(-0.5);
    console.log(camera.position);
  });

  const cubes = useMemo(() => {
    const c = Array(numCubes);
    for (let i = 0; i < numCubes; i++) {
      c[i] = <BoxInstance key={i} />;
    }
    return c;
  }, []);

  return (
    <>
      <Instances>
        <boxGeometry args={[15, 15, 15]} />
        <shaderMaterial args={[Shader]} ref={materialRef} />
        {cubes}
      </Instances>
      <Effects>
        <shaderPass attachArray="passes" args={[KaleidoscopeShader]} />
      </Effects>
    </>
  );
});

export default function Scene() {
  return (
    <Page>
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene camera={{ far: 10000, position: [500, 0, 0] }} controls>
          <Shapes />
        </FiberScene>
      </div>
    </Page>
  );
}
