import { useFBO } from '@react-three/drei';
import { createPortal, useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Config, useSpectrum } from 'lib/store';
import Skull from 'models/Skull';
import { Dusen } from 'scenes/dusen';

const res = 2000;

const shader = {
  vertexShader: `
  #ifdef GL_ES
precision highp float;
#endif

uniform sampler2D t;

out vec2 vUv;
uniform float mult;

void main() {
  vUv = uv;

  vec3 p = position;
  // p.z =  length(texture2D(t, vUv)) * mult * mult;
  float distort = length(texture2D(t, vUv));
  // float distort = texture2D(t, vUv).r;
  p = p + normal * mult * distort;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);

  // texture2D(tOld, coord);
}
  `,
  fragmentShader: `
  in vec2 vUv;
uniform sampler2D t;

  void main() {
    gl_FragColor = texture2D(t, vUv);
  }
  `,
  uniforms: { mult: { value: 0 }, t: { value: null } },
};

const DusenScreen = () => {
  return <Dusen />;
};

function ScreenQuadScene() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const target = useFBO(res, res, {
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
  });
  const bufferScene = useMemo(() => new THREE.Scene(), []);
  const bufferCamera = new THREE.PerspectiveCamera(100, 1, 1000, 100);

  useFrame((state) => {
    state.gl.setRenderTarget(target);
    state.gl.render(bufferScene, bufferCamera);
    state.gl.setRenderTarget(null);
  });

  const [, setControl] = useControls(() => ({
    mult: {
      value: 0,
      min: 0,
      max: 4,
      onChange: (v) => {
        materialRef.current!.uniforms.mult.value = v;
      },
    },
  }));

  useSpectrum({
    mult: (v) => {
      setControl({ mult: v });
    },
  });

  return (
    <>
      <Skull scale={100}>
        <shaderMaterial
          ref={materialRef}
          args={[shader]}
          uniforms-t-value={target.texture}
          uniforms-mult-value={0}
        />
      </Skull>
      {createPortal(<DusenScreen />, bufferScene)}
    </>
  );
}

function FBO() {
  return (
    <React.Suspense fallback={null}>
      <ScreenQuadScene />
    </React.Suspense>
  );
}

export const fboSkullConfig: Config = {
  name: 'fboSkull',
  Contents: FBO,
  params: {},
};
