import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import React from 'react';
import { DataTexture, RedFormat, ShaderMaterial } from 'three';
import StarkShader from 'lib/shaders/stark';
import Page from '../components/page';
import { FiberScene } from '../components/scene';
import { useMicrophone } from '../lib/audio';

const Shaders = React.memo(function Shader() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const ref = React.useRef<ShaderMaterial & ReturnType<typeof StarkShader>>(
    null,
  );
  const audio = useMicrophone();
  const { s } = useControls({ s: { value: 0.02, min: 0, max: 0.1 } });

  useFrame(({ clock }) => {
    if (!audio) return;
    if (!ref.current) return;

    audio.analyser.getFrequencyData();
    ref.current.uniforms.audio.value.needsUpdate = true;
    ref.current.uniforms.time.value = clock.elapsedTime;
  });

  if (!audio) return null;

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[StarkShader()]}
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
          <Shaders />
        </FiberScene>
      </div>
    </Page>
  );
}
