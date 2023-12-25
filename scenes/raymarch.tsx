import { ScreenQuad } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useEffect } from 'react';
import { GLSL3, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three-stdlib';
import { scaleMidi } from 'lib/midi';
import fragmentShader from 'lib/shaders/raymarch.frag';
import { type Config, useSpectrum } from '../lib/store';

function scaleExponential(
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  // normalize value to range 0-1
  const normalized = (v - inMin) / (inMax - inMin);

  // apply exponential function and scale to output range
  const exponential =
    Math.exp(normalized * Math.log(outMax - outMin + 1)) - 1 + outMin;

  return exponential;
}

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
        shader.uniforms.band.value = scaleMidi(v, 0, 1);
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

export const raymarchConfig: Config = {
  Contents: Bars,
  name: 'raymarch',
};
