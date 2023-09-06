import { useFBO } from '@react-three/drei';
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer, RenderPass } from 'three-stdlib';
import { useTunnelEffects } from 'components/effects';
import Page from 'components/page';
import { FiberScene } from 'components/scene';
import { Dusen } from 'scenes/dusen';
import { Stark } from './stark';

const res = 2000;

const shader = {
  vertexShader: `
  #ifdef GL_ES
precision highp float;
#endif

uniform sampler2D t;

out vec2 vUv;
out vec3 vColor;
uniform float mult;
uniform vec3 cameraOrigin;
uniform vec3 cameraDirection;
uniform float distanceMult;

float computeDistance(
  vec3 vertexPosition
) {
  vec3 d = normalize(cameraDirection);
  vec3 v = vertexPosition - cameraOrigin;
  float t = dot(v, d);
  vec3 P = cameraOrigin + t * d;
  return distance(P, vertexPosition);
}

void main() {
  vUv = uv;

  vec3 p = position;
  vec3 c = texture2D(t, vUv).rgb;
  p.z =  length(c) * mult * mult;
  // float d = distance(camera, p);
  float d = computeDistance(p);
  vColor = c;// * 1./(d * distanceMult);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
  `,
  fragmentShader: `
  in vec2 vUv;
  in vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor,1.);
  }
  `,
  uniforms: {
    mult: { value: 0 },
    t: { value: null },
    cameraOrigin: { value: new THREE.Vector3() },
    cameraDirection: { value: new THREE.Vector3() },
    distanceMult: { value: 0 },
  },
};

const DusenScreen = () => {
  return <Stark />;
  // return <Dusen />;
};

const raycaster = new THREE.Raycaster();

function ScreenQuadScene() {
  const target = useFBO(res, res, {
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
  });
  const gl = useThree((t) => t.gl);
  const tunnelPass = useTunnelEffects();
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  const bufferScene = useMemo(() => new THREE.Scene(), []);
  const composer = useMemo(() => {
    const bufferCamera = new THREE.PerspectiveCamera(100, 1, 1000, 100);
    const c = new EffectComposer(gl, target);
    c.renderToScreen = false;
    c.addPass(new RenderPass(bufferScene, bufferCamera));
    c.addPass(tunnelPass);
    return c;
  }, [bufferScene, gl, target, tunnelPass]);

  useFrame(({ mouse, camera }) => {
    composer.render();
    composer.swapBuffers();

    raycaster.setFromCamera(mouse, camera);

    // shader.uniforms.camera.value = mouse.position;
    shaderRef.current!.uniforms.cameraOrigin.value = raycaster.ray.origin;
    shaderRef.current!.uniforms.cameraDirection.value = raycaster.ray.direction;
  });

  const { mult, distanceMult } = useControls({
    mult: { value: 0, min: 0, max: 20 },
    distanceMult: { value: 0, min: 0, max: 0.1 },
  });

  return (
    <>
      <mesh position={[0, 0, -25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100, res, res]} />
        <shaderMaterial
          ref={shaderRef}
          args={[shader]}
          uniforms-t-value={target.texture}
          uniforms-mult-value={mult}
          // uniforms-camera-value={camera.position}
          uniforms-distanceMult-value={distanceMult}
        />
      </mesh>
      {/* <mesh position={[0, 0, 100]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry />
        <shaderMaterial
          ref={shaderRef}
          args={[shader]}
          uniforms-t-value={target.texture}
          uniforms-mult-value={mult}
          // uniforms-camera-value={camera.position}
          uniforms-distanceMult-value={distanceMult}
        />
      </mesh> */}
      {/* <Box position={[0, 0, 0]}>
        <meshBasicMaterial ref={materialRef} map={target.texture} />
      </Box> */}
      {createPortal(<DusenScreen />, bufferScene)}
    </>
  );
}

export default function FBO() {
  return (
    <Page>
      <FiberScene controls camera={{ position: [0, 20, 20] }}>
        <ScreenQuadScene />
      </FiberScene>
    </Page>
  );
}
