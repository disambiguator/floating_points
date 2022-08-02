import { useFrame, useThree } from '@react-three/fiber';
import Material, { GenericMaterial } from 'component-material';
import { useControls } from 'leva';
import React, { useRef } from 'react';
import { PointLight } from 'three';
import Page from 'components/page';
import { FiberScene } from 'components/scene';
import lightnoiseVertHead from 'lib/shaders/lightnoiseVertHead.glsl';

function CustomMaterial() {
  const ref = useRef<GenericMaterial>();
  const viewport = useThree((t) => t.viewport);
  const { depth } = useControls({
    depth: { value: 100, min: 0, max: 1000 },
  });

  useFrame(({ clock }) => {
    ref.current!.time = clock.elapsedTime;
  });

  return (
    <Material
      ref={ref}
      uniforms={{
        aspect: { value: viewport.aspect, type: 'float' },
        depth: { value: depth, type: 'float' },
        time: { value: 0, type: 'float' },
        radius: { value: 0.2, type: 'float' },
      }}
      varyings={{
        vColor: { type: 'vec3' },
      }}
      // @ts-ignore
      aspect={viewport.aspect}
      depth={depth}
    >
      <Material.Vert.Head>{lightnoiseVertHead}</Material.Vert.Head>
      <Material.Vert.Body>
        {`
        transformed = distortFunct(transformed);
        vec3 distortedNormal = distortNormal(position, transformed, normal);
        vNormal = distortedNormal;
        vColor = mix(vec3(.32,.95,.2), vec3(.9, .2, .78), transformed.z/depth);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed,1.0);
        `}
      </Material.Vert.Body>
      <Material.Frag.Body>{`gl_FragColor = vec4(gl_FragColor.rgb * vColor, gl_FragColor.a);  `}</Material.Frag.Body>
    </Material>
  );
}

function Scene() {
  const size = useThree((t) => t.size);
  const lightRef = useRef<PointLight>();

  useFrame(({ clock }) => {
    lightRef.current!.position.y = Math.sin(clock.elapsedTime) * 100;
  });

  return (
    <>
      <mesh receiveShadow>
        <planeGeometry args={[size.width, size.height, 200, 200]} />
        <CustomMaterial />
      </mesh>
      <pointLight
        ref={lightRef}
        castShadow
        decay={2000000000}
        position={[0, 100, 30]}
      />
    </>
  );
}

export default function ShaderPage() {
  return (
    <Page>
      <FiberScene
        shadows
        controls
        camera={{ far: 10000, position: [0, 0, 300] }}
      >
        <Scene />
      </FiberScene>
    </Page>
  );
}
