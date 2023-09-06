import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useMemo, useRef } from 'react';
import { DataTexture, RedFormat, ShaderMaterial } from 'three';
import StarkShader from 'lib/shaders/stark';
import Page from '../components/page';
import { FiberScene } from '../components/scene';
import { useMicrophone } from '../lib/audio';

export const Stark = React.memo(function Shader() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const ref = useRef<ShaderMaterial & ReturnType<typeof StarkShader>>(null);
  const audio = useMicrophone();
  const { s, speed } = useControls({
    s: { value: 0.02, min: 0, max: 0.1 },
    speed: { value: 0.02, min: 0, max: 20 },
  });
  const shader = useMemo(StarkShader, []);

  useFrame((_, delta) => {
    if (!audio) return;
    if (!ref.current) return;

    audio.analyser.getFrequencyData();
    ref.current.uniforms.audio.value.needsUpdate = true;
    ref.current.uniforms.time.value += delta * speed;
  });

  if (!audio) return null;

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[shader]}
        uniforms-aspect-value={viewport.aspect}
        uniforms-s-value={s}
        uniforms-audio-value={
          new DataTexture(
            audio.analyser.data,
            audio.analyser.analyser.frequencyBinCount,
            1,
            RedFormat,
          )
        }
      />
    </mesh>
  );
});

export default function ShaderPage() {
  return (
    <Page>
      <div style={{ height: '90vh', width: '90vh' }}>
        <FiberScene>
          <Stark />
        </FiberScene>
      </div>
    </Page>
  );
}
