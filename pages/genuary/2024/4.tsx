import { ScreenQuad } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect } from 'react';
import { GLSL3, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three-stdlib';
import Page from 'components/page';
import { FiberScene } from 'components/scene';
import { scaleExponential } from 'lib/helpers';
import { scaleMidi } from 'lib/midi';
import fragmentShader from './4.frag';

const shader = {
  uniforms: {
    aspect: { value: 0 },
    time: { value: 0 },
    amp: { value: 1 },
    camera_position: { value: new Vector3(0) },
    ta: { value: new Vector3() },
    band: { value: scaleMidi(14, 0, 1) },
    starting_distance: { value: scaleExponential(127, 0, 127, 0, 20) },
    band_center: { value: 1 - scaleMidi(0.5, 0, 1) },
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
  const controls = useThree((t) => t.controls);

  useEffect(() => {
    const update = () => {
      shader.uniforms.camera_position.value = camera.position;
      if (controls instanceof OrbitControls) {
        shader.uniforms.ta.value = controls.target;
      } else {
        shader.uniforms.ta.value
          .set(0, 0, -1)
          .applyQuaternion(camera.quaternion);
      }
    };

    update();
    if (controls) {
      if (controls instanceof OrbitControls) {
        // @ts-expect-error - window not domelement
        controls.listenToKeyEvents(window);
      }
      controls.addEventListener('change', update);
    }
    return () => {
      controls?.removeEventListener('change', update);
    };
  }, [camera, controls]);

  useFrame((t) => {
    shader.uniforms.time.value = t.clock.elapsedTime;
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

export default function Four() {
  return (
    <Page>
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene
          controls
          camera={{ far: 1000, near: 10, position: [0, 0, 100] }}
        >
          <Bars />
        </FiberScene>
      </div>
    </Page>
  );
}
