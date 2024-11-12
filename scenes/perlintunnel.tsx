import { FlyControls, ScreenQuad } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useEffect } from 'react';
import { GLSL3, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three-stdlib';
import { scaleExponential } from 'lib/helpers';
import { useRefState } from 'lib/hooks';
import { scaleMidi } from 'lib/midi';
import fragmentShader from 'lib/shaders/perlintunnel.frag';
import { type Config, useSpectrum } from '../lib/store';

const shader = {
  uniforms: {
    aspect: { value: 0 },
    time: { value: 0 },
    amp: { value: 1 },
    camera_position: { value: new Vector3(0) },
    ta: { value: new Vector3() },
    band: { value: 0.1 },
    starting_distance: { value: 1.0 },
    band_center: { value: 0.5 },
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
  const [speed, setSpeed] = useRefState(1);

  useEffect(() => {
    const update = () => {
      shader.uniforms.camera_position.value = camera.position;
      console.log('position', camera.position);

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
      // @ts-expect-error - no idea how to get event types
      controls.addEventListener('change', update);
    }
    return () => {
      // @ts-expect-error - no idea how to get event types
      controls?.removeEventListener('change', update);
    };
  }, [camera, controls]);

  useFrame((_, delta) => {
    shader.uniforms.time.value += delta * speed.current;
    // const { volume } = useStore.getState().spectrum;
    // if (volume) {
    //   shader.uniforms.amp.value = scaleMidi(volume, 0, 2);
    // }
  });

  const [, setControls] = useControls('raymarch', () => ({
    band: {
      value: 1.0,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        shader.uniforms.band.value = scaleMidi(v, 0.00000001, 0.7);
      },
    },
    amp: {
      value: 1.0,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        shader.uniforms.amp.value = scaleMidi(v, 0.0, 0.5);
      },
    },
    starting_distance: {
      value: 1,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        shader.uniforms.starting_distance.value = scaleExponential(
          v,
          0,
          127,
          0,
          20,
        );
      },
    },
    band_center: {
      value: 0.5,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        shader.uniforms.band_center.value = 1 - scaleMidi(v, 0, 1);
      },
    },
    speed: {
      value: 1,
      min: 0,
      max: 2,
      onChange: setSpeed,
    },
  }));

  useSpectrum({
    band_center: (v) => {
      setControls({ band_center: v });
    },
    band: (v) => {
      setControls({ band: v });
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

export const perlinTunnelConfig = {
  Contents: Bars,
  name: 'perlintunnel',
  controls: (
    <FlyControls makeDefault movementSpeed={30} rollSpeed={0.8} dragToLook />
  ),
} as const satisfies Config;
