import { useFBO } from '@react-three/drei';
import { createPortal, useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import React from 'react';
import * as THREE from 'three';
import { scenes } from 'components/scenes';
import { Config, useSpectrum } from 'lib/store';
import Skull from 'models/Skull';

const res = 2000;

const Shader = () => ({
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
    gl_FragColor = max(texture2D(t, vUv), vec4(0.1));
  }
  `,
  uniforms: { mult: { value: 0 }, t: { value: null } },
});

const DusenScreen = () => {
  const controls = useControls({
    innerScene: { value: 'dusen', options: ['dusen', 'chaos', 'shader'] },
  });
  const innerScene = controls.innerScene as keyof typeof scenes;

  const Contents = React.useMemo(() => {
    return scenes[innerScene].Contents;
  }, [innerScene]);

  return <Contents />;
};

function ScreenQuadScene() {
  const shader = React.useMemo(Shader, []);

  const target = useFBO(res, res, {
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
  });
  const bufferScene = React.useMemo(() => new THREE.Scene(), []);
  const bufferCamera = new THREE.PerspectiveCamera(100, 1, 1000, 100);

  useFrame((state) => {
    state.gl.setRenderTarget(target);
    state.gl.render(bufferScene, bufferCamera);
    state.gl.setRenderTarget(null);
  });

  const [, setControl] = useControls('skull', () => ({
    mult: {
      value: 0,
      min: 0,
      max: 40,
      onChange: (v) => {
        shader.uniforms.mult.value = v * 0.1;
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
          args={[shader]}
          uniforms-t-value={target.texture}
          uniforms-mult-value={0}
        />
      </Skull>
      {createPortal(<DusenScreen />, bufferScene)}
    </>
  );
}

export const fboSkullConfig = {
  name: 'fboSkull',
  Contents: ScreenQuadScene,
} as const satisfies Config;
