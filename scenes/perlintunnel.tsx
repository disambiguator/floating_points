import { FlyControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import React from 'react';
import * as THREE from 'three';
import { GLSL3, PerspectiveCamera, Vector3 } from 'three';
import { scaleExponential } from 'lib/helpers';
import { useRefState } from 'lib/hooks';
import { scaleMidi } from 'lib/midi';
import fragmentShader from 'lib/shaders/perlintunnel.frag';
import { type Config, useSpectrum } from '../lib/store';

const uniforms = {
  aspect: { value: 0 },
  time: { value: 0 },
  amp: { value: 1 },
  camera_position: { value: new Vector3(0) },
  band: { value: 0.1 },
  starting_distance: { value: 1.0 },
  band_center: { value: 0.5 },
  camToWorldMat: { value: new THREE.Matrix4() },
  camInvProjMat: { value: new THREE.Matrix4() },
  camTanFov: { value: 0 },
};
const vertexShader = `
    out vec2 vUV;
    void main() {

     vec4 worldPos = modelViewMatrix * vec4(position, 1.0);
    vec3 viewDir = normalize(-worldPos.xyz);

    gl_Position = projectionMatrix * worldPos;

    // Output UV
    vUV = uv;
    }
    `;

let cameraForwardPos = new THREE.Vector3(0, 0, -1);
const VECTOR3ZERO = new THREE.Vector3(0, 0, 0);

const Bars = React.memo(function Bars() {
  const camera = useThree((t) => t.camera as PerspectiveCamera);
  const [speed, setSpeed] = useRefState(1);
  const planeRef = React.useRef<THREE.Mesh>(null);

  React.useEffect(() => {
    camera.fov = 75;
    camera.near = 0.1;
    camera.far = 1000;

    const screenPlane = planeRef.current!;

    const nearPlaneWidth =
      camera.near *
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
      camera.aspect *
      2;
    const nearPlaneHeight = nearPlaneWidth / camera.aspect;
    screenPlane.scale.set(nearPlaneWidth, nearPlaneHeight, 1);

    uniforms.camera_position.value = camera.position;
    uniforms.camToWorldMat.value = camera.matrixWorld;
    uniforms.camInvProjMat.value = camera.projectionMatrixInverse;

    // const light = lightRef.current!;
    // uniforms.lightDir.value = light.position;
    // uniforms.lightColor.value = light.color;
  }, [camera]);

  useFrame((_, delta) => {
    uniforms.time.value += delta * speed.current;
    // const { volume } = useStore.getState().spectrum;
    // if (volume) {
    //   shader.uniforms.amp.value = scaleMidi(volume, 0, 2);
    // }

    // Update screen plane position and rotation
    cameraForwardPos = camera.position
      .clone()
      .add(camera.getWorldDirection(VECTOR3ZERO).multiplyScalar(camera.near));
    const screenPlane = planeRef.current!;
    screenPlane.position.copy(cameraForwardPos);
    screenPlane.rotation.copy(camera.rotation);
  });

  const [, setControls] = useControls('raymarch', () => ({
    band: {
      value: 1.0,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        uniforms.band.value = scaleMidi(v, 0.00000001, 0.7);
      },
    },
    amp: {
      value: 1.0,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        uniforms.amp.value = scaleMidi(v, 0.0, 0.5);
      },
    },
    starting_distance: {
      value: 1,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        uniforms.starting_distance.value = scaleExponential(v, 0, 127, 0, 20);
      },
    },
    band_center: {
      value: 0.5,
      min: 0,
      max: 127,
      onChange: (v: number) => {
        uniforms.band_center.value = 1 - scaleMidi(v, 0, 1);
      },
    },
    speed: {
      value: 1,
      min: 0,
      max: 2,
      onChange: setSpeed,
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
    <mesh ref={planeRef}>
      <planeGeometry args={[1, 1, Math.trunc(camera.aspect * 32), 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        glslVersion={GLSL3}
      />
    </mesh>
  );
});

export const perlinTunnelConfig = {
  Contents: Bars,
  name: 'perlintunnel',
  controls: (
    <FlyControls makeDefault movementSpeed={30} rollSpeed={0.8} dragToLook />
  ),
} as const satisfies Config;
