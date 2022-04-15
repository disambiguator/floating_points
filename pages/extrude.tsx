import { Effects, Sphere } from '@react-three/drei';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AfterimagePass, ShaderPass } from 'three-stdlib';
import Page from 'components/page';
import { FiberScene } from 'components/scene';

extend({ AfterimagePass });

const shader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: /* glsl */ `
  precision highp float;

  uniform float aspect;
  uniform sampler2D video;
  varying vec2 vUv;

  uniform sampler2D tOld;
  uniform sampler2D tNew;

  float circ(vec2 p, float radius) {
    return smoothstep(-0.2, 0.2, radius - length(p - 0.5));
  }

  float logn(float a,float b) { return log(a)/log(b); }

  void main() {
    vec2 p = vUv;
    // vec2 p = vUv * 2. - 1.;

    // tunnel and zoom
    float zoom = 0.999;
    // vec2 scaleCenter = vec2(0.5);
    // p = (p - scaleCenter) * zoom + scaleCenter;

    // float fracttime = fract(time);
    float fracttime = 0.1;
    float in_scale = .9; //How deep?
    float d; vec2 zuv;
    zuv = p*pow(in_scale,fracttime); //Zooming
    d = (max(abs(zuv.x),abs(zuv.y))*2.); //Square dist
    float id = floor(logn(d,in_scale));
    p = (zuv/pow(in_scale,id))+.5;

    vec4 texelNew = texture2D(tNew, vUv);
    vec4 texelOld = texture2D(tOld, p);

    gl_FragColor = texelNew.a > 0.99 ? texelNew : texelOld;
  }
 `,
  uniforms: {
    tOld: { value: null },
    tNew: { value: null },
    damp: { value: 0 },
  },
};

const Quad = () => {
  return (
    <Effects>
      <afterimagePass attachArray="passes" args={[0.98, shader]} />
    </Effects>
  );
};

const Ball = () => {
  const sphereRef = useRef<typeof Sphere>();

  useFrame(({ clock }) => {
    sphereRef.current!.position.x = Math.sin(5 * clock.elapsedTime);
    sphereRef.current!.position.y = Math.cos(5 * clock.elapsedTime);
  });

  return (
    <Sphere ref={sphereRef} args={[0.5]}>
      <meshStandardMaterial />
    </Sphere>
  );
};

const Light = () => {
  const groupRef = useRef<THREE.Group>();
  const lightRef = useRef<THREE.PointLight>();

  useFrame(() => {
    lightRef.current!.color = new THREE.Color(
      Math.random(),
      Math.random(),
      Math.random(),
    );
    // groupRef.current!.position.x = 30 * Math.random() - 15;
    // groupRef.current!.position.y = 30 * Math.random() - 15;
    // groupRef.current!.position.z = 30 * Math.random() - 15;
  });

  return (
    <group ref={groupRef}>
      <pointLight ref={lightRef} position={[0, 0, 0.7]} />
    </group>
  );
};

export default function ShaderPage() {
  return (
    <Page>
      <FiberScene controls>
        <Light />
        {/* <ambientLight args={[undefined, 0.03]} /> */}
        <Ball />
        <Quad />
      </FiberScene>
    </Page>
  );
}
