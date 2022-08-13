import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import { DataTexture, RedFormat, type ShaderMaterial } from 'three';
import defaultForwardUV from 'lib/shaders/defaultForwardUV.vert';
import doomFrag from 'lib/shaders/doom.frag';
import Page from '../components/page';
import { FiberScene } from '../components/scene';
const textureSize = 512;

const shader = {
  vertexShader: defaultForwardUV,
  fragmentShader: doomFrag,
  uniforms: {
    aspect: { value: 0.0 },
    time: { value: 0.0 },
    noise: {
      value: new DataTexture(new Uint8Array([0]), 0, 1, RedFormat),
    },
  },
};
const Shaders = React.memo(function Shader() {
  const viewport = useThree((t) => t.viewport);
  const size = useThree((t) => t.size);
  const ref = useRef<ShaderMaterial>();
  useFrame(({ clock }) => {
    ref.current!.uniforms.time.value = clock.elapsedTime;
  });

  const onClick = () => {
    const size = Math.floor(1000 * Math.random());

    ref.current!.uniforms.noise.value = new DataTexture(
      new Uint8Array(
        new Array(size).fill(undefined).map(() => {
          return Math.random() * 255;
        }),
      ),
      size,
      1,
      RedFormat,
    );
  };

  return (
    <mesh position={[0, 0, -215]} onClick={onClick}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={ref}
        args={[shader]}
        uniforms-aspect-value={viewport.aspect}
        uniforms-noise-value={
          new DataTexture(
            new Uint8Array(
              new Array(textureSize).fill(undefined).map(() => {
                return Math.random() * 255;
              }),
            ),
            textureSize,
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
      <FiberScene controls>
        <Shaders />
      </FiberScene>
    </Page>
  );
}
