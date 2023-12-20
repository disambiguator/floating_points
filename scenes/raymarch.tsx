import { ScreenQuad } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useEffect } from 'react';
import { GLSL3, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three-stdlib';
import fragmentShader from 'lib/shaders/raymarch.frag';
import { type Config } from '../lib/store';

const shader = {
  uniforms: {
    aspect: { value: 0 },
    time: { value: 0 },
    amp: { value: 1 },
    camera_position: { value: new Vector3(0) },
    ta: { value: new Vector3() },
    band: { value: 0 },
  },
  vertexShader: `
    out vec2 vUV;
    void main() {
      vUV = position.xy;
      gl_Position = vec4(position, 1);
    }
    `,
  fragmentShader,
};

const Bars = React.memo(function Bars() {
  const viewport = useThree((t) => t.viewport);
  const camera = useThree((t) => t.camera as PerspectiveCamera);
  const controls = useThree((t) => t.controls as OrbitControls | undefined);

  useEffect(() => {
    const update = () => {
      shader.uniforms.camera_position.value = camera.position;
      if (controls) shader.uniforms.ta.value = controls.target;
    };

    update();
    if (controls) {
      // controls.listenToKeyEvents(window);
      controls.addEventListener('change', update);
    }
    return () => {
      controls?.removeEventListener('change', update);
    };
  }, [camera, controls]);

  useFrame((t) => {
    shader.uniforms.time.value = t.clock.elapsedTime;
    // const { volume } = useStore.getState().spectrum;
    // if (volume) {
    //   shader.uniforms.amp.value = scaleMidi(volume, 0, 2);
    // }
  });

  useControls('raymarch', {
    band: {
      value: 0,
      min: 0,
      max: 0.1,
      onChange: (v: number) => {
        shader.uniforms.band.value = v;
      },
    },
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        args={[shader]}
        uniforms-aspect-value={viewport.aspect}
        glslVersion={GLSL3}
      />
    </ScreenQuad>
  );
});

export const raymarchConfig: Config = {
  Contents: Bars,
  name: 'raymarch',
};
