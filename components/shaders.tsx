import { useFrame, useThree } from '@react-three/fiber';
import { Perf } from 'r3f-perf';
import React, { useRef } from 'react';
import { ShaderMaterial, ShaderMaterialParameters } from 'three';
import useCapture from 'use-capture';
import Page from '../components/page';
import { FiberScene } from '../components/scene';
import { shaders } from '../components/scenes';

const Shaders = React.memo(function Shader({
  shader,
}: {
  shader: ShaderMaterialParameters;
}) {
  const { viewport, size, clock } = useThree();
  const ref = useRef<ShaderMaterial>();

  useFrame(() => {
    ref.current!.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -215]}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[shader]}
        uniforms-aspect-value={viewport.aspect}
      />
    </mesh>
  );
});

export default function ShaderPage({ name: shaderName }: { name: string }) {
  const [bind, startRecording] = useCapture({
    duration: 5,
    framerate: 60,
    fps: 60,
    verbose: true,
    format: 'webm',
  });

  // @ts-ignore
  const shader = shaders[shaderName];

  return (
    <Page>
      {shader ? (
        <div>
          <FiberScene
            gl={{
              preserveDrawingBuffer: true,
            }}
            onCreated={bind}
            style={{ height: '1024px', width: '1024px' }}
          >
            <Shaders shader={shader} />
            <color attach="background" args={['#000']} />
            <Perf />
          </FiberScene>
          <button
            style={{ position: 'absolute', left: 0, top: 0 }}
            onClick={startRecording}
          >
            ⏺️ Start Recording
          </button>
        </div>
      ) : (
        'Invalid shader name'
      )}
    </Page>
  );
}
