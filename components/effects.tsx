import { Effects as DreiEffects } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { button, folder, useControls } from 'leva';
import React, { useEffect, useMemo, useRef } from 'react';
import { Vector2 } from 'three';
import { AfterimagePass, EffectComposer } from 'three-stdlib';
import { type MidiConfig, scaleMidi, useMidi } from 'lib/midi';
import TunnelShader from '../lib/shaders/tunnel';
import {
  type Config,
  type CustomEffectsType,
  useSpectrum,
  useStore,
} from '../lib/store';

declare class AfterimagePassType extends AfterimagePass {
  uniforms: (typeof TunnelShader)['uniforms'];
}

export const useTunnelEffects = () => {
  // Could use r3f's extend here if we go back to only using this declaratively.
  const pass = useMemo<AfterimagePassType>(
    () => new AfterimagePass(0.96, TunnelShader),
    [],
  );
  const viewport = useThree((three) => three.viewport);
  const size = useThree((three) => three.size);
  const trailNoiseTimeRef = useRef(0);

  const [, setControl] = useControls(() => ({
    postprocessing: folder({
      trails: {
        value: 0,
        min: 0,
        max: 127,
        onChange: (trails: number) => {
          pass.uniforms.damp.value =
            trails === 0 ? trails : scaleMidi(trails, 0.9, 1);
        },
      },
      zoom: {
        value: 0,
        min: 0,
        max: 127,
        onChange: (zoom: number) => {
          pass.uniforms.zoom.value = scaleMidi(zoom, 0, 0.3);
        },
      },
      aberration: {
        value: 0,
        min: 0,
        max: 127,
        onChange: (v: number) => {
          pass.uniforms.aberration.value = scaleMidi(v, 0, 0.1);
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
          pass.uniforms.xspeed.value = scaleMidi(xSpeed, -1, 1, true);
        },
      },
      ySpeed: {
        value: 64,
        min: 0,
        max: 127,
        onChange: (ySpeed: number) => {
          pass.uniforms.yspeed.value = scaleMidi(ySpeed, -1, 1, true);
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
        // @ts-expect-error - idk why leva typing fails here
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
    }),
  }));

  useSpectrum(
    Object.fromEntries(
      ['bitcrush', 'trailNoiseAmplitude'].map((k) => [
        k,
        (v: number) => {
          setControl({ [k]: v });
        },
      ]),
    ),
  );

  const midiMapping: MidiConfig = useMemo(
    () => ({
      1: (value, { shift }) => {
        if (!shift) {
          // @ts-expect-error - Not sure why typing messed up here
          setControl({ trails: value });
        }
      },
      2: (value) => {
        // @ts-expect-error - Not sure why typing messed up here
        setControl({ zoom: value });
      },
      3: (value) => {
        // @ts-expect-error - Not sure why typing messed up here
        setControl({ bitcrush: value });
      },
      4: (value, modifiers) => {
        setControl({ [modifiers.shift ? 'amplitude' : 'xSpeed']: value });
      },
      5: (value, modifiers) => {
        setControl({ [modifiers.shift ? 'frequency' : 'ySpeed']: value });
      },
      6: (value, modifiers) => {
        setControl({ [modifiers.shift ? 'time' : 'angle']: value });
      },
      7: (value) => {
        const currentValue = pass.uniforms.numSides.value;
        const newValue = value === 1 ? currentValue + 1 : currentValue - 1;
        // @ts-expect-error - Not sure why typing messed up here
        setControl({ kaleidoscope: newValue });
      },
    }),
    [setControl, pass],
  );
  useMidi(midiMapping);

  useFrame(({ mouse }, delta) => {
    const { uniforms } = pass;
    if (useStore.getState().shiftPressed) {
      uniforms.mouse.value.x = mouse.x * viewport.aspect;
      uniforms.mouse.value.y = mouse.y;
    }
    uniforms.time.value += delta * trailNoiseTimeRef.current;
  });

  useEffect(() => {
    pass.uniforms.aspect.value = viewport.aspect;
    pass.uniforms.resolution.value = new Vector2(
      size.width,
      size.height,
    ).multiplyScalar(window.devicePixelRatio);
  }, [viewport.aspect, size, pass]);

  return pass;
};

export const Effects = <T,>({
  params,
  CustomEffects,
}: {
  name: Config<T>['name'];
  params: T;
  CustomEffects: CustomEffectsType<T> | undefined;
}) => {
  const ref = useRef<EffectComposer>(null);
  const tunnelEffects = useTunnelEffects();
  useEffect(() => {
    const effects = ref.current;
    effects!.addPass(tunnelEffects);
    return () => {
      if (effects) effects.removePass(tunnelEffects);
    };
  }, [tunnelEffects]);

  return (
    <DreiEffects ref={ref} disableGamma>
      {CustomEffects && <CustomEffects params={params} />}
    </DreiEffects>
  );
};
