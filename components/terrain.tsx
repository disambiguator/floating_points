import { useFBO } from '@react-three/drei';
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import { ReactElement, useMemo } from 'react';
import * as THREE from 'three';
import { EffectComposer, RenderPass } from 'three-stdlib';
import { useTunnelEffects } from 'components/effects';

const res = 100;

const shader = {
  vertexShader: `
  #ifdef GL_ES
precision highp float;
#endif

uniform sampler2D t;

out vec2 vUv;
uniform float mult;
uniform float aspect;


void main() {
  vUv = uv;

  vec3 p = position;
  p.z =  length(texture2D(t, vUv)) * mult * mult;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);

  // texture2D(tOld, coord);
}
  `,
  fragmentShader: `
  in vec2 vUv;
uniform sampler2D t;

  void main() {
    gl_FragColor = texture2D(t, vUv);
  }
  `,
  uniforms: { mult: { value: 0 }, t: { value: null }, aspect: { value: 0.0 } },
};

export default function Terrain({ children }: { children: ReactElement }) {
  const target = useFBO(res, res, {
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
  });
  const gl = useThree((t) => t.gl);
  const tunnelPass = useTunnelEffects();
  const size = useThree((t) => t.size);
  const viewport = useThree((t) => t.viewport);

  const bufferScene = useMemo(() => new THREE.Scene(), []);
  const composer = useMemo(() => {
    const bufferCamera = new THREE.PerspectiveCamera(100, 1, 1000, 100);
    const c = new EffectComposer(gl, target);
    c.renderToScreen = false;
    c.addPass(new RenderPass(bufferScene, bufferCamera));
    c.addPass(tunnelPass);
    return c;
  }, [bufferScene, gl, target, tunnelPass]);

  useFrame(() => {
    composer.render();
    composer.swapBuffers();
  });

  const { mult } = useControls({
    mult: { value: 0, min: 0, max: 20 },
  });

  return (
    <>
      <mesh position={[0, 0, -215]}>
        <planeGeometry args={[size.width, size.height, res, res]} />
        <shaderMaterial
          args={[shader]}
          uniforms-t-value={target.texture}
          uniforms-aspect-value={viewport.aspect}
          uniforms-mult-value={mult}
        />
      </mesh>
      {createPortal(children, bufferScene)}
    </>
  );
}
