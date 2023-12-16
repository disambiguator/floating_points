import { Effects as DreiEffects } from '@react-three/drei';
import {
  type ReactThreeFiber,
  extend,
  useFrame,
  useThree,
} from '@react-three/fiber';
import { button, folder, levaStore, useControls } from 'leva';
import { useEffect, useMemo, useRef } from 'react';
import { NearestFilter, Vector2 } from 'three';
import { AfterimagePass, UnrealBloomPass } from 'three-stdlib';
import { scaleMidi, useMidi, useMidiTwo } from 'lib/midi';
import TunnelShader from '../lib/shaders/tunnel';
import { type Config, useSpectrum, useStore } from '../lib/store';

extend({ AfterimagePass, UnrealBloomPass });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface IntrinsicElements {
      afterimagePass: ReactThreeFiber.Node<
        AfterimagePass,
        typeof AfterimagePass
      >;
      unrealBloomPass: ReactThreeFiber.Node<
        UnrealBloomPass,
        typeof UnrealBloomPass
      >;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

declare class AfterimagePassType extends AfterimagePass {
  uniforms: (typeof TunnelShader)['uniforms'];
}

const midiConfig = {
  1: 'trails',
  2: 'aberration',
  3: 'bitcrush',
  4: 'xSpeed',
  // shift : 'trailNoiseAmplitude'
  5: 'ySpeed',
  // shift frequency
  6: 'angle',
};
export const useTunnelEffects = () => {
  // Could use r3f's extend here if we go back to only using this declaratively.
  const pass = useMemo<AfterimagePassType>(() => {
    const p = new AfterimagePass(0.96, TunnelShader);
    p.textureComp.texture.minFilter = NearestFilter;
    // p.textureComp.texture.magFilter = LinearFilter;
    return p;
  }, []);
  const viewport = useThree((three) => three.viewport);
  const size = useThree((three) => three.size);
  const trailNoiseTimeRef = useRef(0);

  const [, setControl] = useControls('postprocessing', () => ({
    trails: {
      value: 0,
      min: 0,
      max: 127,
      onChange: (trails: number) => {
        pass.uniforms.damp.value =
          trails === 0 ? trails : scaleMidi(trails, 0.9, 1);
      },
    },
    aberration: {
      value: 0,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        pass.uniforms.aberration.value = scaleMidi(v, 0, 0.02);
      },
    },
    bitcrush: {
      value: 0,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        pass.uniforms.bitcrush.value = v;
      },
    },
    kaleidoscope: {
      value: 0,
      min: 0,
      max: 127,
      onChange: (kaleidoscope: number) => {
        pass.uniforms.numSides.value = kaleidoscope;
      },
    },
    xSpeed: {
      value: 64,
      min: 0,
      max: 127,
      onChange: (xSpeed: number) => {
        pass.uniforms.xspeed.value = scaleMidi(127 - xSpeed, -1, 1, true);
      },
    },
    ySpeed: {
      value: 64,
      min: 0,
      max: 127,
      onChange: (ySpeed: number) => {
        pass.uniforms.yspeed.value = scaleMidi(127 - ySpeed, -1, 1, true);
      },
    },
    angle: {
      value: 64,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        pass.uniforms.angle.value = scaleMidi(
          v,
          -Math.PI / 10,
          Math.PI / 10,
          true,
        );
      },
    },
    'reset rotations': button(() => {
      setControl({ xSpeed: 64, ySpeed: 64, angle: 64 });
    }),
    trailNoise: folder({
      trailNoiseAmplitude: {
        label: 'amplitude',
        value: 0,
        min: 0,
        max: 127,
        onChange: (v: number) => {
          pass.uniforms.trailNoiseAmplitude.value = scaleMidi(v, 0, 0.1);
        },
      },
      frequency: {
        value: 0,
        min: 0,
        max: 127,
        onChange: (v: number) => {
          pass.uniforms.trailNoiseFrequency.value = scaleMidi(v, 0, 50);
        },
      },
      time: {
        value: 0,
        min: 0,
        max: 127,
        onChange: (v: number) => {
          trailNoiseTimeRef.current = scaleMidi(v, 0, 2);
        },
      },
    }),
  }));

  useSpectrum(
    Object.fromEntries(
      [
        'trails',
        'aberration',
        'bitcrush',
        'trailNoiseAmplitude',
        'frequency',
        'time',
        'angle',
        'xSpeed',
        'ySpeed',
      ].map((k) => [
        k,
        (v: number) => {
          setControl({ [k]: v });
        },
      ]),
    ),
  );

  useMidiTwo(levaStore, 'postprocessing', midiConfig);

  useFrame(({ pointer }, delta) => {
    const { uniforms } = pass;
    if (useStore.getState().shiftPressed) {
      uniforms.mouse.value.x = pointer.x * viewport.aspect;
      uniforms.mouse.value.y = pointer.y;
    }
    uniforms.time.value += delta * trailNoiseTimeRef.current;
  });

  const gl = useThree((three) => three.gl);

  useEffect(() => {
    pass.uniforms.aspect.value = viewport.aspect;
    pass.uniforms.resolution.value = new Vector2(
      size.width,
      size.height,
    ).multiplyScalar(gl.getPixelRatio());
  }, [viewport.aspect, size, pass, gl]);

  return pass;
};

export const Effects = ({
  CustomEffects,
}: {
  name: Config['name'];
  CustomEffects: Config['CustomEffects'] | undefined;
}) => {
  const tunnelEffects = useTunnelEffects();
  const bloomRef = useRef<UnrealBloomPass>(null);
  const [, setControl] = useControls('postprocessing', () => ({
    bloom: {
      value: 0,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        if (bloomRef.current) {
          bloomRef.current.strength = scaleMidi(v, 0, 10);
        }
      },
    },
  }));

  useSpectrum({
    bloom: (v: number) => {
      setControl({ bloom: v });
    },
  });

  useMidi({
    8: (v: number) => {
      setControl({ bloom: v });
    },
  });

  return (
    <DreiEffects disableGamma>
      {CustomEffects && <CustomEffects />}
      <primitive object={tunnelEffects} />
      <unrealBloomPass ref={bloomRef} />
    </DreiEffects>
  );
};
