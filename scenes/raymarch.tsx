import { ScreenQuad } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect } from 'react';
import { GLSL3, Matrix3, Matrix4, Vector3 } from 'three';
import { scaleMidi } from 'lib/midi';
import fragmentShader from 'lib/shaders/raymarch.frag';
import { type Config, useStore } from '../lib/store';

const shader = {
  uniforms: {
    aspect: { value: 0 },
    time: { value: 0 },
    amp: { value: 1 },
    camera_position: { value: new Vector3(0) },
    ta: { value: new Vector3() },
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
  const camera = useThree((t) => t.camera);
  useEffect(() => {
    camera.position.set(0, 0, -5);
  }, [camera]);

  useFrame(({ clock, camera }) => {
    shader.uniforms.time.value = clock.elapsedTime;
    shader.uniforms.camera_position.value = camera.position;
    const vector = new Vector3(0, 0, -1);
    vector.applyQuaternion(camera.quaternion);
    shader.uniforms.ta.value = vector;
    const { volume } = useStore.getState().spectrum;
    if (volume) {
      shader.uniforms.amp.value = scaleMidi(volume, 0, 2);
    }
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
